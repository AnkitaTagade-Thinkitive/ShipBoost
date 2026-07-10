/**
 * App-wide constants (branding, version, and links) used by the Dashboard,
 * Help page, and footer.
 */
export const APP_NAME = "ShipBoost";
export const APP_VERSION = "1.0.0";

// In-app routes (always safe, internal navigation).
export const HELP_PATH = "/app/help";
export const SETTINGS_PATH = "/app/settings";
export const DASHBOARD_PATH = "/app";

/**
 * Documentation / Support / Privacy links.
 *
 * These are configurable: set the matching build-time env var to your real
 * hosted page and every link updates automatically —
 *   VITE_DOCS_URL      e.g. "https://help.yourdomain.com"
 *   VITE_SUPPORT_URL   e.g. "mailto:support@yourdomain.com"
 *   VITE_PRIVACY_URL   e.g. "https://yourdomain.com/privacy"
 *
 * Until real pages exist, each falls back to the in-app Help page, so the app
 * NEVER contains a dead/broken external link (no placeholder domains). Links
 * are opened in a new tab only when they are truly external (see isExternalUrl).
 */
export const DOCS_URL = import.meta.env.VITE_DOCS_URL || HELP_PATH;
export const SUPPORT_URL = import.meta.env.VITE_SUPPORT_URL || HELP_PATH;
export const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL || HELP_PATH;

/**
 * True for links that leave the app (http/https/mailto). Used to decide whether
 * a link should open in a new tab — internal routes navigate in place.
 */
export function isExternalUrl(url: string): boolean {
  return /^(https?:|mailto:)/i.test(url);
}
