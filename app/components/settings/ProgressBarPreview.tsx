import { useEffect, type CSSProperties } from "react";

// Preview stylesheet — an exact mirror of the storefront extension CSS (see the
// SYNC note in preview-templates.css). Kept inside `app/` so the Settings route
// never imports across Vite's server.fs.allow boundary, which would break the
// route from loading. The preview still renders with the same CSS/classes/
// templates as the storefront (WYSIWYG).
import "./preview-templates.css";

import type {
  Position,
  ShipBoostSettings,
  TemplateStyle,
} from "../../lib/settings/types";
import {
  FONT_FAMILY_STACKS,
  googleFontFamily,
} from "../../lib/settings/typography";
import {
  DISPLAY_ON_OPTIONS,
  POSITION_OPTIONS,
} from "../../lib/settings/placement";
import { loadGoogleFont } from "../../lib/settings/fontLoader";
import {
  contrastRatio,
  normalizeHexColor,
  readableTextColor,
} from "../../lib/settings/color";

interface ProgressBarPreviewProps {
  settings: ShipBoostSettings;
}

const MIN_CONTRAST = 4.5;

/**
 * Templates that paint their own opaque surface behind the message. For these,
 * the message sits on the template card (dark), not on the selected background.
 * Used only for the readability calculation, not for rendering. Other templates
 * are transparent, so the message sits on the selected background color.
 */
const TEMPLATE_SURFACE: Partial<Record<TemplateStyle, string>> = {
  luxury: "#141414",
  neon: "#0a0a12",
};

// A small schematic of where the bar sits, for the placement preview. Returns
// the surrounding page context rows and the index the bar is inserted at.
function placementSchematic(position: Position): {
  context: string;
  rows: string[];
  barIndex: number;
} {
  switch (position) {
    case "above-product-info":
      return {
        context: "Product page",
        rows: ["Product information", "Add to cart button"],
        barIndex: 0,
      };
    case "below-product-info":
      return {
        context: "Product page",
        rows: ["Product information", "Add to cart button"],
        barIndex: 1,
      };
    case "above-add-to-cart":
      return {
        context: "Product page",
        rows: ["Product information", "Add to cart button"],
        barIndex: 1,
      };
    case "below-add-to-cart":
      return {
        context: "Product page",
        rows: ["Product information", "Add to cart button"],
        barIndex: 2,
      };
  }
}

function optionLabel(
  options: { value: string; label: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

// The storefront's own CSS custom properties, built exactly like the Liquid.
// `textColor` is passed in so the preview can substitute a readable colour
// without touching the merchant's saved Text color setting.
function toCssVars(
  settings: ShipBoostSettings,
  textColor: string,
): CSSProperties {
  return {
    "--sb-bar": normalizeHexColor(settings.barColor),
    "--sb-bg": normalizeHexColor(settings.backgroundColor),
    "--sb-success": normalizeHexColor(settings.successColor),
    "--sb-radius": `${settings.borderRadius}px`,
    "--sb-height": `${settings.barHeight}px`,
    "--sb-font-family": FONT_FAMILY_STACKS[settings.fontFamily],
    "--sb-font-size": `${settings.fontSize}px`,
    "--sb-font-weight": String(settings.fontWeight),
    "--sb-text-color": textColor,
    "--sb-text-align": settings.textAlign,
  } as CSSProperties;
}

/**
 * A live, storefront-accurate (WYSIWYG) preview. It uses the real storefront
 * stylesheet, markup and CSS variables, so every template and typography choice
 * renders here exactly as it will on the storefront. A fixed sample cart at 60%
 * shows the in-progress state; a second banner shows the reached state.
 */
export function ProgressBarPreview({ settings }: ProgressBarPreviewProps) {
  // Load only the selected Google Font (cached) so the preview matches the
  // storefront. "theme" loads nothing and inherits the admin/store font.
  useEffect(() => {
    loadGoogleFont(googleFontFamily(settings.fontFamily));
  }, [settings.fontFamily]);

  const goal = Number(settings.goalAmount) || 0;
  const sampleCart = Math.round(goal * 0.6 * 100) / 100;
  const remaining = Math.max(goal - sampleCart, 0);
  const progress = goal > 0 ? Math.min((sampleCart / goal) * 100, 100) : 0;

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: settings.currencyCode,
    }).format(amount);

  const message = settings.remainingMessage.replace(
    "{{remaining}}",
    formatMoney(remaining),
  );

  // The surface the message actually sits on in the preview: the merchant's
  // selected background color, unless the template paints its own card.
  const backgroundColor = normalizeHexColor(settings.backgroundColor);
  const messageSurface = TEMPLATE_SURFACE[settings.template] ?? backgroundColor;

  // Preview-only readable text. Keeps the merchant's Text color when it's
  // legible; substitutes light/dark only when needed. Never persisted.
  const preferredText = normalizeHexColor(settings.textColor);
  const previewText = readableTextColor(
    messageSurface,
    preferredText,
    MIN_CONTRAST,
  );
  const textWasAdjusted =
    previewText.toLowerCase() !== preferredText.toLowerCase();
  const ratio = contrastRatio(preferredText, messageSurface);

  const cssVars = toCssVars(settings, previewText);
  const wrapperClass = `shipboost shipboost--${settings.template}`;

  // Neutral preview surface representing the store page. The .shipboost banner
  // itself is coloured via --sb-bg (exactly like the storefront), so the canvas
  // must NOT be painted with the merchant background — only the banner is.
  const canvasStyle: CSSProperties = {
    background: "#ffffff",
    padding: "20px 24px",
    borderRadius: "12px",
    border: "1px solid rgba(128, 128, 128, 0.3)",
  };

  if (!settings.enabled) {
    return (
      <s-section heading="Live preview">
        <s-paragraph>
          <s-text color="subdued">
            The progress bar is currently disabled and will not appear on your
            storefront.
          </s-text>
        </s-paragraph>
      </s-section>
    );
  }

  const schematic = placementSchematic(settings.position);
  const schematicRows: { label: string; isBar: boolean }[] = [];
  schematic.rows.forEach((label, index) => {
    if (index === schematic.barIndex) {
      schematicRows.push({ label: "ShipBoost progress bar", isBar: true });
    }
    schematicRows.push({ label, isBar: false });
  });
  if (schematic.barIndex >= schematic.rows.length) {
    schematicRows.push({ label: "ShipBoost progress bar", isBar: true });
  }

  return (
    <s-section heading="Live preview">
      <s-stack direction="block" gap="base">
        <div
          style={{
            padding: "12px 16px",
            border: "1px solid #e1e3e5",
            borderRadius: "12px",
            background: "#f6f6f7",
          }}
        >
          <s-stack direction="block" gap="small">
            <s-text>
              <s-text type="strong">Placement</s-text> —{" "}
              {optionLabel(DISPLAY_ON_OPTIONS, settings.displayOn)} ·{" "}
              {optionLabel(POSITION_OPTIONS, settings.position)}
            </s-text>
            <s-text color="subdued">
              Mobile {settings.enableMobile ? "on" : "off"} · Desktop{" "}
              {settings.enableDesktop ? "on" : "off"} · {schematic.context}
            </s-text>
            {schematicRows.map((row, index) => (
              <div
                key={index}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: row.isBar ? 600 : 400,
                  color: row.isBar ? "#0b6b3a" : "#616161",
                  background: row.isBar ? "#e3f1df" : "#ffffff",
                  border: row.isBar ? "1px solid #a7d3b3" : "1px solid #e1e3e5",
                }}
              >
                {row.isBar ? "★ " : ""}
                {row.label}
              </div>
            ))}
          </s-stack>
        </div>

        {textWasAdjusted && ratio !== null ? (
          <s-banner tone="warning" heading="Low text contrast">
            <s-paragraph>
              Your text color contrasts {ratio.toFixed(1)}:1 with the background
              (below {MIN_CONTRAST}:1). The preview shows a more readable color
              so you can keep configuring — adjust your Text color for a legible
              result on your storefront.
            </s-paragraph>
          </s-banner>
        ) : null}

        <div style={canvasStyle}>
          <div className={wrapperClass} style={cssVars}>
            <p className="shipboost__message">{message}</p>
            <div className="shipboost__track">
              <div
                className="shipboost__fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <s-text color="subdued">
          Sample cart {formatMoney(sampleCart)} of {formatMoney(goal)} goal
        </s-text>

        <s-divider />

        <s-text color="subdued">Goal reached</s-text>
        <div style={canvasStyle}>
          <div className={`${wrapperClass} is-complete`} style={cssVars}>
            <p className="shipboost__message">{settings.successMessage}</p>
            <div className="shipboost__track">
              <div className="shipboost__fill" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </s-stack>
    </s-section>
  );
}
