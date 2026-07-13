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

  if (url.searchParams.get("shop") || url.searchParams.get("host")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  throw redirect("/auth");
};
