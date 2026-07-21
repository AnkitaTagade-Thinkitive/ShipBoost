export interface DashboardPreviewProps {
  /**
   * Optional real screenshot URL. When provided it replaces the built-in CSS
   * mock, so this component can be swapped to a real image later with a
   * one-line change and no layout shift.
   */
  src?: string;
  alt?: string;
}

/**
 * "See ShipBoost in Action" dashboard preview.
 *
 * Renders a floating glass frame with browser chrome. Until a real screenshot
 * exists it shows a lightweight CSS mock of the ShipBoost dashboard; pass `src`
 * to drop in an actual image later.
 */
export function DashboardPreview({ src, alt }: DashboardPreviewProps) {
  return (
    <section className="sb-section sb-preview" aria-label="Product preview">
      <div className="sb-section__head">
        <span className="sb-eyebrow">Product tour</span>
        <h2 className="sb-section__title">See ShipBoost in Action</h2>
        <p className="sb-section__sub">
          Everything you need to create high-converting free shipping
          experiences.
        </p>
      </div>

      <div className="sb-preview__frame sb-fade-up">
        <div className="sb-preview__glow" aria-hidden="true" />
        <div className="sb-preview__chrome" aria-hidden="true">
          <span className="sb-dot sb-dot--red" />
          <span className="sb-dot sb-dot--amber" />
          <span className="sb-dot sb-dot--green" />
          <span className="sb-preview__url">admin.shopify.com/apps/shipboost</span>
        </div>

        {src ? (
          <img className="sb-preview__img" src={src} alt={alt ?? "ShipBoost dashboard"} />
        ) : (
          <MockDashboard />
        )}
      </div>
    </section>
  );
}

/** Placeholder CSS mock of the dashboard — replace with a real screenshot. */
function MockDashboard() {
  return (
    <div className="sb-mock" aria-hidden="true">
      <aside className="sb-mock__side">
        <span className="sb-mock__brand" />
        <span className="sb-mock__nav sb-mock__nav--active" />
        <span className="sb-mock__nav" />
        <span className="sb-mock__nav" />
        <span className="sb-mock__nav" />
      </aside>
      <div className="sb-mock__body">
        <div className="sb-mock__stats">
          <span className="sb-mock__stat" />
          <span className="sb-mock__stat" />
          <span className="sb-mock__stat" />
        </div>
        <div className="sb-mock__bar">
          <span className="sb-mock__bar-fill" />
        </div>
        <div className="sb-mock__rows">
          <span className="sb-mock__row" />
          <span className="sb-mock__row" />
          <span className="sb-mock__row" />
        </div>
      </div>
    </div>
  );
}
