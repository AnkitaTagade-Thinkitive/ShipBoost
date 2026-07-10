import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR mandatory compliance webhook: shop/redact.
 *
 * Shopify sends this 48 hours after a store uninstalls the app, requesting
 * erasure of all data held for that shop. ShipBoost removes the shop's saved
 * settings and any lingering sessions. The request is HMAC-verified by
 * `authenticate.webhook` and acknowledged with 200.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop} — redacting shop data`);

  await db.shipBoostSetting.deleteMany({ where: { shop } });
  await db.session.deleteMany({ where: { shop } });

  return new Response();
};
