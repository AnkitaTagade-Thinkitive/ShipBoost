import {
  Truck,
  ShoppingBag,
  Palette,
  Zap,
  Smartphone,
  Wrench,
} from "lucide-react";

import { FeatureCard } from "./FeatureCard";

const ICON_PROPS = { size: 26, strokeWidth: 1.75 } as const;

const FEATURES = [
  {
    icon: <Truck {...ICON_PROPS} />,
    title: "Free Shipping Progress Bars",
    description:
      "Increase Average Order Value with customizable free shipping goals.",
  },
  {
    icon: <ShoppingBag {...ICON_PROPS} />,
    title: "Smart Product Recommendations",
    description:
      "Recommend products intelligently to encourage larger purchases.",
  },
  {
    icon: <Palette {...ICON_PROPS} />,
    title: "Fully Customizable Design",
    description:
      "Customize colors, layouts, typography, spacing, icons and animations.",
  },
  {
    icon: <Zap {...ICON_PROPS} />,
    title: "Fast & Lightweight",
    description:
      "Built for performance so your storefront stays snappy on every page.",
  },
  {
    icon: <Smartphone {...ICON_PROPS} />,
    title: "Responsive on Every Device",
    description:
      "Looks and works beautifully across desktop, tablet and mobile.",
  },
  {
    icon: <Wrench {...ICON_PROPS} />,
    title: "Easy Theme Integration",
    description:
      "Drop the block into your theme with the native Shopify Theme Editor.",
  },
];

/**
 * Professional 6-card feature grid. Data-driven — each item renders a reusable
 * <FeatureCard> with a Lucide icon and a staggered fade-up delay.
 */
export function FeatureGrid() {
  return (
    <section id="features" className="sb-section sb-features-section" aria-label="Features">
      <div className="sb-section__head">
        <span className="sb-eyebrow">Features</span>
        <h2 className="sb-section__title">Everything you need to sell more</h2>
        <p className="sb-section__sub">
          A complete toolkit for high-converting free shipping experiences.
        </p>
      </div>

      <div className="sb-features">
        {FEATURES.map((feature, i) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={i * 80}
          />
        ))}
      </div>
    </section>
  );
}
