import { FeatureCard } from "./FeatureCard";
import { GradientBlobs } from "./GradientBlobs";

const FEATURES = [
  {
    icon: "🚚",
    title: "Free Shipping Progress Bars",
    description:
      "Increase Average Order Value with customizable free shipping goals.",
  },
  {
    icon: "🛍",
    title: "Smart Product Recommendations",
    description:
      "Recommend products intelligently to encourage larger purchases.",
  },
  {
    icon: "🎨",
    title: "Fully Customizable",
    description:
      "Customize colors, layouts, typography, spacing, icons and animations.",
  },
];

/**
 * Public marketing landing page shown at "/" to visitors who reach the app
 * directly (i.e. outside of Shopify Admin, with no `shop`/`host` context).
 *
 * This is purely presentational. The only functional element is the primary
 * CTA, which points at `/auth` — the existing, unmodified Shopify OAuth entry
 * point. Merchants opening the app from Admin never see this page; they are
 * forwarded to `/app` by the route loader before it renders.
 */
export function LandingPage() {
  return (
    <div className="sb-landing">
      <GradientBlobs />

      <div className="sb-landing__inner">
        {/* Nav */}
        <header className="sb-nav sb-fade-in">
          <div className="sb-nav__brand">
            <span className="sb-nav__logo" aria-hidden="true">
              ⚡
            </span>
            <span className="sb-nav__name">ShipBoost</span>
          </div>
          <a className="sb-btn sb-btn--ghost sb-nav__cta" href="/auth">
            Open in Shopify
          </a>
        </header>

        {/* Hero */}
        <section className="sb-hero">
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

        {/* Features */}
        <section className="sb-features" aria-label="Features">
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={300 + i * 90}
            />
          ))}
        </section>

        {/* Footer */}
        <footer className="sb-footer">
          <p>Made with ❤️ for Shopify Merchants</p>
        </footer>
      </div>
    </div>
  );
}
