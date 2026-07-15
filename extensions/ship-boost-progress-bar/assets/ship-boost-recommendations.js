/*
 * ShipBoost — Product Recommendations (storefront).
 *
 * Renders "Recommended products" cards beneath the progress bar to help the
 * customer reach the free-shipping goal, and keeps them in sync with the cart:
 *   - Reads the compact product list the app published (data-products), so the
 *     storefront makes NO product API calls of its own.
 *   - Smart Match ranks the pool client-side against the live "remaining" amount
 *     (see selectProducts / smartMatch below).
 *   - AJAX Add to cart (/cart/add.js) with no page reload. The bar's cart watcher
 *     broadcasts `shipboost:cart-updated`; this script listens and re-ranks +
 *     re-renders (updated subtotal → new remaining → refreshed recommendations).
 *   - Hide-after-goal: hides the block once the goal is reached (when enabled).
 *
 * Loaded lazily — the Liquid snippet only requests this asset when the merchant
 * enabled recommendations and the app published a product list. No dependencies.
 */
(function () {
  "use strict";

  if (window.__shipBoostRecsLoaded) return;
  window.__shipBoostRecsLoaded = true;

  /* ---- Smart Match ----------------------------------------------------------
     MIRROR of app/lib/recommendations/smart-match.ts — keep the two in sync.
     Unit-agnostic; here both price and remaining are in cents (cart units). */
  var EXPENSIVE_BAND = 0.2;

  function scorePrice(price, remaining) {
    if (!isFinite(remaining) || remaining <= 0) return price;
    var ratio = Math.abs(price - remaining) / remaining;
    var over = price > remaining ? (price - remaining) / remaining : 0;
    var penalty = over > EXPENSIVE_BAND ? over - EXPENSIVE_BAND : 0;
    return ratio + penalty;
  }

  function smartMatch(candidates, remaining, max) {
    if (max <= 0) return [];
    return candidates
      .filter(function (c) {
        return isFinite(c.price) && c.price > 0;
      })
      .map(function (c, i) {
        return { c: c, i: i, s: scorePrice(c.price, remaining) };
      })
      .sort(function (a, b) {
        return a.s - b.s || a.i - b.i;
      })
      .slice(0, max)
      .map(function (e) {
        return e.c;
      });
  }

  /* ---- helpers ------------------------------------------------------------- */
  function parseJSON(str, fallback) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  }

  function bool(value) {
    return String(value) === "true";
  }

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

  var ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ESCAPES[ch];
    });
  }

  function readConfig(container) {
    return {
      component:
        container.getAttribute("data-component") === "header"
          ? "header"
          : "product",
      source: container.getAttribute("data-source") || "smart",
      max: parseInt(container.getAttribute("data-max"), 10) || 3,
      showImage: bool(container.getAttribute("data-show-image")),
      showPrice: bool(container.getAttribute("data-show-price")),
      showButton: bool(container.getAttribute("data-show-button")),
      hideAfterGoal: bool(container.getAttribute("data-hide-after-goal")),
      goal: parseInt(container.getAttribute("data-goal"), 10) || 0,
      currency: container.getAttribute("data-currency") || "USD",
      products: parseJSON(container.getAttribute("data-products"), []) || [],
    };
  }

  // Choose which products to show given the config + live cart state.
  function selectProducts(cfg, remaining, inCartVariants) {
    var pool = cfg.products.filter(function (p) {
      if (!p || !p.variantId) return false;
      if (p.available === false) return false;
      // Never recommend something already in the cart.
      return inCartVariants.indexOf(String(p.variantId)) === -1;
    });
    if (cfg.source === "smart") {
      return smartMatch(pool, remaining, cfg.max);
    }
    // best-sellers / collection / manual — keep the app-published order.
    return pool.slice(0, cfg.max);
  }

  // Build one recommendation item. The MARKUP is identical for both components
  // (image, name, price, button — the shared engine output); only the class
  // namespace differs so each component's CSS block styles it independently.
  // The button carries the `data-sb-rec-add` behaviour hook so the click handler
  // is component-agnostic.
  function itemHTML(product, cfg) {
    var ns =
      cfg.component === "header"
        ? "shipboost-header-recs"
        : "shipboost-product-recs";
    var url = "/products/" + encodeURIComponent(product.handle);
    var html = '<div class="' + ns + '__card" role="listitem">';

    if (cfg.showImage) {
      html +=
        '<a class="' +
        ns +
        '__img-link" href="' +
        esc(url) +
        '" tabindex="-1" aria-hidden="true">';
      if (product.image) {
        html +=
          '<img class="' +
          ns +
          '__img" src="' +
          esc(product.image) +
          '" alt="" loading="lazy">';
      } else {
        html += '<span class="' + ns + '__img ' + ns + '__img--empty"></span>';
      }
      html += "</a>";
    }

    html +=
      '<a class="' +
      ns +
      '__name" href="' +
      esc(url) +
      '">' +
      esc(product.title) +
      "</a>";

    if (cfg.showPrice) {
      html +=
        '<span class="' +
        ns +
        '__price">' +
        esc(formatMoney(product.price, cfg.currency)) +
        "</span>";
    }

    if (cfg.showButton) {
      html +=
        '<button type="button" class="' +
        ns +
        '__btn" data-sb-rec-add data-variant-id="' +
        esc(product.variantId) +
        '">Add to cart</button>';
    }

    html += "</div>";
    return html;
  }

  function renderContainer(container, totalCents, inCartVariants) {
    var cfg = readConfig(container);
    var list = container.querySelector("[data-sb-rec-list]");
    if (!list) return;

    var reached = cfg.goal > 0 && totalCents >= cfg.goal;

    // Hide the whole block once the goal is reached, when the merchant chose to.
    if (reached && cfg.hideAfterGoal) {
      container.classList.add("sb-recs-hidden");
      list.innerHTML = "";
      return;
    }

    var remaining = Math.max(cfg.goal - totalCents, 0);
    var chosen = selectProducts(cfg, remaining, inCartVariants);

    if (!chosen.length) {
      // Nothing left to suggest (e.g. all already in the cart) — hide quietly.
      container.classList.add("sb-recs-hidden");
      list.innerHTML = "";
      return;
    }

    container.classList.remove("sb-recs-hidden");
    list.innerHTML = chosen
      .map(function (p) {
        return itemHTML(p, cfg);
      })
      .join("");
  }

  /* ---- cart state ---------------------------------------------------------- */
  function variantsFromCart(cart) {
    if (!cart || !cart.items) return [];
    return cart.items.map(function (item) {
      return String(item.variant_id);
    });
  }

  function applyCart(totalCents, inCartVariants) {
    var containers = document.querySelectorAll("[data-shipboost-recs]");
    for (var i = 0; i < containers.length; i++) {
      renderContainer(
        containers[i],
        typeof totalCents === "number" ? totalCents : 0,
        inCartVariants || [],
      );
    }
  }

  function refreshAll() {
    fetch("/cart.js", { headers: { Accept: "application/json" } })
      .then(function (res) {
        return res.json();
      })
      .then(function (cart) {
        applyCart(cart.total_price, variantsFromCart(cart));
      })
      .catch(function () {
        /* keep the current cards on failure */
      });
  }

  function addToCart(variantId, button) {
    if (!variantId) return;
    button.disabled = true;
    button.classList.add("is-loading");
    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id: Number(variantId) || variantId, quantity: 1 }),
    })
      .then(function () {
        // The bar's cart watcher also fires on /cart/add and broadcasts
        // shipboost:cart-updated, which re-renders these cards. When the bar
        // script isn't present, refresh here as a safety net.
        if (!window.__shipBoostLoaded) refreshAll();
      })
      .catch(function () {
        /* no-op — button is re-enabled below */
      })
      .then(function () {
        button.disabled = false;
        button.classList.remove("is-loading");
      });
  }

  /* ---- Theme button inheritance ------------------------------------------- */
  // Make the recommendation "Add to cart" button look like the merchant's theme
  // button, with NO hardcoded colours. We find the theme's real Add-to-cart (or
  // a prominent theme button as a fallback), read its COMPUTED styles, and feed
  // them into the `--sb-rec-btn-*` custom properties the CSS consumes. If nothing
  // is found the CSS fallbacks (merchant bar colour) apply. Works on any Online
  // Store 2.0 theme (Dawn, Craft, Sense, Refresh, Ride, Studio, …) because it
  // reads live styles instead of relying on theme-specific class names.
  var THEME_BUTTON_SELECTORS = [
    ".product-form__submit",
    'button[name="add"]',
    '[name="add"]',
    'form[action*="/cart/add"] [type="submit"]',
    ".shopify-payment-button__button--unbranded",
    ".shopify-payment-button__button",
    ".button--primary",
    ".btn--primary",
    ".btn-primary",
    "button.button",
    "a.button",
    ".button",
    ".btn",
  ];

  function isTransparent(color) {
    return (
      !color ||
      color === "transparent" ||
      /rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(color)
    );
  }

  function findThemeButton() {
    for (var i = 0; i < THEME_BUTTON_SELECTORS.length; i++) {
      var els = document.querySelectorAll(THEME_BUTTON_SELECTORS[i]);
      for (var j = 0; j < els.length; j++) {
        var el = els[j];
        // Never sample our own button, and require a visibly-rendered element.
        if (el.closest && el.closest(".shipboost")) continue;
        var rect = el.getBoundingClientRect();
        if (rect.width > 40 && rect.height > 16) return el;
      }
    }
    return null;
  }

  function applyThemeButtonStyle() {
    var ref = findThemeButton();
    if (!ref) return false;
    var containers = document.querySelectorAll("[data-shipboost-recs]");
    if (!containers.length) return false;

    var cs = window.getComputedStyle(ref);
    var props = {
      "--sb-rec-btn-color": cs.color,
      "--sb-rec-btn-bg-image": cs.backgroundImage,
      "--sb-rec-btn-border":
        cs.borderTopWidth + " " + cs.borderTopStyle + " " + cs.borderTopColor,
      "--sb-rec-btn-radius": cs.borderTopLeftRadius,
      "--sb-rec-btn-font-family": cs.fontFamily,
      "--sb-rec-btn-font-weight": cs.fontWeight,
      "--sb-rec-btn-letter-spacing": cs.letterSpacing,
      "--sb-rec-btn-text-transform": cs.textTransform,
      "--sb-rec-btn-shadow": cs.boxShadow,
    };
    // Only override the background colour when the theme button actually has one
    // (skip transparent/ghost buttons so the CTA never renders invisible).
    if (!isTransparent(cs.backgroundColor)) {
      props["--sb-rec-btn-bg-color"] = cs.backgroundColor;
    }

    for (var c = 0; c < containers.length; c++) {
      for (var k in props) {
        if (props[k]) containers[c].style.setProperty(k, props[k]);
      }
    }
    return true;
  }

  // Themes (esp. those that hydrate sections client-side) may render the button
  // after us — retry a couple of times, then give up and keep the fallback.
  function syncThemeButton(attempt) {
    if (applyThemeButtonStyle()) return;
    if (attempt >= 3) return;
    setTimeout(function () {
      syncThemeButton(attempt + 1);
    }, 600 * (attempt + 1));
  }

  /* ---- Header strip: horizontal scroll enhancements (HEADER component only) -
     The header is a single-product horizontal scroller. Touch swipe works
     natively (overflow-x); here we add, for MOUSE users: (1) vertical wheel /
     trackpad → horizontal scroll, and (2) click-and-drag scrolling. The product
     component never gets these — this is bound only to header lists. */
  var headerDragSuppressClick = false;

  function enableHeaderStripScroll(list) {
    if (!list || list.__sbHeaderScroll) return;
    list.__sbHeaderScroll = true;

    // Vertical wheel / trackpad → horizontal scroll, but hand control back to the
    // page once the strip reaches an edge (so the page can still scroll). Snap is
    // suspended while wheeling (mandatory snap would otherwise fight the scroll)
    // and restored shortly after it stops, re-centering on the nearest card.
    var wheelTimer = null;
    list.addEventListener(
      "wheel",
      function (e) {
        if (list.scrollWidth <= list.clientWidth) return;
        var delta =
          Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (!delta) return;
        var atStart = list.scrollLeft <= 0;
        var atEnd =
          list.scrollLeft + list.clientWidth >= list.scrollWidth - 1;
        if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;
        list.classList.add("sb-freescroll");
        list.scrollLeft += delta;
        e.preventDefault();
        if (wheelTimer) clearTimeout(wheelTimer);
        wheelTimer = setTimeout(function () {
          list.classList.remove("sb-freescroll");
        }, 160);
      },
      { passive: false },
    );

    // Mouse click-and-drag to scroll (touch already scrolls natively).
    var down = false,
      startX = 0,
      startScroll = 0,
      moved = 0;
    list.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      moved = 0;
      startX = e.clientX;
      startScroll = list.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 3) {
        moved = Math.abs(dx);
        list.classList.add("sb-dragging");
        list.scrollLeft = startScroll - dx;
      }
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      list.classList.remove("sb-dragging");
      if (moved > 4) {
        // Swallow the click that fires right after a drag so a drag never adds
        // the product to the cart. Reset on the next tick.
        headerDragSuppressClick = true;
        setTimeout(function () {
          headerDragSuppressClick = false;
        }, 0);
      }
    });
  }

  /* ---- init ---------------------------------------------------------------- */
  function init() {
    var containers = document.querySelectorAll("[data-shipboost-recs]");
    if (!containers.length) return;

    // Match the theme's button style (best-effort, with retries + fallback).
    syncThemeButton(0);

    // Enable drag/wheel horizontal scrolling on header strips only.
    for (var h = 0; h < containers.length; h++) {
      if (containers[h].getAttribute("data-component") === "header") {
        enableHeaderStripScroll(
          containers[h].querySelector("[data-sb-rec-list]"),
        );
      }
    }

    // Initial render from the server-provided cart snapshot — no fetch on load.
    var first = containers[0];
    var total = parseInt(first.getAttribute("data-cart-total"), 10) || 0;
    var inCart = (
      parseJSON(first.getAttribute("data-cart-variants"), []) || []
    ).map(String);
    applyCart(total, inCart);

    // Preferred update path: the bar broadcasts a fresh cart after any change.
    document.addEventListener("shipboost:cart-updated", function (event) {
      var cart = (event && event.detail) || {};
      applyCart(cart.total_price || 0, variantsFromCart(cart));
    });

    // Fallback for themes that dispatch their own cart events (no bar present).
    ["cart:updated", "cart:refresh", "cart:change"].forEach(function (name) {
      document.addEventListener(name, refreshAll);
    });

    // Delegate Add to cart clicks (cards are re-rendered, so bind once on doc).
    // Uses the component-agnostic [data-sb-rec-add] hook so both components work.
    document.addEventListener("click", function (event) {
      // Ignore the click that immediately follows a header drag-scroll.
      if (headerDragSuppressClick) {
        headerDragSuppressClick = false;
        return;
      }
      var target = event.target;
      var btn =
        target && target.closest
          ? target.closest("[data-sb-rec-add]")
          : null;
      if (!btn) return;
      event.preventDefault();
      addToCart(btn.getAttribute("data-variant-id"), btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
