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
  "none",
  "above-add-to-cart",
  "below-add-to-cart",
] as const;

export type Position = (typeof POSITIONS)[number];

export const DEFAULT_POSITION: Position = "below-add-to-cart";

export const POSITION_OPTIONS: { value: Position; label: string }[] = [
  { value: "none", label: "Below Header" },
  { value: "above-add-to-cart", label: "Above Add to Cart Button" },
  { value: "below-add-to-cart", label: "Below Add to Cart Button" },
];

export function isPosition(value: unknown): value is Position {
  return (
    typeof value === "string" && (POSITIONS as readonly string[]).includes(value)
  );
}

/* ---- Bar width ------------------------------------------------------------ */

export const WIDTH_MODES = ["full", "content", "custom"] as const;

export type WidthMode = (typeof WIDTH_MODES)[number];

// Default is "content" (fills the placement's container), NOT "full": "full" is
// a top-level announcement bar (see the storefront JS), so making it the default
// would move every existing below-ATC bar up to the header. Merchants opt into
// Full Width explicitly.
export const DEFAULT_WIDTH_MODE: WidthMode = "content";

export const WIDTH_MODE_OPTIONS: { value: WidthMode; label: string }[] = [
  { value: "full", label: "Full Width" },
  { value: "content", label: "Content Width" },
  { value: "custom", label: "Custom Width" },
];

export function isWidthMode(value: unknown): value is WidthMode {
  return (
    typeof value === "string" &&
    (WIDTH_MODES as readonly string[]).includes(value)
  );
}

// Custom width, as a percentage of the available width. The bar stays centered.
export const CUSTOM_WIDTH_MIN = 30;
export const CUSTOM_WIDTH_MAX = 100;
export const DEFAULT_CUSTOM_WIDTH = 100;

/* ---- Sticky position ------------------------------------------------------ */

export const STICKY_POSITIONS = ["normal", "sticky-top"] as const;

export type StickyPosition = (typeof STICKY_POSITIONS)[number];

export const DEFAULT_STICKY_POSITION: StickyPosition = "normal";

export const STICKY_POSITION_OPTIONS: { value: StickyPosition; label: string }[] =
  [
    { value: "normal", label: "Normal" },
    { value: "sticky-top", label: "Sticky Top" },
  ];

export function isStickyPosition(value: unknown): value is StickyPosition {
  return (
    typeof value === "string" &&
    (STICKY_POSITIONS as readonly string[]).includes(value)
  );
}
