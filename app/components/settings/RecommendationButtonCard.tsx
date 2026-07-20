import { useState, type CSSProperties, type ReactNode } from "react";

import type {
  RecButton,
  RecButtonMode,
  ShipBoostSettings,
} from "../../lib/settings/types";
import {
  DEFAULT_REC_BUTTON,
  REC_BUTTON_ALIGN_OPTIONS,
  REC_BUTTON_BORDER_STYLE_OPTIONS,
  REC_BUTTON_ICON_OPTIONS,
  REC_BUTTON_ICON_POSITION_OPTIONS,
  REC_BUTTON_SIZE_OPTIONS,
  REC_BUTTON_TIMING_OPTIONS,
  REC_BUTTON_TRANSFORM_OPTIONS,
  REC_BUTTON_WEIGHT_OPTIONS,
  REC_BUTTON_WIDTH_OPTIONS,
  recButtonClasses,
  recButtonCssVars,
  recButtonIconSvg,
} from "../../lib/settings/recButton";
import { fieldValue } from "../../lib/polaris/fieldEvents";

interface RecommendationButtonCardProps {
  settings: ShipBoostSettings;
  onChange: (patch: Partial<ShipBoostSettings>) => void;
}

const COLS = "repeat(auto-fit, minmax(210px, 1fr))";

const sectionBoxStyle: CSSProperties = {
  border: "1px solid #e1e3e5",
  borderRadius: "10px",
  overflow: "hidden",
};
const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "12px 14px",
  background: "#f6f6f7",
  border: "none",
  borderBottom: "1px solid #e1e3e5",
  font: "inherit",
  fontWeight: 600,
  cursor: "pointer",
};

/**
 * "Add to Cart Button" settings — a premium, Polaris-style editor.
 *
 * • Segmented Theme / Custom control.
 * • Theme mode auto-detects the storefront theme button; every property is an
 *   OPTIONAL override (blank = inherit). Each overridden field has its own Reset.
 * • Colour pickers, hover state, width/size/alignment, border style and icons.
 * • Collapsible sections (state remembered while editing) + a live button
 *   preview with a "Using Theme Button" badge.
 *
 * Presentational only — changes flow up via onChange and the main Live Preview
 * updates instantly (no Save required).
 */
export function RecommendationButtonCard({
  settings,
  onChange,
}: RecommendationButtonCardProps) {
  const btn = settings.recommendationButton;
  const isTheme = settings.recommendationButtonMode === "theme";

  const [open, setOpen] = useState<Record<string, boolean>>({
    appearance: true,
    typography: false,
    sizing: false,
    hover: false,
    advanced: false,
  });
  const toggle = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const set = (patch: Partial<RecButton>) =>
    onChange({ recommendationButton: { ...btn, ...patch } });
  const reset = (key: keyof RecButton) =>
    set({ [key]: DEFAULT_REC_BUTTON[key] } as Partial<RecButton>);

  // ---- Field renderers ------------------------------------------------------
  const details = (help: string) => {
    const inherit = isTheme
      ? "Blank inherits the theme."
      : "Blank uses the default.";
    return help ? `${help} ${inherit}` : inherit;
  };

  const withReset = (key: keyof RecButton, control: ReactNode) => {
    const overridden = String(btn[key] ?? "") !== "";
    return (
      <s-stack key={key} direction="block" gap="small-300">
        {control}
        {overridden ? (
          <s-button onClick={() => reset(key)}>Reset</s-button>
        ) : null}
      </s-stack>
    );
  };

  const color = (key: keyof RecButton, label: string, help = "") =>
    withReset(
      key,
      <s-color-field
        label={label}
        details={details(help)}
        value={String(btn[key] ?? "")}
        onChange={(event) =>
          set({ [key]: fieldValue(event) } as Partial<RecButton>)
        }
      />,
    );

  const textInput = (
    key: keyof RecButton,
    label: string,
    help = "",
    placeholder?: string,
  ) =>
    withReset(
      key,
      <s-text-field
        label={label}
        details={details(help)}
        placeholder={placeholder}
        value={String(btn[key] ?? "")}
        onChange={(event) =>
          set({ [key]: fieldValue(event) } as Partial<RecButton>)
        }
      />,
    );

  const selectInput = (
    key: keyof RecButton,
    label: string,
    options: { value: string; label: string }[],
    help = "",
  ) =>
    withReset(
      key,
      <s-select
        label={label}
        details={details(help)}
        value={String(btn[key] ?? "")}
        onChange={(event) =>
          set({ [key]: fieldValue(event) } as Partial<RecButton>)
        }
      >
        {options.map((o) => (
          <s-option key={o.value} value={o.value}>
            {o.label}
          </s-option>
        ))}
      </s-select>,
    );

  const grid = (children: ReactNode) => (
    <s-grid gridTemplateColumns={COLS} gap="base">
      {children}
    </s-grid>
  );

  const section = (id: string, title: string, body: ReactNode) => (
    <div style={sectionBoxStyle}>
      <button
        type="button"
        style={sectionHeaderStyle}
        onClick={() => toggle(id)}
        aria-expanded={open[id]}
      >
        <span>{title}</span>
        <span style={{ color: "#616161", fontWeight: 400 }}>
          {open[id] ? "Hide" : "Show"}
        </span>
      </button>
      {open[id] ? (
        <div style={{ padding: "14px" }}>{body}</div>
      ) : null}
    </div>
  );

  return (
    <s-section heading="Add to Cart Button">
      <s-stack direction="block" gap="large">
        {/* Segmented mode control. */}
        <s-stack direction="block" gap="small-300">
          <s-text type="strong">Button style</s-text>
          <s-stack direction="inline" gap="small-300">
            <s-button
              {...(isTheme ? { variant: "primary" } : {})}
              onClick={() =>
                onChange({
                  recommendationButtonMode: "theme" as RecButtonMode,
                })
              }
            >
              Theme Button
            </s-button>
            <s-button
              {...(!isTheme ? { variant: "primary" } : {})}
              onClick={() =>
                onChange({
                  recommendationButtonMode: "custom" as RecButtonMode,
                })
              }
            >
              Custom Button
            </s-button>
          </s-stack>
        </s-stack>

        <ButtonPreview settings={settings} isTheme={isTheme} />

        {/* Button label — both modes. */}
        <s-text-field
          label="Button text"
          details='For example "Buy Now", "Quick Add", or "Add".'
          placeholder="Add to cart"
          value={btn.text}
          onChange={(event) =>
            set({ text: fieldValue(event) || "Add to cart" })
          }
        />

        {section(
          "appearance",
          "Appearance",
          grid(
            <>
              {color("bg", "Background color", "Fill colour of the button.")}
              {color("textColor", "Text color", "Colour of the label.")}
              {color("borderColor", "Border color")}
              {textInput("borderWidth", "Border width (px)", "", "0")}
              {selectInput(
                "borderStyle",
                "Border style",
                REC_BUTTON_BORDER_STYLE_OPTIONS,
              )}
              {textInput("radius", "Border radius (px)", "999 = pill.", "8")}
              {textInput(
                "shadow",
                "Box shadow",
                "Any CSS box-shadow.",
                "0 2px 6px rgba(0,0,0,.2)",
              )}
            </>,
          ),
        )}

        {section(
          "typography",
          "Typography",
          grid(
            <>
              {textInput(
                "fontFamily",
                "Font family",
                "A CSS font-family.",
                "Georgia, serif",
              )}
              {textInput("fontSize", "Font size (px)", "", "13")}
              {selectInput("fontWeight", "Font weight", REC_BUTTON_WEIGHT_OPTIONS)}
              {textInput("letterSpacing", "Letter spacing", "", "0.05em")}
              {selectInput(
                "textTransform",
                "Text transform",
                REC_BUTTON_TRANSFORM_OPTIONS,
              )}
            </>,
          ),
        )}

        {section(
          "sizing",
          "Size & Spacing",
          grid(
            <>
              {selectInput(
                "size",
                "Size",
                REC_BUTTON_SIZE_OPTIONS,
                "Preset height, padding & font size.",
              )}
              {selectInput(
                "width",
                "Width",
                REC_BUTTON_WIDTH_OPTIONS,
                "Full width puts the button on its own row.",
              )}
              {selectInput(
                "align",
                "Alignment",
                REC_BUTTON_ALIGN_OPTIONS,
                "Applies with Fit content or Full width.",
              )}
              {textInput("paddingX", "Horizontal padding (px)", "", "15")}
              {textInput("paddingY", "Vertical padding (px)")}
            </>,
          ),
        )}

        {section(
          "hover",
          "Hover State",
          grid(
            <>
              {color("hoverBg", "Hover background")}
              {color("hoverTextColor", "Hover text color")}
              {color("hoverBorderColor", "Hover border color")}
              {textInput("hoverShadow", "Hover box shadow")}
              {textInput(
                "transitionDuration",
                "Transition duration",
                "Milliseconds (200) or CSS time (0.2s).",
              )}
              {selectInput(
                "transitionTiming",
                "Transition timing",
                REC_BUTTON_TIMING_OPTIONS,
              )}
            </>,
          ),
        )}

        {section(
          "advanced",
          "Advanced",
          <s-stack direction="block" gap="base">
            {grid(
              <>
                {selectInput("icon", "Icon", REC_BUTTON_ICON_OPTIONS)}
                {btn.icon && btn.icon !== "none"
                  ? selectInput(
                      "iconPosition",
                      "Icon position",
                      REC_BUTTON_ICON_POSITION_OPTIONS,
                    )
                  : null}
              </>,
            )}
            {btn.icon === "custom" ? (
              <s-text-field
                label="Custom SVG"
                details="Paste inline SVG markup. Scripts/handlers are stripped."
                value={btn.iconSvg}
                onChange={(event) => set({ iconSvg: fieldValue(event) })}
              />
            ) : null}
          </s-stack>,
        )}

        <s-button
          onClick={() => onChange({ recommendationButton: DEFAULT_REC_BUTTON })}
        >
          Reset all to theme defaults
        </s-button>
      </s-stack>
    </s-section>
  );
}

/**
 * Live button preview. In Theme mode it carries a "Using Theme Button" badge;
 * the admin can't read the live theme, so the base is neutral and only the
 * merchant's overrides are shown — the real theme values apply on the storefront
 * (and in the main Live Preview above the settings).
 */
function ButtonPreview({
  settings,
  isTheme,
}: {
  settings: ShipBoostSettings;
  isTheme: boolean;
}) {
  const btn = settings.recommendationButton;
  const vars = recButtonCssVars(btn) as CSSProperties;
  const classes = recButtonClasses(btn);
  const iconSvg = recButtonIconSvg(btn);
  const label = btn.text || "Add to cart";
  const icon = iconSvg ? (
    <span
      className="shipboost-rec-ico"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: iconSvg }}
    />
  ) : null;

  return (
    <div
      style={{
        border: "1px solid #e1e3e5",
        borderRadius: "10px",
        padding: "16px",
        background: "#f6f6f7",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <span style={{ fontWeight: 600 }}>Button preview</span>
        {isTheme ? (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#0b6b3a",
              background: "#e3f1df",
              border: "1px solid #a7d3b3",
              borderRadius: "10px",
              padding: "1px 8px",
            }}
          >
            Using Theme Button
          </span>
        ) : null}
      </div>
      <div
        className={`shipboost-product-recs${classes ? " " + classes : ""}`}
        style={vars}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button type="button" className="shipboost-product-recs__btn">
            {btn.iconPosition === "right" ? (
              <>
                {label}
                {icon}
              </>
            ) : (
              <>
                {icon}
                {label}
              </>
            )}
          </button>
        </div>
      </div>
      {isTheme ? (
        <div style={{ marginTop: "10px", fontSize: "13px", color: "#616161" }}>
          Blank fields inherit your theme&apos;s Add to cart button on the
          storefront. Overrides you set are shown here and applied on top.
        </div>
      ) : null}
    </div>
  );
}
