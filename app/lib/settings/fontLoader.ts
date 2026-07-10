/**
 * Dynamically load a single Google Font in the browser (used by the admin Live
 * Preview so it renders the selected font, matching the storefront).
 *
 * Loads only the requested font, once — a per-session cache plus a DOM check
 * prevent duplicate requests. A null/empty name (Theme Default) loads nothing.
 */
const loaded = new Set<string>();

export function loadGoogleFont(name: string | null): void {
  if (!name || typeof document === "undefined") return;

  const key = name.toLowerCase();
  if (loaded.has(key)) return;
  loaded.add(key);

  const href = `https://fonts.googleapis.com/css2?family=${name.replace(
    / /g,
    "+",
  )}:wght@400;500;600;700&display=swap`;

  if (document.querySelector(`link[href="${href}"]`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
