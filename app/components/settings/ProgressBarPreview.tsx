import { useEffect, type CSSProperties } from "react";

// Preview stylesheet — an exact mirror of the storefront extension CSS (see the
// SYNC note in preview-templates.css). Kept inside `app/` so the Settings route
// never imports across Vite's server.fs.allow boundary, which would break the
// route from loading. The preview still renders with the same CSS/classes/
// templates as the storefront (WYSIWYG).
import "./preview-templates.css";

import type { Position, ShipBoostSettings } from "../../lib/settings/types";
import {
  FONT_FAMILY_STACKS,
  googleFontFamily,
} from "../../lib/settings/typography";
import {
  DISPLAY_ON_OPTIONS,
  POSITION_OPTIONS,
} from "../../lib/settings/placement";
import { loadGoogleFont } from "../../lib/settings/fontLoader";
import { normalizeHexColor } from "../../lib/settings/color";
import { smartMatch } from "../../lib/recommendations/smart-match";

interface ProgressBarPreviewProps {
  settings: ShipBoostSettings;
}

/** A sample product used only for the recommendations preview. */
interface PreviewProduct {
  id: number;
  title: string;
  price: number; // cents, matching the storefront
}

/**
 * Choose sample products for the recommendations preview using the SAME engine
 * as the storefront: Smart Match ranks a synthetic pool against the remaining
 * amount; other sources show the curated order. Prices are spread around the
 * goal so Smart Match visibly favours products near the remaining amount.
 */
function previewRecommendations(
  settings: ShipBoostSettings,
  goalCents: number,
  remainingCents: number,
): PreviewProduct[] {
  const fractions = [0.15, 0.3, 0.4, 0.5, 0.75, 1.05];
  const pool: PreviewProduct[] = fractions.map((fraction, index) => ({
    id: index,
    title: `Sample product ${index + 1}`,
    price: Math.max(Math.round(goalCents * fraction), 100),
  }));

  if (settings.recommendationSource === "smart") {
    return smartMatch(pool, remainingCents, settings.recommendationMax);
  }
  return pool.slice(0, settings.recommendationMax);
}

/**
 * Recommendation cards for the live preview. Renders the exact same markup and
 * classes as the storefront script (ship-boost-recommendations.js) so the
 * preview stylesheet styles it identically. Links/buttons are inert here.
 */
function RecommendationCards({
  settings,
  products,
  formatMoney,
}: {
  settings: ShipBoostSettings;
  products: PreviewProduct[];
  formatMoney: (cents: number) => string;
}) {
  if (!products.length) return null;

  // Mirror the storefront's two-component split: Below Header ("none") renders
  // the header component (layout-aware), every other placement the product
  // component (always a stacked list). Same class namespaces as the storefront
  // JS, so the mirrored stylesheet renders it identically. Links/buttons inert.
  const isHeader = settings.position === "none";
  const ns = isHeader ? "shipboost-header-recs" : "shipboost-product-recs";

  return (
    <div
      className={ns}
      data-component={isHeader ? "header" : "product"}
      {...(isHeader ? { "data-layout": settings.recommendationLayout } : {})}
    >
      <p className={`${ns}__title`}>Recommended products</p>
      <div className={`${ns}__list`} data-sb-rec-list role="list">
        {products.map((product) => (
          <div key={product.id} className={`${ns}__card`} role="listitem">
            {settings.recommendationShowImage ? (
              <span className={`${ns}__img-link`} aria-hidden="true">
                <span className={`${ns}__img ${ns}__img--empty`} />
              </span>
            ) : null}
            <span className={`${ns}__name`}>{product.title}</span>
            {settings.recommendationShowPrice ? (
              <span className={`${ns}__price`}>
                {formatMoney(product.price)}
              </span>
            ) : null}
            {settings.recommendationShowButton ? (
              <button type="button" className={`${ns}__btn`} disabled>
                Add to cart
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// A small schematic of where the bar sits, for the placement preview. Returns
// the surrounding page context rows and the index the bar is inserted at.
function placementSchematic(position: Position): {
  context: string;
  rows: string[];
  barIndex: number;
} {
  switch (position) {
    case "none":
      return {
        context: "Any page",
        rows: ["Site header"],
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

// The storefront's `--sb-*` custom properties, built to EXACTLY mirror the
// Liquid block (extensions/ship-boost-progress-bar/blocks/progress-bar.liquid).
// The storefront is the source of truth: every value is the merchant's raw
// setting (colours normalized to `#RRGGBB`, exactly as the Liquid does). There
// is deliberately NO readability substitution — the storefront never alters the
// merchant's colours, so neither does the preview. Keep this in sync with the
// Liquid `style="--sb-...: ..."` assignments.
function toCssVars(settings: ShipBoostSettings): CSSProperties {
  return {
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
    "--sb-width": `${settings.customWidth}%`,
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

  // Recommendations preview — computed with the storefront Smart Match engine so
  // the admin preview stays synchronized with what shoppers will see.
  const formatMoneyCents = (cents: number) => formatMoney(cents / 100);
  const recProducts = settings.recommendationsEnabled
    ? previewRecommendations(
        settings,
        Math.round(goal * 100),
        Math.round(remaining * 100),
      )
    : [];

  const cssVars = toCssVars(settings);
  // Same classes the storefront applies, so width mode + sticky render identically.
  const wrapperClass = [
    "shipboost",
    `shipboost--${settings.template}`,
    `sb-width-${settings.widthMode}`,
    settings.stickyPosition === "sticky-top" ? "sb-sticky-top" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Neutral preview surface representing the store page. The .shipboost banner
  // itself is coloured via --sb-bg (exactly like the storefront), so the canvas
  // must NOT be painted with the merchant background — only the banner is.
  // The canvas represents the storefront page. Content/Custom widths sit inside
  // a 24px horizontal frame; Full Width fills the page edge to edge, so its
  // canvas has no horizontal padding and the bar is plain width:100% in normal
  // flow (no negative margins). `overflow: hidden` clips the bar to the card's
  // rounded corners.
  const canvasPadX = settings.widthMode === "full" ? 0 : 24;
  const canvasStyle: CSSProperties = {
    background: "#ffffff",
    padding: `20px ${canvasPadX}px`,
    borderRadius: "12px",
    border: "1px solid rgba(128, 128, 128, 0.3)",
    overflow: "hidden",
  };


  // "Goal reached" preview only: the success message + its 8px bottom margin add
  // extra space ABOVE the bar, so the space below looked smaller. Match it with
  // container padding (never margins on the bar): keep the top (20px) and
  // horizontal (24px) padding exactly, and grow ONLY the bottom by the message
  // line height (font-size × 1.4) + its 8px margin. The bar and message don't
  // move; the "Before goal" preview keeps `canvasStyle`.
  const successCanvasStyle: CSSProperties = {
    ...canvasStyle,
    paddingBottom: `${20 + Math.round(settings.fontSize * 1.4) + 8}px`,
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

  // Placement is independent of Width and Sticky: the selected Position always
  // determines where the bar is inserted.
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

        <div style={canvasStyle}>
          <div
            className={wrapperClass}
            data-position={settings.position}
            style={{ ...cssVars, margin: 0 }}
          >
            <p className="shipboost__message">{message}</p>
            <div className="shipboost__track">
              <div
                className="shipboost__fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            {settings.recommendationsEnabled ? (
              <RecommendationCards
                settings={settings}
                products={recProducts}
                formatMoney={formatMoneyCents}
              />
            ) : null}
          </div>
        </div>
        <s-text color="subdued">
          Sample cart {formatMoney(sampleCart)} of {formatMoney(goal)} goal
        </s-text>

        <s-divider />

        <s-text color="subdued">Goal reached</s-text>
        <div style={successCanvasStyle}>
          <div
            className={`${wrapperClass} is-complete`}
            data-position={settings.position}
            style={{ ...cssVars, margin: 0 }}
          >
            <p className="shipboost__message">{settings.successMessage}</p>
            <div className="shipboost__track">
              <div className="shipboost__fill" style={{ width: "100%" }} />
            </div>
            {settings.recommendationsEnabled &&
            !settings.recommendationHideAfterGoal ? (
              <RecommendationCards
                settings={settings}
                products={recProducts}
                formatMoney={formatMoneyCents}
              />
            ) : null}
          </div>
        </div>
      </s-stack>
    </s-section>
  );
}
