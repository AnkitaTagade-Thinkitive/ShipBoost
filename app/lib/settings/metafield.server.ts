import type { ShipBoostSettings } from "./types";

/**
 * Publishes the merchant's settings to an app-owned shop metafield so the theme
 * app extension can read them at render time.
 *
 * - Namespace uses the reserved `$app` prefix, so the value is private to this
 *   app but readable by this app's own theme app extension via Liquid:
 *   `shop.metafields["$app:shipboost"].settings.value`.
 * - Stored as JSON that mirrors `ShipBoostSettings`.
 *
 * This is best-effort: callers wrap it so a metafield failure never blocks the
 * database save, and the storefront falls back to its built-in defaults.
 */

export const SHIPBOOST_METAFIELD_NAMESPACE = "$app:shipboost";
export const SHIPBOOST_METAFIELD_KEY = "settings";

/** Minimal structural type for the authenticated Admin GraphQL client. */
interface AdminGraphqlClient {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<Response>;
}

export async function syncSettingsMetafield(
  admin: AdminGraphqlClient,
  settings: ShipBoostSettings,
): Promise<void> {
  // The metafield owner is the shop; fetch its GID.
  const shopResponse = await admin.graphql(
    `#graphql
      query ShipBoostShopId {
        shop {
          id
        }
      }`,
  );
  const shopJson = (await shopResponse.json()) as {
    data?: { shop?: { id?: string } };
  };
  const ownerId = shopJson.data?.shop?.id;
  if (!ownerId) return;

  const response = await admin.graphql(
    `#graphql
      mutation ShipBoostSetSettings($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        metafields: [
          {
            ownerId,
            namespace: SHIPBOOST_METAFIELD_NAMESPACE,
            key: SHIPBOOST_METAFIELD_KEY,
            type: "json",
            value: JSON.stringify(settings),
          },
        ],
      },
    },
  );

  const json = (await response.json()) as {
    data?: { metafieldsSet?: { userErrors?: { message: string }[] } };
  };
  const userErrors = json.data?.metafieldsSet?.userErrors ?? [];
  if (userErrors.length > 0) {
    // Non-fatal: log so it surfaces in dev, but don't throw.
    console.warn(
      "[ShipBoost] Failed to sync settings metafield:",
      userErrors.map((e) => e.message).join("; "),
    );
  }
}
