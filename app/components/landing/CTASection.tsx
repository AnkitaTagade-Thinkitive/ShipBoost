/**
 * Final call-to-action band shown just above the footer. The button links to
 * the existing /auth entry point — authentication is untouched.
 */
export function CTASection() {
  return (
    <section className="sb-section sb-cta" aria-label="Get started">
      <div className="sb-cta__card sb-fade-up">
        <div className="sb-cta__glow" aria-hidden="true" />
        <h2 className="sb-cta__title">
          Ready to Increase Your Average Order Value?
        </h2>
        <p className="sb-cta__sub">
          Install ShipBoost and start converting more visitors into
          higher-value customers.
        </p>
        <a className="sb-btn sb-btn--primary sb-cta__btn" href="/auth">
          Open in Shopify
          <span className="sb-btn__arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </section>
  );
}
