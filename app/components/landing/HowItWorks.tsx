const STEPS = [
  {
    icon: "📦",
    title: "Install ShipBoost",
    description: "Install the app from the Shopify App Store.",
  },
  {
    icon: "⚙️",
    title: "Configure Your Settings",
    description: "Choose shipping goal, colors, typography and placement.",
  },
  {
    icon: "🧩",
    title: "Enable Theme Extension",
    description: "Activate the ShipBoost block inside your Shopify Theme Editor.",
  },
  {
    icon: "📈",
    title: "Increase Revenue",
    description: "Customers unlock free shipping and spend more.",
  },
];

/**
 * "How ShipBoost Works" — a 4-step timeline. A connecting line runs behind the
 * cards (horizontal on desktop, vertical on mobile); each card animates in with
 * a staggered fade-up and lifts on hover.
 */
export function HowItWorks() {
  return (
    <section className="sb-section sb-how" aria-label="How it works">
      <div className="sb-section__head">
        <span className="sb-eyebrow">Getting started</span>
        <h2 className="sb-section__title">How ShipBoost Works</h2>
        <p className="sb-section__sub">
          From install to more revenue in four simple steps.
        </p>
      </div>

      <ol className="sb-how__grid">
        <span className="sb-how__line" aria-hidden="true" />
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="sb-how__step sb-fade-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="sb-how__num" aria-hidden="true">
              {i + 1}
            </span>
            <span className="sb-how__icon" aria-hidden="true">
              {step.icon}
            </span>
            <h3 className="sb-how__title">{step.title}</h3>
            <p className="sb-how__desc">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
