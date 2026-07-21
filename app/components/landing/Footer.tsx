import { DOCS_URL, PRIVACY_URL, SUPPORT_URL, isExternalUrl } from "../../lib/constants";
import { Logo } from "./Logo";

/**
 * Public landing-page footer.
 *
 * Footer links resolve to real destinations ONLY when a genuine external
 * (public) URL is configured via the app's env-driven constants. The defaults
 * point at the in-app, auth-gated Help page, which a logged-out visitor must
 * never be sent to — so any non-external value renders as a disabled link
 * rather than a dead redirect. "Terms of Service" has no configured page yet
 * and stays disabled. No placeholder or fake pages are created.
 */
const SUPPORT_EMAIL = "support@shipboost.app";

const LINKS: { label: string; href?: string }[] = [
  { label: "Privacy Policy", href: isExternalUrl(PRIVACY_URL) ? PRIVACY_URL : undefined },
  { label: "Terms of Service" },
  {
    label: "Support",
    href: isExternalUrl(SUPPORT_URL) ? SUPPORT_URL : `mailto:${SUPPORT_EMAIL}`,
  },
  { label: "Documentation", href: isExternalUrl(DOCS_URL) ? DOCS_URL : undefined },
];

export function Footer() {
  return (
    <footer className="sb-footer" aria-label="Footer">
      <div className="sb-footer__top">
        <div className="sb-footer__brand">
          <Logo size={34} glow className="sb-footer__logo" />
          <span className="sb-footer__name">ShipBoost</span>
        </div>
        <p className="sb-footer__desc">
          Beautiful free shipping progress bars and smart recommendations that
          help Shopify merchants grow Average Order Value.
        </p>

        <a className="sb-footer__email" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>

        <nav className="sb-footer__links" aria-label="Footer links">
          {LINKS.map((link) =>
            link.href ? (
              <a
                key={link.label}
                className="sb-footer__link"
                href={link.href}
                target={isExternalUrl(link.href) ? "_blank" : undefined}
                rel="noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <span
                key={link.label}
                className="sb-footer__link is-disabled"
                aria-disabled="true"
                title="Coming soon"
              >
                {link.label}
              </span>
            ),
          )}
        </nav>
      </div>

      <div className="sb-footer__bottom">
        <p>© 2026 ShipBoost · Built for Shopify Merchants</p>
        <p className="sb-footer__love">Made with ❤️ for Shopify Merchants</p>
      </div>
    </footer>
  );
}
