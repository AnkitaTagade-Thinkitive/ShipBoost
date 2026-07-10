import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * GDPR mandatory compliance webhook: customers/redact.
 *
 * Shopify sends this to request erasure of a customer's personal data.
 * ShipBoost stores no customer personal data, so there is nothing to erase. The
 * request is HMAC-verified by `authenticate.webhook` and acknowledged with 200.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(
    `Received ${topic} webhook for ${shop} — no customer data is stored`,
  );

  return new Response();
};
