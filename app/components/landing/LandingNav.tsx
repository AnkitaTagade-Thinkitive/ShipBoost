import type { MouseEvent } from "react";

import { DOCS_URL, isExternalUrl } from "../../lib/constants";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Features", target: "features" },
  { label: "How It Works", target: "how" },
  { label: "FAQ", target: "faq" },
];

/** Smooth-scroll to an in-page section, respecting reduced-motion preferences. */
function scrollToSection(e: MouseEvent<HTMLAnchorElement>, id: string) {
  const el = typeof document !== "undefined" ? document.getElementById(id) : null;
  if (!el) return;
  e.preventDefault();
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/**
 * Sticky landing navigation: brand mark, smooth-scroll section links, and the
 * "Open in Shopify" CTA. Documentation links out only when a real external docs
 * URL is configured; otherwise it renders disabled (no fake page). The bar is
 * `position: sticky`, so it stays available as the visitor scrolls.
 */
export function LandingNav() {
  const docsExternal = isExternalUrl(DOCS_URL);

  return (
    <header className="sb-nav sb-fade-in">
      <div className="sb-nav__brand">
        <Logo size={38} glow className="sb-nav__logo" />
        <span className="sb-nav__name">ShipBoost</span>
      </div>

      <nav className="sb-nav__links" aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <a
            key={link.target}
            className="sb-nav__link"
            href={`#${link.target}`}
            onClick={(e) => scrollToSection(e, link.target)}
          >
            {link.label}
          </a>
        ))}
        {docsExternal ? (
          <a
            className="sb-nav__link"
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
          >
            Documentation
          </a>
        ) : (
          <span
            className="sb-nav__link is-disabled"
            aria-disabled="true"
            title="Coming soon"
          >
            Documentation
          </span>
        )}
      </nav>

      <a className="sb-btn sb-btn--ghost sb-nav__cta" href="/auth">
        Open in Shopify
      </a>
    </header>
  );
}
