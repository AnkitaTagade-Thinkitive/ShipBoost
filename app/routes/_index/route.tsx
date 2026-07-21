import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";

import { LandingPage } from "../../components/landing/LandingPage";
import landingStyles from "./landing.css?url";

/**
 * Root entry point ("/").
 *
 * ShipBoost is an embedded Shopify app: merchants always open it from Shopify
 * Admin, where the URL carries the shop (and host) params. Those are forwarded
 * straight to the embedded app at /app, whose `authenticate.admin` loader
 * completes authentication through Shopify's OAuth / token-exchange flow —
 * rendering the Dashboard when authenticated, or bouncing through Shopify OAuth
 * when not.
 *
 * A request with NO shop context is only reachable by someone opening this URL
 * directly (outside Admin). Rather than bounce them to Shopify's OAuth entry at
 * /auth — which renders nothing for a human visitor — we serve a public
 * marketing landing page. The Shopify authentication flow is untouched: the
 * landing page's primary CTA simply links to the existing /auth route.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop") || url.searchParams.get("host")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // Direct visitor with no Shopify context → render the landing page.
  return null;
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: landingStyles },
  { rel: "icon", type: "image/png", href: "/shipboosticon2.png" },
  { rel: "apple-touch-icon", href: "/shipboosticon2.png" },
];

export const meta: MetaFunction = () => [
  { title: "ShipBoost — Boost Every Cart. Unlock More Revenue." },
  {
    name: "description",
    content:
      "ShipBoost helps Shopify merchants increase Average Order Value with free shipping progress bars, smart product recommendations, and fully customizable shopping experiences.",
  },
];

export default function Index() {
  return <LandingPage />;
}
