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

/* ---- Layout --------------------------------------------------------------- */

export const RECOMMENDATION_LAYOUTS = [
  "horizontal",
  "vertical",
  "carousel",
] as const;

export type RecommendationLayout = (typeof RECOMMENDATION_LAYOUTS)[number];

export const DEFAULT_RECOMMENDATION_LAYOUT: RecommendationLayout = "horizontal";

export const RECOMMENDATION_LAYOUT_OPTIONS: {
  value: RecommendationLayout;
  label: string;
}[] = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
  { value: "carousel", label: "Carousel" },
];

export function isRecommendationLayout(
  value: unknown,
): value is RecommendationLayout {
  return (
    typeof value === "string" &&
    (RECOMMENDATION_LAYOUTS as readonly string[]).includes(value)
  );
}

/* ---- Maximum products ----------------------------------------------------- */

export const RECOMMENDATION_MAX_MIN = 1;
export const RECOMMENDATION_MAX_MAX = 4;
export const DEFAULT_RECOMMENDATION_MAX = 3;

export const RECOMMENDATION_MAX_OPTIONS = [1, 2, 3, 4] as const;
