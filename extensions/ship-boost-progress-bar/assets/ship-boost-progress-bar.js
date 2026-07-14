/*
 * ShipBoost — Free Shipping Progress Bar (storefront).
 *
 * Applies every saved setting on the live storefront:
 *  - Placement: relocates the bar to a well-known theme anchor for the selected
 *    Position, with robust selectors and a MutationObserver for themes (Dawn and
 *    other Online Store 2.0 themes) that render content dynamically. Falls back
 *    to the block's original location and logs a warning if no anchor is found.
 *  - Visibility: enforces Display On (which pages) as a safety net in JS.
 *  - Duplicates: renders only ONE bar even if the app block was added in several
 *    places.
 *  - Progress: reads the live cart and re-renders on cart changes.
 *
 * No dependencies.
 */
(function () {
  "use strict";

  // Initialize once per page.
  if (window.__shipBoostLoaded) return;
  window.__shipBoostLoaded = true;

  var CART_MUTATION = /\/cart\/(add|change|update|clear)/;

  function warn(message) {
    try {
      if (window.console && console.warn) {
        console.warn("[ShipBoost] " + message);
      }
    } catch (e) {
      /* no-op */
    }
  }

  /* ---- Fonts -------------------------------------------------------------- */
  var loadedFonts = {};
  function loadFont(name) {
    if (!name) return;
    var key = name.toLowerCase();
    if (loadedFonts[key]) return;
    loadedFonts[key] = true;
    var href =
      "https://fonts.googleapis.com/css2?family=" +
      name.replace(/ /g, "+") +
      ":wght@400;500;600;700&display=swap";
    if (document.querySelector('link[href="' + href + '"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  /* ---- Display On (which pages) ------------------------------------------- */
  // Prefer the server value (data-page-type from request.page_type); fall back
  // to URL detection so visibility is enforced even if it's unavailable.
  function currentPageType(el) {
    var declared = el.getAttribute("data-page-type");
    if (declared) return declared;
    var path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
    if (path.indexOf("/products/") !== -1) return "product";
    if (path === "/cart" || path.indexOf("/cart/") !== -1) return "cart";
    // Root, or a locale root like /en or /en-us.
    if (path === "" || /^\/[a-z]{2}(-[a-z]{2})?$/.test(path)) return "index";
    return "other";
  }

  function allowedOnPage(displayOn, type) {
    switch (displayOn) {
      case "home":
        return type === "index";
      case "product":
        return type === "product";
      case "cart":
        return type === "cart";
      case "product-cart":
        return type === "product" || type === "cart";
      case "all":
      default:
        return true;
    }
  }

  /* ---- Position ----------------------------------------------------------- */
  // Each position is an ordered list of placement candidates. A candidate is a
  // { sel, where } pair: `sel` is a selector for a well-known theme anchor and
  // `where` says how to place the bar relative to it:
  //   before  / after   -> as a sibling just before / after the anchor
  //   prepend / append   -> as the first / last child INSIDE the anchor
  // Candidates are tried in order until one matches, so more specific/robust
  // anchors win and looser fallbacks apply only when needed. Covers Dawn and
  // common Online Store 2.0 themes.
  //
  // Each placement has its OWN dedicated anchors:
  //   - Below Header             -> after the site header (site-wide, top-level)
  //   - Above Add to Cart Button -> before the Add to Cart button
  //   - Below Add to Cart Button -> after the buttons
  // The Add to Cart placements fall back to Below Header on pages with no
  // product form (cart, home, collection). Width and Sticky are independent of
  // placement — Position alone decides where the bar is inserted.
  var BUTTON_WRAPPER = [".product-form__buttons", ".product-form__cart"];
  var ADD_TO_CART = [
    "[name='add']",
    ".product-form__submit",
    ".shopify-payment-button",
  ];
  // Wide, last-resort anchors (the whole form). Used only when no button
  // wrapper is present.
  var PRODUCT_FORM = [
    "product-form",
    "form[action*='/cart/add']",
    ".product-form",
  ];

  function rules(selectors, where) {
    return selectors.map(function (sel) {
      return { sel: sel, where: where };
    });
  }
  function concat() {
    return Array.prototype.concat.apply([], arguments);
  }

  // Site header / navigation — anchor for the "Below Header" (none) placement,
  // which is site-wide (present on every page that has a header). Full Width and
  // Sticky Top also use it so the bar is a top-level, viewport-wide block.
  var SITE_HEADER = [
    "#shopify-section-header",
    ".shopify-section-header",
    ".header-wrapper",
    "sticky-header",
    ".site-header",
    "header.header",
    "header[role='banner']",
    "header",
  ];

  var POSITION_ANCHORS = {
    // Below Header — immediately below the site header/navigation, as a
    // top-level block. Site-wide, so it honours Display On on every page.
    none: rules(SITE_HEADER, "after"),
    // Inside the button wrapper first (width matches the buttons); otherwise
    // directly before the Add to Cart button; the wide form is the last resort.
    // Final fallback: below the header — so on pages with no product form (cart,
    // home, collection) the bar still renders prominently instead of at the very
    // bottom of <body> where the app embed injected it.
    "above-add-to-cart": concat(
      rules(BUTTON_WRAPPER, "prepend"),
      rules(ADD_TO_CART, "before"),
      rules(PRODUCT_FORM, "before"),
      rules(SITE_HEADER, "after"),
    ),
    "below-add-to-cart": concat(
      rules(BUTTON_WRAPPER, "append"),
      rules(PRODUCT_FORM.concat(["[name='add']"]), "after"),
      rules(SITE_HEADER, "after"),
    ),
  };

  // First candidate whose anchor exists (and isn't the bar itself). A candidate
  // is either { sel } (query the DOM) or { resolve } (compute the anchor).
  // Returns the matched { anchor, where }, or null if none are present.
  function findAnchor(candidates) {
    for (var i = 0; i < candidates.length; i++) {
      var candidate = candidates[i];
      var anchor = candidate.resolve
        ? candidate.resolve()
        : document.querySelector(candidate.sel);
      if (anchor && !anchor.classList.contains("shipboost")) {
        return { anchor: anchor, where: candidate.where };
      }
    }
    return null;
  }

  // Is the bar already in the desired spot? Used to avoid needless DOM moves
  // (and observer loops).
  function isPlaced(el, anchor, where) {
    if (where === "before") return el.nextElementSibling === anchor;
    if (where === "after") return el.previousElementSibling === anchor;
    if (where === "prepend") return anchor.firstElementChild === el;
    if (where === "append") return anchor.lastElementChild === el;
    return false;
  }

  function place(el, anchor, where) {
    try {
      if (where === "before") {
        anchor.parentNode.insertBefore(el, anchor);
      } else if (where === "after") {
        anchor.parentNode.insertBefore(el, anchor.nextSibling);
      } else if (where === "prepend") {
        anchor.insertBefore(el, anchor.firstChild);
      } else if (where === "append") {
        anchor.appendChild(el);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function ensurePlaced(el, candidates) {
    var match = findAnchor(candidates);
    if (!match) return false;
    var anchor = match.anchor;
    var where = match.where;
    if (anchor === el) return true;
    if (isPlaced(el, anchor, where)) return true; // already correct — no-op
    // Never insert the bar into one of its own descendants (would throw).
    if ((where === "prepend" || where === "append") && el.contains(anchor)) {
      return true;
    }
    place(el, anchor, where);
    return true;
  }

  function positionBar(el) {
    // Position alone determines WHERE the bar is inserted. Width and Sticky are
    // fully independent: width is applied purely by CSS class (--sb-width /
    // sb-width-*), and Sticky Top is CSS `position: sticky` at whatever spot this
    // places the bar. Neither overrides the placement.
    var position = el.getAttribute("data-position");
    var candidates = POSITION_ANCHORS[position];
    if (!candidates) return; // unknown/none — leave where the merchant placed it

    var found = ensurePlaced(el, candidates);

    // Watch for late/dynamic anchors (variant swaps, cart drawers, AJAX section
    // renders) and keep the bar attached if the theme re-renders its section.
    // ensurePlaced is a no-op when already correct, so this can't loop.
    //
    // The callback is coalesced to at most one placement check per animation
    // frame, so bursts of DOM mutations (image lazy-load, section re-renders,
    // third-party scripts) never add measurable overhead to the storefront.
    try {
      var scheduled = false;
      var runPlacement = function () {
        scheduled = false;
        ensurePlaced(el, candidates);
      };
      var observer = new MutationObserver(function () {
        if (scheduled) return;
        scheduled = true;
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(runPlacement);
        } else {
          setTimeout(runPlacement, 100);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {
      /* MutationObserver unavailable — the initial attempt still applies */
    }

    // If no anchor showed up, warn once and keep the fallback location.
    if (!found) {
      setTimeout(function () {
        if (!findAnchor(candidates)) {
          warn(
            'Placement target for "' +
              position +
              '" was not found in this theme. The bar is shown in its default location instead.',
          );
        }
      }, 4000);
    }
  }

  /* ---- Progress rendering ------------------------------------------------- */
  function formatMoney(cents, currency) {
    var amount = (cents || 0) / 100;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency || "USD",
      }).format(amount);
    } catch (e) {
      return "$" + amount.toFixed(2);
    }
  }

  function render(el, totalCents) {
    if (typeof totalCents !== "number" || !isFinite(totalCents)) totalCents = 0;
    var goal = parseInt(el.getAttribute("data-goal"), 10) || 0;
    var currency = el.getAttribute("data-currency") || "USD";
    var remainingTpl = el.getAttribute("data-remaining-message") || "";
    var successMsg = el.getAttribute("data-success-message") || "";

    var remaining = Math.max(goal - totalCents, 0);
    var reached = goal > 0 && totalCents >= goal;
    var percent = goal > 0 ? Math.min((totalCents / goal) * 100, 100) : 0;

    var message = el.querySelector(".shipboost__message");
    var fill = el.querySelector(".shipboost__fill");
    var track = el.querySelector(".shipboost__track");

    if (reached) {
      el.classList.add("is-complete");
      percent = 100;
      if (message) message.textContent = successMsg;
    } else {
      el.classList.remove("is-complete");
      if (message) {
        // Replace EVERY {{remaining}} token (the Liquid `replace` filter is
        // global; keep the live JS update consistent with the server render).
        message.textContent = remainingTpl
          .split("{{remaining}}")
          .join(formatMoney(remaining, currency));
      }
    }

    if (fill) fill.style.width = percent + "%";
    if (track) {
      track.setAttribute("aria-valuemax", String(goal));
      track.setAttribute("aria-valuenow", String(totalCents));
      // Announce the human-readable message (currency context) to screen
      // readers instead of only the computed percentage.
      track.setAttribute(
        "aria-valuetext",
        message ? message.textContent : "",
      );
    }
  }

  function refresh() {
    var bars = document.querySelectorAll(".shipboost");
    if (!bars.length) return;

    fetch("/cart.js", { headers: { Accept: "application/json" } })
      .then(function (res) {
        return res.json();
      })
      .then(function (cart) {
        bars.forEach(function (el) {
          render(el, cart.total_price);
        });
        // Broadcast the fresh cart so the (optional) recommendations script can
        // re-rank/re-render without duplicating this fetch + the cart watchers.
        try {
          document.dispatchEvent(
            new CustomEvent("shipboost:cart-updated", { detail: cart }),
          );
        } catch (e) {
          /* CustomEvent unsupported — recs fall back to their own listeners */
        }
      })
      .catch(function () {
        /* keep the server-rendered state on failure */
      });
  }

  function watchCartChanges() {
    if (window.fetch) {
      var nativeFetch = window.fetch;
      window.fetch = function () {
        var url = arguments[0];
        url = (url && url.url) || url || "";
        return nativeFetch.apply(this, arguments).then(function (res) {
          if (CART_MUTATION.test(String(url))) setTimeout(refresh, 50);
          return res;
        });
      };
    }

    var nativeOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (CART_MUTATION.test(String(url))) {
        this.addEventListener("load", function () {
          setTimeout(refresh, 50);
        });
      }
      return nativeOpen.apply(this, arguments);
    };

    ["cart:updated", "cart:refresh", "cart:change"].forEach(function (name) {
      document.addEventListener(name, refresh);
    });
  }

  /* ---- Content width (match the theme's content container) ---------------- */
  // Well-known content-container selectors across Dawn and other Online Store
  // 2.0 themes. We match the FIRST one that is actually constrained (narrower
  // than the viewport, i.e. it has real side margins) so the bar lines up with
  // the theme's page content instead of stretching almost full-width.
  var CONTENT_SELECTORS = [
    ".page-width",
    ".page-width--narrow",
    ".container",
    ".site-width",
    ".shopify-section .page-width",
    ".wrapper",
  ];

  function themeContentWidth(el) {
    var vw = window.innerWidth || document.documentElement.clientWidth || 0;
    if (!vw) return 0;
    for (var i = 0; i < CONTENT_SELECTORS.length; i++) {
      var nodes = document.querySelectorAll(CONTENT_SELECTORS[i]);
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        if (node === el || node.contains(el)) continue;
        var w = node.getBoundingClientRect().width;
        // A real content container is narrower than the viewport (has margins).
        if (w > 0 && w < vw - 1) return Math.round(w);
      }
    }
    return 0;
  }

  // For "Content Width" mode, size the bar to the theme's content container and
  // let the CSS keep it centered. Falls back to the CSS max-width if no
  // container is found. No-op for Full/Custom width.
  function applyContentWidth(el) {
    if (!el || el.getAttribute("data-width-mode") !== "content") return;
    var w = themeContentWidth(el);
    el.style.maxWidth = w > 0 ? w + "px" : "";
  }

  // Note: "Full Width" needs NO JS. It is plain width:100% in normal document
  // flow — its true viewport width comes from the placement (Below Header
  // re-parents the bar to a top-level block via positionBar, like an
  // announcement bar). No negative margins / viewport breakout.

  // Re-measure on resize (coalesced to one check per frame) so the bar keeps
  // matching the theme container as the viewport changes.
  var resizeScheduled = false;
  function onResize() {
    if (resizeScheduled) return;
    resizeScheduled = true;
    var run = function () {
      resizeScheduled = false;
      applyContentWidth(document.querySelector(".shipboost"));
    };
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(run);
    } else {
      setTimeout(run, 100);
    }
  }

  /* ---- Init --------------------------------------------------------------- */
  function init() {
    var bars = Array.prototype.slice.call(
      document.querySelectorAll(".shipboost"),
    );
    if (!bars.length) return;

    // Render only one instance, even if the block was added in several places.
    var bar = bars[0];
    for (var i = 1; i < bars.length; i++) {
      if (bars[i].parentNode) bars[i].parentNode.removeChild(bars[i]);
    }

    // Enforce Display On (safety net on top of the Liquid page gate).
    var displayOn = bar.getAttribute("data-display-on") || "all";
    if (!allowedOnPage(displayOn, currentPageType(bar))) {
      if (bar.parentNode) bar.parentNode.removeChild(bar);
      return;
    }

    loadFont(bar.getAttribute("data-font-family"));
    positionBar(bar);
    applyContentWidth(bar);
    window.addEventListener("resize", onResize);
    watchCartChanges();
    refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
