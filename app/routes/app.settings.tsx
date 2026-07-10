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
import { validateSettings } from "../lib/settings/validate";
import type {
  CurrencyCode,
  DisplayOn,
  FontFamily,
  FontWeight,
  Position,
  ShipBoostSettings,
  TemplateStyle,
  TextAlign,
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

  return { settings };
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
  };
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

  return { ok: true as const, settings };
};

export default function SettingsRoute() {
  const { settings } = useLoaderData<typeof loader>();

  return <SettingsForm initialSettings={settings} />;
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
