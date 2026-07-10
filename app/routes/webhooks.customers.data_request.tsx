import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * GDPR mandatory compliance webhook: customers/data_request.
 *
 * Shopify sends this when a store customer requests the personal data an app
 * holds about them. ShipBoost stores no customer personal data — it reads the
 * cart total live on the storefront and never persists customer information —
 * so there is nothing to return. The request is HMAC-verified by
 * `authenticate.webhook` and acknowledged with 200.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(
    `Received ${topic} webhook for ${shop} — no customer data is stored`,
  );

  return new Response();
};
