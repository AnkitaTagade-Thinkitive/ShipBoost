import type { ReactNode } from "react";

/**
 * A single premium feature card for the landing page features grid.
 * Reusable and data-driven — the parent passes an icon node (a Lucide icon),
 * title and copy. `style` carries a per-card animation delay for the staggered
 * fade-in.
 */
export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  /** Delay (in ms) before this card's fade-in animation starts. */
  delay?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  return (
    <article
      className="sb-feature sb-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="sb-feature__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="sb-feature__title">{title}</h3>
      <p className="sb-feature__desc">{description}</p>
    </article>
  );
}
