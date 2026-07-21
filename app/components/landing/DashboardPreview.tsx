import { useInView } from "./useInView";

/** Public URL of the real ShipBoost product screenshot (served from /public). */
const SCREENSHOT_SRC = "/progress.png";

export interface DashboardPreviewProps {
  /** Override the screenshot URL if needed. */
  src?: string;
  alt?: string;
}

/**
 * "See ShipBoost in Action" — the hero product showcase.
 *
 * Displays the real ShipBoost screenshot inside a premium browser-style frame
 * (glass border, green glow, soft shadow, gentle float). The frame animates in
 * — fade up + slight scale — the first time it enters the viewport. The image
 * uses `object-fit: contain`, so nothing important is ever cropped.
 */
export function DashboardPreview({ src, alt }: DashboardPreviewProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="preview" className="sb-section sb-preview" aria-label="Product preview">
      <div className="sb-section__head">
        <span className="sb-eyebrow">Product tour</span>
        <h2 className="sb-section__title">See ShipBoost in Action</h2>
        <p className="sb-section__sub">
          Everything you need to create high-converting free shipping
          experiences.
        </p>
      </div>

      <div
        ref={ref}
        className={`sb-preview__frame${inView ? " is-visible" : ""}`}
      >
        <div className="sb-preview__glow" aria-hidden="true" />
        <div className="sb-preview__chrome" aria-hidden="true">
          <span className="sb-dot sb-dot--red" />
          <span className="sb-dot sb-dot--amber" />
          <span className="sb-dot sb-dot--green" />
          <span className="sb-preview__url">admin.shopify.com/apps/shipboost</span>
        </div>

        <div className="sb-preview__shot">
          <img
            className="sb-preview__img"
            src={src ?? SCREENSHOT_SRC}
            alt={alt ?? "ShipBoost free shipping progress bar and product recommendations"}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
