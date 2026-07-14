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

  function cardHTML(product, cfg) {
    var url = "/products/" + encodeURIComponent(product.handle);
    var html = '<div class="shipboost__rec-card" role="listitem">';

    if (cfg.showImage) {
      html +=
        '<a class="shipboost__rec-image-link" href="' +
        esc(url) +
        '" tabindex="-1" aria-hidden="true">';
      if (product.image) {
        html +=
          '<img class="shipboost__rec-image" src="' +
          esc(product.image) +
          '" alt="" loading="lazy">';
      } else {
        html +=
          '<span class="shipboost__rec-image shipboost__rec-image--empty"></span>';
      }
      html += "</a>";
    }

    html +=
      '<a class="shipboost__rec-title" href="' +
      esc(url) +
      '">' +
      esc(product.title) +
      "</a>";

    if (cfg.showPrice) {
      html +=
        '<span class="shipboost__rec-price">' +
        esc(formatMoney(product.price, cfg.currency)) +
        "</span>";
    }

    if (cfg.showButton) {
      html +=
        '<button type="button" class="shipboost__rec-btn" data-variant-id="' +
        esc(product.variantId) +
        '">Add to cart</button>';
    }

    html += "</div>";
    return html;
  }

  function renderContainer(container, totalCents, inCartVariants) {
    var cfg = readConfig(container);
    var list = container.querySelector(".shipboost__recs-list");
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
        return cardHTML(p, cfg);
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

  /* ---- init ---------------------------------------------------------------- */
  function init() {
    var containers = document.querySelectorAll("[data-shipboost-recs]");
    if (!containers.length) return;

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
    document.addEventListener("click", function (event) {
      var target = event.target;
      var btn =
        target && target.closest
          ? target.closest(".shipboost__rec-btn")
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
