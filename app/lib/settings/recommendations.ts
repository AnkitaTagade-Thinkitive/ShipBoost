/**
 * Product Recommendations settings.
 *
 * Single source of truth shared by the admin dropdowns, validation, defaults,
 * the live preview and the storefront — mirrors `placement.ts` / `typography.ts`.
 * Recommendations are OFF by default, so existing merchants are unchanged until
 * they opt in.
 */

/* ---- Recommendation source ------------------------------------------------ */

export const RECOMMENDATION_SOURCES = [
  "smart",
  "best-sellers",
  "collection",
  "manual",
] as const;

export type RecommendationSource = (typeof RECOMMENDATION_SOURCES)[number];

export const DEFAULT_RECOMMENDATION_SOURCE: RecommendationSource = "smart";

export const RECOMMENDATION_SOURCE_OPTIONS: {
  value: RecommendationSource;
  label: string;
}[] = [
  { value: "smart", label: "Smart Match (Recommended)" },
  { value: "best-sellers", label: "Best Sellers" },
  { value: "collection", label: "Collection" },
  { value: "manual", label: "Manual Products" },
];

export function isRecommendationSource(
  value: unknown,
): value is RecommendationSource {
  return (
    typeof value === "string" &&
    (RECOMMENDATION_SOURCES as readonly string[]).includes(value)
  );
}

/* ---- Layout ---------------------------------------------------------------
   REMOVED. The storefront now uses two fixed, placement-based components (a
   single-product header scroller and a stacked product-page list), so a
   merchant-facing Layout setting would have no effect. See the storefront CSS
   (ship-boost-recommendations.css) for the two components. */

/* ---- Maximum products ----------------------------------------------------- */

export const RECOMMENDATION_MAX_MIN = 1;
export const RECOMMENDATION_MAX_MAX = 4;
export const DEFAULT_RECOMMENDATION_MAX = 3;

export const RECOMMENDATION_MAX_OPTIONS = [1, 2, 3, 4] as const;
