/** Public URL of the official ShipBoost app logo (served from /public). */
export const LOGO_SRC = "/shipboosticon2.png";

export interface LogoProps {
  /** Rendered (CSS) size in px. The source is 1254×1254, so it stays crisp on retina. */
  size?: number;
  /** Wrap with a soft brand glow to match the dark SaaS theme. */
  glow?: boolean;
  /** Gentle floating animation (used for the hero mark). */
  float?: boolean;
  className?: string;
}

/**
 * The official ShipBoost logo (`shipboosticon2.png`), used everywhere the brand
 * mark appears on the landing page. The image is never recoloured or
 * regenerated — original colors are preserved; only a subtle glow/shadow and
 * rounded clipping are applied via CSS.
 *
 * Explicit width/height (matching the square source aspect ratio) prevent
 * layout shift and keep the mark sharp on high-DPI displays.
 */
export function Logo({ size = 36, glow = false, float = false, className }: LogoProps) {
  const classes = [
    "sb-logo",
    glow && "sb-logo--glow",
    float && "sb-logo--float",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      src={LOGO_SRC}
      alt="ShipBoost logo"
      width={size}
      height={size}
      className={classes}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
}
