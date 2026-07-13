# ShipBoost — QA Checklist

Pre-submission quality assurance. Execute against a **development store** with a
published Online Store 2.0 theme (test Dawn + at least one non-Dawn theme).

Legend: `[ ]` to do · `[~]` verified by code review · `[x]` passed on a store

> **Prerequisite:** The embedded app must load `/app` (the OAuth / session-token
> handshake must complete). Items marked **(needs auth)** cannot be exercised
> until the app opens inside Admin. Storefront-only items do **not** need auth.

---

## 1. Installation
- [ ] App installs from the install link without errors **(needs auth)**
- [ ] First open lands on the dashboard (`/app`) **(needs auth)**
- [~] A default `ShipBoostSetting` row is created on first settings load (`getSettings` upserts defaults)
- [ ] `read_themes` scope is granted during install (matches `shopify.app.toml`)
- [ ] Required env vars present — boot fails fast with a clear message if not (`validateEnv`)

## 2. Uninstall
- [ ] Uninstall from Admin succeeds
- [~] `app/uninstalled` webhook fires and deletes the shop's `Session` rows
- [ ] Note: `ShipBoostSetting` intentionally persists until `shop/redact` (see §Reinstall / GDPR)
- [ ] No orphaned storefront assets remain (bar disappears once the block/app is removed)

## 3. Reinstall
- [ ] Reinstalling the app succeeds **(needs auth)**
- [ ] Previously saved settings are still present (row was retained) **or** defaults appear if `shop/redact` had run
- [ ] Dashboard + Settings load normally after reinstall **(needs auth)**

## 4. Settings persistence
- [ ] Change each field and Save → success toast; values persist after reload **(needs auth)**
- [ ] Invalid input blocks save with inline error + error toast (empty message, 200+ char message, negative/zero goal, out-of-range radius/height)
- [ ] "Reset to defaults" restores defaults, **keeps the shop currency**, marks dirty; Save persists
- [ ] "Discard" reverts to last saved
- [ ] Save/Discard/Reset disabled while saving (loading state)
- [~] Saved values are mirrored to the `$app:shipboost/settings` metafield (JSON) for the storefront
- [~] Validation logic covered by automated unit tests (`npm test`)

## 5. Theme Extension
- [ ] Add "ShipBoost Progress Bar" block via Theme Editor → Add block → Apps
- [ ] Bar renders on the product page at each **Position** (above/below product info, above/below Add to Cart)
- [ ] Correct **Template** style applied (modern/glass/gradient/minimal/luxury/neon)
- [ ] Colors, radius, height, typography reflect saved settings
- [ ] Adding the block twice still renders only ONE bar (dedupe)
- [ ] Placement falls back gracefully + logs a console warning if no anchor is found (non-Dawn theme)
- [ ] Removing the block removes the bar

## 6. Dashboard
- [ ] Setup checklist reflects real settings state (goal/enabled/device) **(needs auth)**
- [ ] "Finish setting up" warning banner shows when not ready; hides when ready
- [ ] "Last step: add ShipBoost to your theme" info banner shows when ready, with working Theme Editor + Preview links
- [ ] Live-theme tile shows the current theme name/status (or "Unavailable" on query failure)
- [ ] Live preview matches the storefront rendering

## 7. Responsive behavior (storefront)
- [ ] Bar is full-width within its container on mobile and desktop
- [ ] "Enable on mobile" off → hidden < 750px; "Enable on desktop" off → hidden ≥ 750px
- [ ] No horizontal overflow / layout shift on narrow viewports
- [ ] Text/message wraps cleanly at small widths

## 8. Cross-browser compatibility (storefront + admin)
- [ ] Chrome — storefront bar + admin settings
- [ ] Safari — incl. `-webkit-backdrop-filter` (glass template) and animations
- [ ] Firefox
- [ ] Edge
- [ ] iOS Safari + Android Chrome (mobile)
- [ ] `prefers-reduced-motion` disables gradient/neon animation

## 9. Storefront functionality
- [ ] Bar shows correct remaining amount vs. the free-shipping goal
- [ ] Adding to cart updates the bar live (no page reload)
- [ ] Reaching the goal shows the success message + 100% fill + success color
- [ ] `{{remaining}}` token replaced everywhere it appears (server + live update)
- [ ] Screen reader announces the currency-aware message (`aria-valuetext`) and progress
- [ ] **Display On** page rules honored (home / product / cart / product+cart / all)
- [ ] Multi-currency store: verify amounts (⚠️ test a zero-decimal currency e.g. JPY — see Known Checks)

---

## Automated tests
Run: `npm test` (Node ≥ 22.6 — bundles `*.test.ts` via esbuild, runs `node:test`; no framework dependency).

Current coverage (17 tests):
- `validate.ts` — goal, message length (incl. Phase-1 cap), radius/height ranges, color normalization
- `color.ts` — hex normalization, contrast ratio, readable-text-color selection

Future (optional): Playwright storefront E2E (Playwright is available in the workspace) for §5/§7/§9.

## Known checks / risks to confirm on a store
- **Zero/three-decimal currencies (JPY, KWD):** confirm the `×100` (Liquid) / `÷100` (JS) subunit math renders correct amounts before relying on it.
- **Non-Dawn placement:** confirm anchors resolve on at least one non-Dawn OS 2.0 theme.
- **Auth handshake:** all "(needs auth)" items are gated on the embedded app loading.
