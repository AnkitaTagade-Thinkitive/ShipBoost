import { useEffect, type CSSProperties } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

// Storefront stylesheet (mirror) so the Live Preview renders exactly like the
// storefront. Imported read-only — not modified.
import "../components/settings/preview-templates.css";

import { authenticate } from "../shopify.server";
import {
  getSettings,
  getSettingsUpdatedAt,
} from "../lib/settings/settings.server";
import { normalizeHexColor } from "../lib/settings/color";
import {
  FONT_FAMILY_OPTIONS,
  FONT_FAMILY_STACKS,
  googleFontFamily,
} from "../lib/settings/typography";
import { loadGoogleFont } from "../lib/settings/fontLoader";
import {
  DISPLAY_ON_OPTIONS,
  POSITION_OPTIONS,
} from "../lib/settings/placement";
import { TEMPLATE_OPTIONS } from "../lib/settings/templates";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Read-only: reuse the existing settings loader to power the dashboard.
  const settings = await getSettings(session.shop);
  const updatedAt = await getSettingsUpdatedAt(session.shop);

  // Best-effort: show the live theme's name/status. Never breaks the dashboard
  // if the query fails (e.g. permission not yet granted).
  let theme: { name: string; status: string } | null = null;
  try {
    const response = await admin.graphql(
      `#graphql
        query ShipBoostMainTheme {
          themes(first: 20) {
            nodes {
              name
              role
            }
          }
        }`,
    );
    const json = (await response.json()) as {
      data?: { themes?: { nodes?: { name: string; role: string }[] } };
    };
    const main = json.data?.themes?.nodes?.find((node) => node.role === "MAIN");
    if (main) {
      theme = { name: main.name, status: "Live" };
    }
  } catch {
    // graceful — theme info is optional
  }

  return { settings, shop: session.shop, updatedAt, theme };
};

function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

const TILE = {
  padding: "base",
  borderWidth: "base",
  borderRadius: "base",
  background: "subdued",
} as const;

const CANVAS: CSSProperties = {
  background: "#ffffff",
  padding: "16px 20px",
  borderRadius: "12px",
  border: "1px solid #e1e3e5",
};

export default function Index() {
  const { settings, shop, updatedAt, theme } = useLoaderData<typeof loader>();

  // Load only the selected Google Font so the preview matches the storefront.
  useEffect(() => {
    loadGoogleFont(googleFontFamily(settings.fontFamily));
  }, [settings.fontFamily]);

  const themeEditorUrl = `https://${shop}/admin/themes/current/editor`;
  const storeUrl = `https://${shop}`;

  const lastUpdated = updatedAt
    ? new Date(updatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const money = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: settings.currencyCode,
    }).format(amount);

  const goalAmount = Number(settings.goalAmount) || 0;
  const goalLabel = money(goalAmount);
  const sampleCart = Math.round(goalAmount * 0.6 * 100) / 100;
  const remaining = Math.max(goalAmount - sampleCart, 0);
  const progress =
    goalAmount > 0 ? Math.min((sampleCart / goalAmount) * 100, 100) : 0;
  const remainingMessage = settings.remainingMessage.replace(
    "{{remaining}}",
    money(remaining),
  );

  const displayOnLabel = optionLabel(DISPLAY_ON_OPTIONS, settings.displayOn);
  const positionLabel = optionLabel(POSITION_OPTIONS, settings.position);
  const templateLabel = optionLabel(TEMPLATE_OPTIONS, settings.template);
  const fontLabel = optionLabel(FONT_FAMILY_OPTIONS, settings.fontFamily);

  // Storefront CSS variables from the merchant's actual settings.
  const previewVars = {
    "--sb-bar": normalizeHexColor(settings.barColor),
    "--sb-bg": normalizeHexColor(settings.backgroundColor),
    "--sb-success": normalizeHexColor(settings.successColor),
    "--sb-radius": `${settings.borderRadius}px`,
    "--sb-height": `${settings.barHeight}px`,
    "--sb-font-family": FONT_FAMILY_STACKS[settings.fontFamily],
    "--sb-font-size": `${settings.fontSize}px`,
    "--sb-font-weight": String(settings.fontWeight),
    "--sb-text-color": normalizeHexColor(settings.textColor),
    "--sb-text-align": settings.textAlign,
  } as CSSProperties;

  // Setup checklist — real status derived from the saved settings (read-only).
  const enabled = settings.enabled;
  const goalSet = goalAmount > 0;
  const deviceVisible = settings.enableMobile || settings.enableDesktop;
  const ready = enabled && goalSet && deviceVisible;
  const checklist = [
    {
      label: "App installed",
      done: true,
      hint: "ShipBoost is connected to your store.",
    },
    {
      label: "Free shipping goal set",
      done: goalSet,
      hint: goalSet
        ? `Your goal is ${goalLabel}.`
        : "Set a free shipping goal in Settings.",
    },
    {
      label: "Progress bar enabled",
      done: enabled,
      hint: enabled
        ? "The bar is turned on."
        : "Turn the progress bar on in Settings.",
    },
    {
      label: "Visible on a device",
      done: deviceVisible,
      hint: deviceVisible
        ? "Showing on mobile and/or desktop."
        : "Enable mobile or desktop in Settings.",
    },
    {
      label: "Store ready",
      done: ready,
      hint: ready
        ? "Everything looks ready to go."
        : "Finish the steps above to go live.",
    },
  ];
  const completed = checklist.filter((item) => item.done).length;

  const barSettings = [
    { label: "Goal amount", value: goalLabel },
    { label: "Template", value: templateLabel },
    { label: "Placement", value: positionLabel },
    { label: "Display on", value: displayOnLabel },
    { label: "Mobile", value: settings.enableMobile ? "On" : "Off" },
    { label: "Desktop", value: settings.enableDesktop ? "On" : "Off" },
    { label: "Font family", value: fontLabel },
    { label: "Font size", value: `${settings.fontSize}px` },
  ];

  return (
    <s-page heading="ShipBoost">
      <s-button slot="primary-action" variant="primary" href="/app/settings">
        Open settings
      </s-button>

      {/* Onboarding / setup banner — auto-hides once setup is complete */}
      {!ready ? (
        <s-banner tone="warning" heading="Finish setting up ShipBoost">
          <s-paragraph>
            Your progress bar isn’t live yet. Complete the setup checklist below,
            then add the ShipBoost block in your theme editor to show it on your
            storefront.
          </s-paragraph>
          <s-stack direction="inline" gap="base">
            <s-button variant="primary" href="/app/settings">
              Open Settings
            </s-button>
            <s-button href={themeEditorUrl} target="_blank">
              Open Theme Editor
            </s-button>
          </s-stack>
        </s-banner>
      ) : null}

      {/* 1. Hero */}
      <s-section>
        <s-stack direction="block" gap="small">
          <s-heading>Boost average order value with free shipping</s-heading>
          <s-paragraph>
            Show customers exactly how close they are to free shipping with a
            fully customizable progress bar — a proven way to lift cart size and
            conversion.
          </s-paragraph>
          <s-stack direction="inline" gap="small">
            <s-button variant="primary" href="/app/settings">
              Open Settings
            </s-button>
            <s-button href={themeEditorUrl} target="_blank">
              Customize Theme
            </s-button>
            <s-button href={storeUrl} target="_blank">
              Preview Store
            </s-button>
          </s-stack>
        </s-stack>
      </s-section>

      {/* 2. Live preview */}
      <s-section heading="Live preview">
        {goalSet ? (
          <s-stack direction="block" gap="base">
            <s-stack direction="block" gap="small-300">
              <s-text color="subdued">Before goal</s-text>
              <div style={CANVAS}>
                <div
                  className={`shipboost shipboost--${settings.template}`}
                  style={previewVars}
                >
                  <p className="shipboost__message">{remainingMessage}</p>
                  <div className="shipboost__track">
                    <div
                      className="shipboost__fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </s-stack>
            <s-stack direction="block" gap="small-300">
              <s-text color="subdued">Goal reached</s-text>
              <div style={CANVAS}>
                <div
                  className={`shipboost shipboost--${settings.template} is-complete`}
                  style={previewVars}
                >
                  <p className="shipboost__message">{settings.successMessage}</p>
                  <div className="shipboost__track">
                    <div className="shipboost__fill" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </s-stack>
          </s-stack>
        ) : (
          <s-stack direction="block" gap="base">
            <s-paragraph>
              Set a free shipping goal to preview your progress bar.
            </s-paragraph>
            <s-button href="/app/settings">Set a goal</s-button>
          </s-stack>
        )}
      </s-section>

      {/* 3. Overview */}
      <s-section heading="Overview">
        <s-grid
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
          gap="base"
        >
          <s-box {...TILE}>
            <s-stack direction="block" gap="small-300">
              <s-stack direction="inline" gap="small-300" alignItems="center">
                <s-icon type="status-active" color="subdued" />
                <s-text color="subdued">App status</s-text>
              </s-stack>
              <s-badge tone={enabled ? "success" : "critical"}>
                {enabled ? "Enabled" : "Disabled"}
              </s-badge>
            </s-stack>
          </s-box>
          <s-box {...TILE}>
            <s-stack direction="block" gap="small-300">
              <s-stack direction="inline" gap="small-300" alignItems="center">
                <s-icon type="cash-dollar" color="subdued" />
                <s-text color="subdued">Free shipping goal</s-text>
              </s-stack>
              {goalSet ? (
                <s-text type="strong">{goalLabel}</s-text>
              ) : (
                <s-badge tone="warning">Not set</s-badge>
              )}
            </s-stack>
          </s-box>
          <s-box {...TILE}>
            <s-stack direction="block" gap="small-300">
              <s-stack direction="inline" gap="small-300" alignItems="center">
                <s-icon type="location" color="subdued" />
                <s-text color="subdued">Current placement</s-text>
              </s-stack>
              <s-text type="strong">{positionLabel}</s-text>
            </s-stack>
          </s-box>
          <s-box {...TILE}>
            <s-stack direction="block" gap="small-300">
              <s-stack direction="inline" gap="small-300" alignItems="center">
                <s-icon type="page" color="subdued" />
                <s-text color="subdued">Display on</s-text>
              </s-stack>
              <s-text type="strong">{displayOnLabel}</s-text>
            </s-stack>
          </s-box>
          <s-box {...TILE}>
            <s-stack direction="block" gap="small-300">
              <s-stack direction="inline" gap="small-300" alignItems="center">
                <s-icon type="adjust" color="subdued" />
                <s-text color="subdued">Live theme</s-text>
              </s-stack>
              {theme ? (
                <s-stack
                  direction="inline"
                  gap="small-300"
                  alignItems="center"
                >
                  <s-text type="strong">{theme.name}</s-text>
                  <s-badge tone="success">{theme.status}</s-badge>
                </s-stack>
              ) : (
                <s-text color="subdued">Unavailable</s-text>
              )}
            </s-stack>
          </s-box>
          <s-box {...TILE}>
            <s-stack direction="block" gap="small-300">
              <s-stack direction="inline" gap="small-300" alignItems="center">
                <s-icon type="calendar-check" color="subdued" />
                <s-text color="subdued">Last updated</s-text>
              </s-stack>
              <s-text type="strong">{lastUpdated ?? "—"}</s-text>
            </s-stack>
          </s-box>
        </s-grid>
      </s-section>

      {/* 4. Setup checklist */}
      <s-section heading="Setup checklist">
        <s-stack direction="block" gap="base">
          <s-text color="subdued">
            {completed} of {checklist.length} steps complete
          </s-text>
          {checklist.map((item) => (
            <s-stack
              key={item.label}
              direction="inline"
              gap="base"
              alignItems="start"
            >
              <s-icon
                type={item.done ? "check-circle-filled" : "alert-triangle"}
                tone={item.done ? "success" : "warning"}
              />
              <s-stack direction="block" gap="small-500">
                <s-text type="strong">{item.label}</s-text>
                <s-text color="subdued">{item.hint}</s-text>
              </s-stack>
            </s-stack>
          ))}
        </s-stack>
      </s-section>

      {/* 5. Progress bar settings */}
      <s-section heading="Progress bar settings">
        <s-grid
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
          gap="base"
        >
          {barSettings.map((row) => (
            <s-stack key={row.label} direction="block" gap="small-500">
              <s-text color="subdued">{row.label}</s-text>
              <s-text type="strong">{row.value}</s-text>
            </s-stack>
          ))}
        </s-grid>
      </s-section>

      {/* 7. Tip */}
      <s-banner tone="info" heading="Tip">
        <s-paragraph>
          Placing the progress bar below the Add to Cart button generally
          provides the highest visibility and the biggest lift in average order
          value.
        </s-paragraph>
      </s-banner>
    </s-page>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
