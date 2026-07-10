/**
 * Colour helpers shared by validation (persistence) and the live preview.
 *
 * Normalizing at persistence is the root-cause fix for colours that render
 * inconsistently: the canonical stored value always carries a leading "#", so
 * the admin preview and the storefront read the exact same value.
 */

/** Ensure a hex colour carries a leading "#". Empty input is returned as-is. */
export function normalizeHexColor(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return trimmed;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null;
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * WCAG contrast ratio (1–21) between two hex colours, or `null` if either is
 * not a parseable hex colour.
 */
export function contrastRatio(a: string, b: string): number | null {
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  if (!rgbA || !rgbB) return null;
  const lumA = relativeLuminance(rgbA);
  const lumB = relativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

// Readability extremes for the automatic light/dark text switch.
export const READABLE_LIGHT = "#ffffff";
export const READABLE_DARK = "#1a1a1a";

/**
 * Pick a text colour that stays readable on `background`.
 * - Keeps `preferred` when it already meets `minContrast` (so the merchant's
 *   own colour is shown whenever it's legible).
 * - Otherwise returns whichever of light/dark contrasts better with the
 *   background (light text on dark, dark text on light).
 */
export function readableTextColor(
  background: string,
  preferred: string,
  minContrast = 4.5,
): string {
  const preferredRatio = contrastRatio(preferred, background);
  if (preferredRatio !== null && preferredRatio >= minContrast) {
    return preferred;
  }
  const lightRatio = contrastRatio(READABLE_LIGHT, background) ?? 0;
  const darkRatio = contrastRatio(READABLE_DARK, background) ?? 0;
  return lightRatio >= darkRatio ? READABLE_LIGHT : READABLE_DARK;
}
