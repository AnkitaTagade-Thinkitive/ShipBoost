/**
 * Typography options for the progress-bar message.
 *
 * Single source of truth shared by the admin dropdowns, validation, defaults,
 * and the live preview — mirrors the structure of `templates.ts`. Values are
 * applied on the storefront purely through CSS custom properties (appearance
 * only; no functional/JS changes).
 */

/* ---- Font family ---------------------------------------------------------- */

export const FONT_FAMILIES = [
  "theme",
  "inter",
  "roboto",
  "open-sans",
  "lato",
  "poppins",
  "montserrat",
  "nunito",
  "work-sans",
  "dm-sans",
  "manrope",
  "mulish",
  "rubik",
  "outfit",
  "plus-jakarta-sans",
  "space-grotesk",
  "figtree",
  "source-sans-pro",
  "ubuntu",
  "noto-sans",
  "merriweather",
  "playfair-display",
  "lora",
  "libre-baskerville",
  "cormorant-garamond",
  "bebas-neue",
  "oswald",
  "anton",
  "raleway",
  "dancing-script",
  "pacifico",
  "lobster",
] as const;

export type FontFamily = (typeof FONT_FAMILIES)[number];

export const DEFAULT_FONT_FAMILY: FontFamily = "theme";

export const FONT_FAMILY_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: "theme", label: "Theme Default" },
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "open-sans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
  { value: "poppins", label: "Poppins" },
  { value: "montserrat", label: "Montserrat" },
  { value: "nunito", label: "Nunito" },
  { value: "work-sans", label: "Work Sans" },
  { value: "dm-sans", label: "DM Sans" },
  { value: "manrope", label: "Manrope" },
  { value: "mulish", label: "Mulish" },
  { value: "rubik", label: "Rubik" },
  { value: "outfit", label: "Outfit" },
  { value: "plus-jakarta-sans", label: "Plus Jakarta Sans" },
  { value: "space-grotesk", label: "Space Grotesk" },
  { value: "figtree", label: "Figtree" },
  { value: "source-sans-pro", label: "Source Sans Pro" },
  { value: "ubuntu", label: "Ubuntu" },
  { value: "noto-sans", label: "Noto Sans" },
  { value: "merriweather", label: "Merriweather" },
  { value: "playfair-display", label: "Playfair Display" },
  { value: "lora", label: "Lora" },
  { value: "libre-baskerville", label: "Libre Baskerville" },
  { value: "cormorant-garamond", label: "Cormorant Garamond" },
  { value: "bebas-neue", label: "Bebas Neue" },
  { value: "oswald", label: "Oswald" },
  { value: "anton", label: "Anton" },
  { value: "raleway", label: "Raleway" },
  { value: "dancing-script", label: "Dancing Script" },
  { value: "pacifico", label: "Pacifico" },
  { value: "lobster", label: "Lobster" },
];

/**
 * CSS `font-family` value per option. "theme" inherits the store font.
 * Single-quoted family names so the value is safe inside a double-quoted
 * inline `style` attribute. Kept in sync with the Liquid mapping.
 */
export const FONT_FAMILY_STACKS: Record<FontFamily, string> = {
  theme: "inherit",
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  "open-sans": "'Open Sans', sans-serif",
  lato: "'Lato', sans-serif",
  poppins: "'Poppins', sans-serif",
  montserrat: "'Montserrat', sans-serif",
  nunito: "'Nunito', sans-serif",
  "work-sans": "'Work Sans', sans-serif",
  "dm-sans": "'DM Sans', sans-serif",
  manrope: "'Manrope', sans-serif",
  mulish: "'Mulish', sans-serif",
  rubik: "'Rubik', sans-serif",
  outfit: "'Outfit', sans-serif",
  "plus-jakarta-sans": "'Plus Jakarta Sans', sans-serif",
  "space-grotesk": "'Space Grotesk', sans-serif",
  figtree: "'Figtree', sans-serif",
  "source-sans-pro": "'Source Sans Pro', sans-serif",
  ubuntu: "'Ubuntu', sans-serif",
  "noto-sans": "'Noto Sans', sans-serif",
  merriweather: "'Merriweather', serif",
  "playfair-display": "'Playfair Display', serif",
  lora: "'Lora', serif",
  "libre-baskerville": "'Libre Baskerville', serif",
  "cormorant-garamond": "'Cormorant Garamond', serif",
  "bebas-neue": "'Bebas Neue', sans-serif",
  oswald: "'Oswald', sans-serif",
  anton: "'Anton', sans-serif",
  raleway: "'Raleway', sans-serif",
  "dancing-script": "'Dancing Script', cursive",
  pacifico: "'Pacifico', cursive",
  lobster: "'Lobster', cursive",
};

export function isFontFamily(value: unknown): value is FontFamily {
  return (
    typeof value === "string" &&
    (FONT_FAMILIES as readonly string[]).includes(value)
  );
}

/**
 * The Google Font family name to load for a selection (e.g. "Work Sans"), or
 * `null` for "theme" (which inherits the store font and loads nothing).
 * Derived from the stack so it stays in sync with FONT_FAMILY_STACKS.
 */
export function googleFontFamily(family: FontFamily): string | null {
  if (family === "theme") return null;
  const match = FONT_FAMILY_STACKS[family].match(/'([^']+)'/);
  return match ? match[1] : null;
}

/* ---- Font weight ---------------------------------------------------------- */

export const FONT_WEIGHTS = [400, 500, 600, 700] as const;

export type FontWeight = (typeof FONT_WEIGHTS)[number];

export const DEFAULT_FONT_WEIGHT: FontWeight = 500;

export const FONT_WEIGHT_OPTIONS: { value: FontWeight; label: string }[] = [
  { value: 400, label: "400 Regular" },
  { value: 500, label: "500 Medium" },
  { value: 600, label: "600 Semi Bold" },
  { value: 700, label: "700 Bold" },
];

export function isFontWeight(value: unknown): value is FontWeight {
  return (
    typeof value === "number" && (FONT_WEIGHTS as readonly number[]).includes(value)
  );
}

/* ---- Text alignment ------------------------------------------------------- */

export const TEXT_ALIGNMENTS = ["left", "center", "right"] as const;

export type TextAlign = (typeof TEXT_ALIGNMENTS)[number];

export const DEFAULT_TEXT_ALIGN: TextAlign = "center";

export const TEXT_ALIGN_OPTIONS: { value: TextAlign; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export function isTextAlign(value: unknown): value is TextAlign {
  return (
    typeof value === "string" &&
    (TEXT_ALIGNMENTS as readonly string[]).includes(value)
  );
}

/* ---- Font size + text colour ---------------------------------------------- */

export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 32;
export const DEFAULT_FONT_SIZE = 12;
export const DEFAULT_TEXT_COLOR = "#444444";
