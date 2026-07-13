import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

/**
 * Root entry point ("/").
 *
 * ShipBoost is an embedded Shopify app: merchants always open it from Shopify
 * Admin, where the URL carries the shop (and host) params. Those are forwarded
 * straight to the embedded app at /app, whose `authenticate.admin` loader
 * completes authentication through Shopify's OAuth / token-exchange flow —
 * rendering the Dashboard when authenticated, or bouncing through Shopify OAuth
 * when not. A request with no shop context (only reachable by opening the URL
 * outside Admin) goes to Shopify's OAuth entry at /auth. No login page, no
 * manual shop-domain entry, and nothing is ever rendered here.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // --- TEMP DIAGNOSTIC LOGGING (remove after verification) ---------------
  // Proves which branch _index takes and what params Shopify Admin sends.
  // eslint-disable-next-line no-console
  console.log("[_index] hit", {
    url: request.url,
    method: request.method,
    search: url.search,
    shop: url.searchParams.get("shop"),
    host: url.searchParams.get("host"),
  });
  // ----------------------------------------------------------------------

  if (url.searchParams.get("shop")) {
    // eslint-disable-next-line no-console
    console.log("[_index] BRANCH A -> redirect /app (shop present)");
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // eslint-disable-next-line no-console
  console.log("[_index] BRANCH B -> redirect /auth (shop MISSING)");
  throw redirect("/auth");
};
