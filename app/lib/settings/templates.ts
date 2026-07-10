/**
 * Premium progress-bar templates.
 *
 * Single source of truth shared by the admin dropdown, validation, and the
 * default settings. Each template is applied purely as a CSS modifier class
 * (`.shipboost--<value>`) on the storefront — no functional/JS changes.
 */

export const TEMPLATE_STYLES = [
  "modern",
  "glass",
  "gradient",
  "minimal",
  "luxury",
  "neon",
] as const;

export type TemplateStyle = (typeof TEMPLATE_STYLES)[number];

export const DEFAULT_TEMPLATE: TemplateStyle = "modern";

/** Options for the admin "Template style" dropdown, in display order. */
export const TEMPLATE_OPTIONS: { value: TemplateStyle; label: string }[] = [
  { value: "modern", label: "Modern" },
  { value: "glass", label: "Glass" },
  { value: "gradient", label: "Gradient" },
  { value: "minimal", label: "Minimal" },
  { value: "luxury", label: "Luxury" },
  { value: "neon", label: "Neon" },
];

/** Type guard used to normalize untrusted input (form data / metafield). */
export function isTemplateStyle(value: unknown): value is TemplateStyle {
  return (
    typeof value === "string" &&
    (TEMPLATE_STYLES as readonly string[]).includes(value)
  );
}
