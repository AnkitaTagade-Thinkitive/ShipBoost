/**
 * Server-side product fetching for the Product Recommendations feature.
 *
 * The app fetches ONLY the handful of products it actually needs — never the
 * whole catalog — via the Admin GraphQL API, distills them to a compact shape,
 * and publishes that list to an app-owned shop metafield. The storefront then
 * reads a single metafield value (zero storefront API calls) and, for the Smart
 * Match source, ranks the pool client-side against the live cart total.
 *
 * Requires the `read_products` access scope.
 */

import type { ShipBoostSettings } from "../settings/types";
import { SHIPBOOST_METAFIELD_NAMESPACE } from "../settings/metafield.server";

/** Metafield key that holds the published recommendation product list. */
export const SHIPBOOST_RECOMMENDATIONS_KEY = "recommendations";

/**
 * How many candidates to publish for the Smart Match source. Smart Match needs
 * price diversity so it can match any "remaining" amount, so we publish a
 * bounded pool of best-selling products and let the storefront pick. This is a
 * one-time fetch at save/sync — it never touches the storefront render path.
 */
export const SMART_POOL_SIZE = 50;

/**
 * Extra products to fetch beyond `recommendationMax` for the Best Sellers and
 * Collection sources, so the storefront can skip items already in the cart or
 * out of stock and still fill the requested number of cards.
 */
export const OVERFETCH_BUFFER = 4;

/** Hard ceiling on how many products we ever fetch/publish in one sync. */
export const MAX_FETCH = 50;

/** Compact product shape published to the storefront metafield. */
export interface RecommendationProduct {
  /** Product GID (e.g. "gid://shopify/Product/123"). */
  id: string;
  /** URL handle, used to build the product link. */
  handle: string;
  /** Product title. */
  title: string;
  /** Featured image URL, or null when the product has no image. */
  image: string | null;
  /**
   * First-variant price in cents (minor units), matching `cart.total_price` and
   * the bar's goal so the storefront can compare/rank without unit conversion.
   */
  price: number;
  /** Numeric first-variant ID for AJAX add-to-cart (`/cart/add.js`). */
  variantId: string;
  /** Whether the first variant is purchasable right now. */
  available: boolean;
  /**
   * Verified storefront URL for the product. It is the product's real
   * `onlineStoreUrl` when available, otherwise the relative `/products/<handle>`
   * path — only ever set for PUBLISHED products (unpublished products are
   * dropped in `toCompact`), so following it never lands on a 404.
   */
  url: string;
}

/** Payload stored in the `recommendations` metafield. */
export interface RecommendationsMetafield {
  source: ShipBoostSettings["recommendationSource"];
  products: RecommendationProduct[];
}

/** Minimal structural type for the authenticated Admin GraphQL client. */
interface AdminGraphqlClient {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<Response>;
}

/** Raw product node shape returned by the queries below. */
interface RawProduct {
  id: string;
  handle: string;
  title: string;
  /** Set once the product is published; null for draft/archived/unpublished. */
  publishedAt: string | null;
  /** Public online-store URL, or null (e.g. a password-protected store). */
  onlineStoreUrl: string | null;
  featuredImage: { url: string } | null;
  variants: {
    nodes: { id: string; price: string; availableForSale: boolean }[];
  };
}

const PRODUCT_FIELDS = `#graphql
  fragment ShipBoostRecProduct on Product {
    id
    handle
    title
    publishedAt
    onlineStoreUrl
    featuredImage {
      url
    }
    variants(first: 1) {
      nodes {
        id
        price
        availableForSale
      }
    }
  }`;

/** Extract the numeric ID from a Shopify GID (e.g. ".../ProductVariant/9" → "9"). */
function numericId(gid: string): string {
  const match = /\/(\d+)(?:\?.*)?$/.exec(gid);
  return match ? match[1] : "";
}

/**
 * Surface GraphQL top-level errors instead of silently returning an empty list.
 * The most common cause is an access-denied because the `read_products` scope
 * has not been granted yet (it was added after the app was first installed, so
 * merchants must re-authorize). Without this log the failure is invisible and
 * looks like "the store just has no products".
 */
function logGraphqlErrors(json: { errors?: unknown }, label: string): void {
  if (json && json.errors) {
    console.warn(
      `[ShipBoost] ${label} returned GraphQL errors — is the read_products ` +
        `scope granted? Re-authorize the app if it was recently added:`,
      JSON.stringify(json.errors),
    );
  }
}

/**
 * Distill a raw product to the compact shape, or null to DROP it. A product is
 * dropped when it has no variant, an invalid price, OR is not published
 * (`publishedAt` is null) — the latter guarantees a recommendation never links
 * to a deleted/draft/unpublished product, which would open a 404 storefront
 * page. Publication is the reliable signal even on password-protected stores,
 * where `onlineStoreUrl` is null for every product.
 */
function toCompact(raw: RawProduct | null | undefined): RecommendationProduct | null {
  if (!raw) return null;
  // Not published to the online store → its /products/<handle> page 404s. Skip.
  if (!raw.publishedAt) return null;
  const variant = raw.variants?.nodes?.[0];
  if (!variant) return null;

  const amount = Number(variant.price);
  if (!Number.isFinite(amount)) return null;

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    image: raw.featuredImage?.url ?? null,
    // Decimal major-unit string (e.g. "12.50") → integer cents.
    price: Math.round(amount * 100),
    variantId: numericId(variant.id),
    available: Boolean(variant.availableForSale),
    // Verified URL: the real online-store URL when present, else the relative
    // product path (valid because we only reach here for published products).
    url: raw.onlineStoreUrl || "/products/" + raw.handle,
  };
}

/** Parse the comma-separated manual product GIDs, trimmed and de-duplicated. */
function parseProductIds(raw: string): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const part of raw.split(",")) {
    const id = part.trim();
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids.slice(0, MAX_FETCH);
}

/**
 * Fetch a bounded pool of products from the whole catalog.
 *
 * NOTE: the Admin API's top-level `products` connection has NO `BEST_SELLING`
 * sort — `ProductSortKeys` only offers CREATED_AT/UPDATED_AT/TITLE/… (best-selling
 * exists only on a *collection's* products and on the Storefront API). Passing
 * `BEST_SELLING` makes the whole query error out and return zero products. We
 * sort by most-recently-updated instead: for the Smart Match source the order is
 * irrelevant (it re-ranks by price), and the Best Sellers source approximates
 * popularity with recency until a Storefront-API path is added.
 */
async function fetchProductPool(
  admin: AdminGraphqlClient,
  count: number,
): Promise<RecommendationProduct[]> {
  const response = await admin.graphql(
    `${PRODUCT_FIELDS}
      query ShipBoostProductPool($count: Int!) {
        products(first: $count, sortKey: UPDATED_AT, reverse: true) {
          nodes {
            ...ShipBoostRecProduct
          }
        }
      }`,
    { variables: { count } },
  );
  const json = (await response.json()) as {
    data?: { products?: { nodes?: RawProduct[] } };
    errors?: unknown;
  };
  logGraphqlErrors(json, "Product pool query");
  return (json.data?.products?.nodes ?? [])
    .map(toCompact)
    .filter((p): p is RecommendationProduct => p !== null);
}

async function fetchCollection(
  admin: AdminGraphqlClient,
  collectionId: string,
  count: number,
): Promise<RecommendationProduct[]> {
  if (!collectionId) return [];
  const response = await admin.graphql(
    `${PRODUCT_FIELDS}
      query ShipBoostCollection($id: ID!, $count: Int!) {
        collection(id: $id) {
          products(first: $count) {
            nodes {
              ...ShipBoostRecProduct
            }
          }
        }
      }`,
    { variables: { id: collectionId, count } },
  );
  const json = (await response.json()) as {
    data?: { collection?: { products?: { nodes?: RawProduct[] } } | null };
    errors?: unknown;
  };
  logGraphqlErrors(json, "Collection query");
  return (json.data?.collection?.products?.nodes ?? [])
    .map(toCompact)
    .filter((p): p is RecommendationProduct => p !== null);
}

async function fetchByIds(
  admin: AdminGraphqlClient,
  ids: string[],
): Promise<RecommendationProduct[]> {
  if (ids.length === 0) return [];
  const response = await admin.graphql(
    `${PRODUCT_FIELDS}
      query ShipBoostManualProducts($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            ...ShipBoostRecProduct
          }
        }
      }`,
    { variables: { ids } },
  );
  const json = (await response.json()) as {
    data?: { nodes?: (RawProduct | null)[] };
    errors?: unknown;
  };
  logGraphqlErrors(json, "Manual products query");
  // Preserve the merchant's chosen order; drop any nodes that aren't products.
  return (json.data?.nodes ?? [])
    .map(toCompact)
    .filter((p): p is RecommendationProduct => p !== null);
}

/**
 * Fetch the products needed for the merchant's chosen recommendation source.
 * Bounded by construction — never fetches the entire catalog.
 */
export async function fetchRecommendationProducts(
  admin: AdminGraphqlClient,
  settings: ShipBoostSettings,
): Promise<RecommendationProduct[]> {
  const cardCount = Math.min(
    settings.recommendationMax + OVERFETCH_BUFFER,
    MAX_FETCH,
  );

  switch (settings.recommendationSource) {
    case "smart":
      return fetchProductPool(admin, SMART_POOL_SIZE);
    case "best-sellers":
      return fetchProductPool(admin, cardCount);
    case "collection":
      return fetchCollection(admin, settings.recommendationCollectionId, cardCount);
    case "manual":
      return fetchByIds(admin, parseProductIds(settings.recommendationProductIds));
    default:
      return [];
  }
}

/**
 * Fetch the needed products and publish them to the `recommendations`
 * metafield so the storefront extension can render cards without any
 * storefront-side product API calls.
 *
 * Best-effort: when recommendations are disabled we publish an empty list (so a
 * stale list never lingers); on error the caller logs and continues — a failed
 * sync must never block the settings save.
 */
export async function syncRecommendationsMetafield(
  admin: AdminGraphqlClient,
  settings: ShipBoostSettings,
): Promise<void> {
  const products = settings.recommendationsEnabled
    ? await fetchRecommendationProducts(admin, settings)
    : [];

  // Recommendations are enabled but nothing came back — the storefront will not
  // render any cards. Log the likely reasons so it's diagnosable rather than a
  // silent no-op (the #1 cause is the read_products scope not being granted).
  if (settings.recommendationsEnabled && products.length === 0) {
    const reason =
      settings.recommendationSource === "collection" &&
      !settings.recommendationCollectionId
        ? "no collection is selected"
        : settings.recommendationSource === "manual" &&
            !settings.recommendationProductIds
          ? "no products are selected"
          : "the read_products scope may not be granted, or the source returned no products";
    console.warn(
      `[ShipBoost] Recommendations enabled (source="${settings.recommendationSource}") ` +
        `but 0 products were fetched — ${reason}. No cards will show on the storefront.`,
    );
  }

  const payload: RecommendationsMetafield = {
    source: settings.recommendationSource,
    products,
  };

  const shopResponse = await admin.graphql(
    `#graphql
      query ShipBoostShopIdForRecs {
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
      mutation ShipBoostSetRecommendations($metafields: [MetafieldsSetInput!]!) {
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
            key: SHIPBOOST_RECOMMENDATIONS_KEY,
            type: "json",
            value: JSON.stringify(payload),
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
    console.warn(
      "[ShipBoost] Failed to sync recommendations metafield:",
      userErrors.map((e) => e.message).join("; "),
    );
  }
}
