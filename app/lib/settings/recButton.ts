/**
 * Add-to-Cart button customization for product recommendations.
 *
 * Two modes:
 *  - "theme"  → the storefront auto-detects the active theme's Add-to-cart button
 *               and uses it as the base. Any non-empty field below OVERRIDES just
 *               that property while the rest keeps inheriting the theme.
 *  - "custom" → the theme is ignored; the fields below define the button. Empty
 *               fields fall back to the stylesheet defaults.
 *
 * Every style field is a string where "" means "auto" (inherit the theme in
 * theme mode, or the CSS default in custom mode) — the single convention that
 * makes per-property overrides + serialization trivial. `fullWidth`/`width`
 * layout and icon choices are enums, also defaulting to "" = inherit/none.
 * The button label (`text`) applies in BOTH modes.
 *
 * `recButtonCssVars` maps a config to the `--sb-rec-btn-*` custom properties the
 * button CSS consumes, and `recButtonClasses` to the structural classes. Both
 * are used by the admin Live Preview and mirrored by the storefront script
 * (ship-boost-recommendations.js).
 */

export const REC_BUTTON_MODES = ["theme", "custom"] as const;
export type RecButtonMode = (typeof REC_BUTTON_MODES)[number];
export const DEFAULT_REC_BUTTON_MODE: RecButtonMode = "theme";
export const REC_BUTTON_MODE_OPTIONS: { value: RecButtonMode; label: string }[] =
  [
    { value: "theme", label: "Theme Button" },
    { value: "custom", label: "Custom Button" },
  ];
export function isRecButtonMode(value: unknown): value is RecButtonMode {
  return (
    typeof value === "string" &&
    (REC_BUTTON_MODES as readonly string[]).includes(value)
  );
}

export const REC_BUTTON_SIZES = ["small", "medium", "large"] as const;
export type RecButtonSize = (typeof REC_BUTTON_SIZES)[number];
export const REC_BUTTON_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Theme default" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];
const SIZE_PRESET: Record<RecButtonSize, { h: number; px: number; fs: number }> =
  {
    small: { h: 28, px: 12, fs: 12 },
    medium: { h: 32, px: 15, fs: 13 },
    large: { h: 40, px: 22, fs: 15 },
  };

export const REC_BUTTON_WIDTH_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Theme default" },
  { value: "fit", label: "Fit content" },
  { value: "full", label: "Full width" },
];
export const REC_BUTTON_ALIGN_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Theme default" },
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];
export const REC_BUTTON_BORDER_STYLE_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "", label: "Theme default" },
  { value: "none", label: "None" },
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];
export const REC_BUTTON_TRANSFORM_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Theme default" },
  { value: "none", label: "None" },
  { value: "uppercase", label: "UPPERCASE" },
  { value: "capitalize", label: "Capitalize" },
  { value: "lowercase", label: "lowercase" },
];
export const REC_BUTTON_WEIGHT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Theme default" },
  { value: "400", label: "Regular (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semibold (600)" },
  { value: "700", label: "Bold (700)" },
];
export const REC_BUTTON_TIMING_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Theme default" },
  { value: "ease", label: "Ease" },
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease in" },
  { value: "ease-out", label: "Ease out" },
  { value: "ease-in-out", label: "Ease in-out" },
];
export const REC_BUTTON_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "No icon" },
  { value: "cart", label: "Cart" },
  { value: "plus", label: "Plus" },
  { value: "arrow", label: "Arrow" },
  { value: "custom", label: "Custom SVG" },
];
export const REC_BUTTON_ICON_POSITION_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

/** Built-in icon SVGs (currentColor so they follow the button text colour). */
export const REC_BUTTON_ICONS: Record<string, string> = {
  cart: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="17" r="1"/><circle cx="15" cy="17" r="1"/><path d="M2 3h2l1.6 9.3a1 1 0 0 0 1 .7h7.2a1 1 0 0 0 1-.8L17 6H5"/></svg>',
  plus: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>',
  arrow:
    '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>',
};

export const DEFAULT_REC_BUTTON_TEXT = "Add to cart";

/** All string fields; "" = auto/inherit. */
export interface RecButton {
  text: string;
  bg: string;
  textColor: string;
  borderColor: string;
  borderWidth: string;
  borderStyle: string;
  radius: string;
  shadow: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  letterSpacing: string;
  textTransform: string;
  paddingX: string;
  paddingY: string;
  size: string;
  width: string;
  align: string;
  // Hover state.
  hoverBg: string;
  hoverTextColor: string;
  hoverBorderColor: string;
  hoverShadow: string;
  transitionDuration: string;
  transitionTiming: string;
  // Icon.
  icon: string;
  iconPosition: string;
  iconSvg: string;
}

/** Default config: everything auto (pure theme inheritance) — backward compatible. */
export const DEFAULT_REC_BUTTON: RecButton = {
  text: DEFAULT_REC_BUTTON_TEXT,
  bg: "",
  textColor: "",
  borderColor: "",
  borderWidth: "",
  borderStyle: "",
  radius: "",
  shadow: "",
  fontFamily: "",
  fontSize: "",
  fontWeight: "",
  letterSpacing: "",
  textTransform: "",
  paddingX: "",
  paddingY: "",
  size: "",
  width: "",
  align: "",
  hoverBg: "",
  hoverTextColor: "",
  hoverBorderColor: "",
  hoverShadow: "",
  transitionDuration: "",
  transitionTiming: "",
  icon: "",
  iconPosition: "left",
  iconSvg: "",
};

type RecButtonKey = keyof RecButton;
const STRING_KEYS: RecButtonKey[] = Object.keys(DEFAULT_REC_BUTTON) as RecButtonKey[];

/** Strip anything script-y from a pasted custom SVG (defence in depth). */
export function sanitizeSvg(svg: string): string {
  if (!svg || svg.indexOf("<svg") === -1) return "";
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|xlink:href)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "")
    .trim();
}

/** Normalize an untrusted (possibly partial/legacy) object into a full RecButton. */
export function normalizeRecButton(input: unknown): RecButton {
  const raw = (input && typeof input === "object" ? input : {}) as Record<
    string,
    unknown
  >;
  const out = { ...DEFAULT_REC_BUTTON };
  for (const key of STRING_KEYS) {
    const v = raw[key];
    if (typeof v === "string") out[key] = v.trim();
  }
  // Backward compat: the old boolean `fullWidth` maps to width "full".
  if (!out.width && raw.fullWidth === true) out.width = "full";
  if (!out.text) out.text = DEFAULT_REC_BUTTON_TEXT;
  if (out.size && !(REC_BUTTON_SIZES as readonly string[]).includes(out.size)) {
    out.size = "";
  }
  if (out.iconPosition !== "right") out.iconPosition = "left";
  out.iconSvg = sanitizeSvg(out.iconSvg);
  return out;
}

function px(value: string): string {
  return /^-?\d+(\.\d+)?$/.test(value) ? value + "px" : value;
}
function dur(value: string): string {
  // Bare number → milliseconds; otherwise pass through (e.g. "0.2s").
  return /^\d+(\.\d+)?$/.test(value) ? value + "ms" : value;
}

/** Config → `--sb-rec-btn-*` custom properties (only for non-empty fields). */
export function recButtonCssVars(cfg: RecButton): Record<string, string> {
  const vars: Record<string, string> = {};
  const set = (k: string, v: string) => {
    if (v) vars[k] = v;
  };

  set("--sb-rec-btn-bg-color", cfg.bg);
  set("--sb-rec-btn-color", cfg.textColor);
  set("--sb-rec-btn-border-color", cfg.borderColor);
  if (cfg.borderWidth) set("--sb-rec-btn-border-width", px(cfg.borderWidth));
  set("--sb-rec-btn-border-style", cfg.borderStyle);
  if (cfg.radius) set("--sb-rec-btn-radius", px(cfg.radius));
  set("--sb-rec-btn-shadow", cfg.shadow);
  set("--sb-rec-btn-font-family", cfg.fontFamily);
  set("--sb-rec-btn-font-weight", cfg.fontWeight);
  set("--sb-rec-btn-letter-spacing", cfg.letterSpacing);
  set("--sb-rec-btn-text-transform", cfg.textTransform);

  // Hover state.
  set("--sb-rec-btn-hover-bg", cfg.hoverBg);
  set("--sb-rec-btn-hover-color", cfg.hoverTextColor);
  set("--sb-rec-btn-hover-border-color", cfg.hoverBorderColor);
  set("--sb-rec-btn-hover-shadow", cfg.hoverShadow);
  if (cfg.transitionDuration || cfg.transitionTiming) {
    set(
      "--sb-rec-btn-transition",
      "all " +
        dur(cfg.transitionDuration || "150") +
        " " +
        (cfg.transitionTiming || "ease"),
    );
  }

  // Alignment (applies when the button is on its own row — fit/full width).
  if (cfg.align === "left") set("--sb-rec-btn-justify", "start");
  else if (cfg.align === "center") set("--sb-rec-btn-justify", "center");
  else if (cfg.align === "right") set("--sb-rec-btn-justify", "end");

  // Size preset seeds height / horizontal padding / font size; explicit values
  // below override the preset.
  const preset = cfg.size ? SIZE_PRESET[cfg.size as RecButtonSize] : undefined;
  const height = preset ? String(preset.h) + "px" : "";
  let padX = preset ? String(preset.px) : "";
  let fontSize = preset ? String(preset.fs) + "px" : "";
  if (cfg.fontSize) fontSize = px(cfg.fontSize);
  if (cfg.paddingX) padX = cfg.paddingX;
  if (cfg.paddingY) {
    set("--sb-rec-btn-padding", px(cfg.paddingY) + " " + px(padX || "15"));
    set("--sb-rec-btn-height", "auto");
  } else {
    if (padX) set("--sb-rec-btn-padding", "0 " + px(padX));
    if (height) set("--sb-rec-btn-height", height);
  }
  set("--sb-rec-btn-font-size", fontSize);

  return vars;
}

/** Config → structural container classes (width / alignment layout). */
export function recButtonClasses(cfg: RecButton): string {
  const classes: string[] = [];
  if (cfg.width === "full") classes.push("sb-rec-btn-w-full");
  else if (cfg.width === "fit") classes.push("sb-rec-btn-w-fit");
  if (cfg.align && cfg.width) classes.push("sb-rec-btn-aligned");
  return classes.join(" ");
}

/** The icon markup for a config (built-in preset or sanitized custom SVG). */
export function recButtonIconSvg(cfg: RecButton): string {
  if (!cfg.icon || cfg.icon === "none") return "";
  if (cfg.icon === "custom") return sanitizeSvg(cfg.iconSvg);
  return REC_BUTTON_ICONS[cfg.icon] || "";
}
