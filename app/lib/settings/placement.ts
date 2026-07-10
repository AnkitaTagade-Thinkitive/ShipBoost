/**
 * Placement & visibility options.
 *
 * Single source of truth shared by the admin dropdowns, validation, defaults,
 * and the live preview — mirrors `templates.ts` / `typography.ts`. Applied on
 * the storefront via server-side page gating, CSS media queries, and graceful
 * JS repositioning (no functional changes to the existing bar).
 */

/* ---- Display on (which pages) --------------------------------------------- */

export const DISPLAY_ON = [
  "all",
  "home",
  "product",
  "cart",
  "product-cart",
] as const;

export type DisplayOn = (typeof DISPLAY_ON)[number];

export const DEFAULT_DISPLAY_ON: DisplayOn = "all";

export const DISPLAY_ON_OPTIONS: { value: DisplayOn; label: string }[] = [
  { value: "all", label: "All Pages" },
  { value: "home", label: "Homepage Only" },
  { value: "product", label: "Product Pages Only" },
  { value: "cart", label: "Cart Page Only" },
  { value: "product-cart", label: "Product + Cart Pages" },
];

export function isDisplayOn(value: unknown): value is DisplayOn {
  return (
    typeof value === "string" && (DISPLAY_ON as readonly string[]).includes(value)
  );
}

/* ---- Position (where on the page) ----------------------------------------- */

export const POSITIONS = [
  "above-product-info",
  "below-product-info",
  "above-add-to-cart",
  "below-add-to-cart",
] as const;

export type Position = (typeof POSITIONS)[number];

export const DEFAULT_POSITION: Position = "below-add-to-cart";

export const POSITION_OPTIONS: { value: Position; label: string }[] = [
  { value: "above-product-info", label: "Above Product Information" },
  { value: "below-product-info", label: "Below Product Information" },
  { value: "above-add-to-cart", label: "Above Add to Cart Button" },
  { value: "below-add-to-cart", label: "Below Add to Cart Button" },
];

export function isPosition(value: unknown): value is Position {
  return (
    typeof value === "string" && (POSITIONS as readonly string[]).includes(value)
  );
}
