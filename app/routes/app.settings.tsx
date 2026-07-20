import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
import { getSettings, saveSettings } from "../lib/settings/settings.server";
import { syncSettingsMetafield } from "../lib/settings/metafield.server";
import { syncRecommendationsMetafield } from "../lib/recommendations/fetch.server";
import { validateSettings } from "../lib/settings/validate";
import type {
  CurrencyCode,
  DisplayOn,
  FontFamily,
  FontWeight,
  Position,
  RecommendationSource,
  ShipBoostSettings,
  StickyPosition,
  TemplateStyle,
  TextAlign,
  WidthMode,
} from "../lib/settings/types";
import { SettingsForm } from "../components/settings/SettingsForm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Read the shop's settings from the database, creating defaults on first use.
  const settings = await getSettings(session.shop);

  // Best-effort: keep the storefront metafield in sync with the database so the
  // theme extension always has current values (even before the first save).
  try {
    await syncSettingsMetafield(admin, settings);
  } catch (error) {
    console.warn("[ShipBoost] Settings metafield sync (loader) failed:", error);
  }

  // Also refresh the recommendation product list on load (parity with the
  // settings metafield). This self-heals the common case where `read_products`
  // was granted AFTER the last save, or recommendations were enabled but the
  // list was never (re)published — opening Settings republishes it. Only fetches
  // when the feature is enabled, and never blocks the page on failure.
  if (settings.recommendationsEnabled) {
    try {
      await syncRecommendationsMetafield(admin, settings);
    } catch (error) {
      console.warn(
        "[ShipBoost] Recommendations metafield sync (loader) failed:",
        error,
      );
    }
  }

  // Whether the current access token was granted `read_products`. It is required
  // to fetch recommendation products; when missing (the scope was added after
  // install and the merchant hasn't re-authorized), the storefront shows no
  // cards. Surface this in the UI so the cause is obvious.
  const hasProductScope = (session.scope ?? "")
    .split(",")
    .map((scope) => scope.trim())
    .includes("read_products");

  return { settings, hasProductScope };
};

/** Reconstruct a `ShipBoostSettings` object from submitted form data. */
function parseForm(formData: FormData): ShipBoostSettings {
  return {
    enabled: formData.get("enabled") === "true",
    template: String(formData.get("template") ?? "modern") as TemplateStyle,
    goalAmount: String(formData.get("goalAmount") ?? ""),
    currencyCode: String(formData.get("currencyCode") ?? "USD") as CurrencyCode,
    barColor: String(formData.get("barColor") ?? ""),
    backgroundColor: String(formData.get("backgroundColor") ?? ""),
    successColor: String(formData.get("successColor") ?? ""),
    remainingMessage: String(formData.get("remainingMessage") ?? ""),
    successMessage: String(formData.get("successMessage") ?? ""),
    borderRadius: Number(formData.get("borderRadius")),
    barHeight: Number(formData.get("barHeight")),
    fontFamily: String(formData.get("fontFamily") ?? "theme") as FontFamily,
    fontSize: Number(formData.get("fontSize")),
    fontWeight: Number(formData.get("fontWeight")) as FontWeight,
    textColor: String(formData.get("textColor") ?? ""),
    textAlign: String(formData.get("textAlign") ?? "center") as TextAlign,
    displayOn: String(formData.get("displayOn") ?? "all") as DisplayOn,
    position: String(
      formData.get("position") ?? "below-add-to-cart",
    ) as Position,
    enableMobile: formData.get("enableMobile") === "true",
    enableDesktop: formData.get("enableDesktop") === "true",
    widthMode: String(formData.get("widthMode") ?? "full") as WidthMode,
    customWidth: Number(formData.get("customWidth")),
    stickyPosition: String(
      formData.get("stickyPosition") ?? "normal",
    ) as StickyPosition,
    recommendationsEnabled: formData.get("recommendationsEnabled") === "true",
    recommendationSource: String(
      formData.get("recommendationSource") ?? "smart",
    ) as RecommendationSource,
    recommendationMax: Number(formData.get("recommendationMax")),
    recommendationShowImage: formData.get("recommendationShowImage") === "true",
    recommendationShowPrice: formData.get("recommendationShowPrice") === "true",
    recommendationShowButton:
      formData.get("recommendationShowButton") === "true",
    recommendationHideAfterGoal:
      formData.get("recommendationHideAfterGoal") === "true",
    recommendationCollectionId: String(
      formData.get("recommendationCollectionId") ?? "",
    ),
    recommendationProductIds: String(
      formData.get("recommendationProductIds") ?? "",
    ),
    recommendationButtonMode: String(
      formData.get("recommendationButtonMode") ?? "theme",
    ) as ShipBoostSettings["recommendationButtonMode"],
    // The button config travels as a single JSON string; validate normalizes it.
    recommendationButton: parseButtonField(
      formData.get("recommendationButton"),
    ),
  };
}

/** Parse the serialized button config; validation normalizes the result. */
function parseButtonField(
  value: FormDataEntryValue | null,
): ShipBoostSettings["recommendationButton"] {
  try {
    return JSON.parse(
      String(value ?? "{}"),
    ) as ShipBoostSettings["recommendationButton"];
  } catch {
    return {} as ShipBoostSettings["recommendationButton"];
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const formData = await request.formData();
  const { errors, value } = validateSettings(parseForm(formData));

  if (errors) {
    return { ok: false as const, errors };
  }

  const settings = await saveSettings(session.shop, value);

  // Publish to the storefront metafield so the theme extension reflects the
  // new values. Best-effort — a metafield failure must not fail the save.
  try {
    await syncSettingsMetafield(admin, settings);
  } catch (error) {
    console.warn("[ShipBoost] Settings metafield sync (action) failed:", error);
  }

  // Refresh the published recommendation product list to match the saved
  // source/selection. Only runs on save (never on the dashboard render path),
  // and is best-effort so a product-fetch failure never blocks the save.
  try {
    await syncRecommendationsMetafield(admin, settings);
  } catch (error) {
    console.warn(
      "[ShipBoost] Recommendations metafield sync (action) failed:",
      error,
    );
  }

  return { ok: true as const, settings };
};

export default function SettingsRoute() {
  const { settings, hasProductScope } = useLoaderData<typeof loader>();

  return (
    <SettingsForm
      initialSettings={settings}
      hasProductScope={hasProductScope}
    />
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
