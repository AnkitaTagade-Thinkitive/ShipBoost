import { CTASection } from "./CTASection";
import { DashboardPreview } from "./DashboardPreview";
import { FAQSection } from "./FAQSection";
import { FeatureGrid } from "./FeatureGrid";
import { Footer } from "./Footer";
import { GradientBlobs } from "./GradientBlobs";
import { HowItWorks } from "./HowItWorks";
import { LandingNav } from "./LandingNav";
import { Logo } from "./Logo";

/**
 * Public marketing landing page shown at "/" to visitors who reach the app
 * directly (i.e. outside of Shopify Admin, with no `shop`/`host` context).
 *
 * This is purely presentational. The only functional elements are the CTAs,
 * which point at `/auth` — the existing, unmodified Shopify OAuth entry point.
 * Merchants opening the app from Admin never see this page; they are forwarded
 * to `/app` by the route loader before it renders.
 */
export function LandingPage() {
  return (
    <div className="sb-landing">
      <GradientBlobs />

      <div className="sb-landing__inner">
        <LandingNav />

        {/* Hero */}
        <section className="sb-hero">
          <div className="sb-hero__mark sb-fade-up" style={{ animationDelay: "20ms" }}>
            <Logo size={88} glow float className="sb-hero__logo" />
          </div>

          <span className="sb-badge sb-fade-up" style={{ animationDelay: "60ms" }}>
            ✨ Shopify Embedded App
          </span>

          <h1 className="sb-hero__title sb-fade-up" style={{ animationDelay: "120ms" }}>
            Boost Every Cart.
            <br />
            <span className="sb-hero__gradient">Unlock More Revenue.</span>
          </h1>

          <p className="sb-hero__sub sb-fade-up" style={{ animationDelay: "180ms" }}>
            ShipBoost helps Shopify merchants increase Average Order Value using
            beautiful free shipping progress bars, smart product
            recommendations, and fully customizable shopping experiences.
          </p>

          {/* Main card */}
          <div className="sb-card sb-fade-up" style={{ animationDelay: "240ms" }}>
            <Logo size={64} glow className="sb-card__logo" />
            <h2 className="sb-card__title">Welcome to ShipBoost</h2>
            <p className="sb-card__lead">This is a Shopify Embedded App.</p>
            <p className="sb-card__text">
              To access ShipBoost, please install the app from the Shopify App
              Store and open it from your Shopify Admin dashboard.
            </p>

            <div className="sb-card__actions">
              <a className="sb-btn sb-btn--primary" href="/auth">
                Open in Shopify
                <span className="sb-btn__arrow" aria-hidden="true">
                  →
                </span>
              </a>
              {/* Documentation intentionally hidden until docs exist. */}
            </div>
          </div>
        </section>

        <hr className="sb-divider" />

        {/* Dashboard preview */}
        <DashboardPreview />

        <hr className="sb-divider" />

        {/* How it works */}
        <HowItWorks />

        <hr className="sb-divider" />

        {/* Features */}
        <FeatureGrid />

        <hr className="sb-divider" />

        {/* FAQ */}
        <FAQSection />

        {/* Final CTA */}
        <CTASection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
