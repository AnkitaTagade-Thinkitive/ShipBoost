import type {
  DisplayOn,
  Position,
  ShipBoostSettings,
  StickyPosition,
  WidthMode,
} from "../../lib/settings/types";
import {
  CUSTOM_WIDTH_MAX,
  CUSTOM_WIDTH_MIN,
  DISPLAY_ON_OPTIONS,
  POSITION_OPTIONS,
  STICKY_POSITION_OPTIONS,
  WIDTH_MODE_OPTIONS,
} from "../../lib/settings/placement";
import { fieldChecked, fieldNumber, fieldValue } from "../../lib/polaris/fieldEvents";
import { HELP_PATH } from "../../lib/constants";

interface PlacementSettingsCardProps {
  settings: ShipBoostSettings;
  onChange: (patch: Partial<ShipBoostSettings>) => void;
}

// Responsive: columns wrap automatically on narrow viewports.
const RESPONSIVE_COLUMNS = "repeat(auto-fit, minmax(200px, 1fr))";

/**
 * "Placement & Visibility" settings: which pages the bar shows on, where it is
 * positioned, and device visibility. Presentational only — reports changes up
 * via `onChange`.
 */
export function PlacementSettingsCard({
  settings,
  onChange,
}: PlacementSettingsCardProps) {
  // Sticky Top only pins page-wide when the bar is a top-level block, i.e. the
  // "Below Header" position. At in-product placements CSS sticky is bounded by
  // the product container, so the control is disabled there.
  const stickyAllowed = settings.position === "none";

  return (
    <s-section heading="Placement & Visibility">
      <s-stack direction="block" gap="large">
        <s-grid gridTemplateColumns={RESPONSIVE_COLUMNS} gap="base">
          <s-select
            label="Display on"
            details="Which storefront pages show the bar."
            value={settings.displayOn}
            onChange={(event) =>
              onChange({ displayOn: fieldValue(event) as DisplayOn })
            }
          >
            {DISPLAY_ON_OPTIONS.map((option) => (
              <s-option key={option.value} value={option.value}>
                {option.label}
              </s-option>
            ))}
          </s-select>

          <s-select
            label="Position"
            details="Where the bar appears on the page. If the spot isn't found in your theme, the bar stays where the block is placed."
            value={settings.position}
            onChange={(event) => {
              const position = fieldValue(event) as Position;
              const patch: Partial<ShipBoostSettings> = { position };
              // Sticky Top only works below the header (a top-level block); drop
              // it automatically when the bar moves into the product layout.
              if (position !== "none" && settings.stickyPosition === "sticky-top") {
                patch.stickyPosition = "normal";
              }
              onChange(patch);
            }}
          >
            {POSITION_OPTIONS.map((option) => (
              <s-option key={option.value} value={option.value}>
                {option.label}
              </s-option>
            ))}
          </s-select>
        </s-grid>

        <s-stack direction="block" gap="small-300">
          <s-text color="subdued">
            Tip: For Display On to work across supported pages (including the
            classic Cart page), enable the ShipBoost App Embed in your theme. If
            you are using the App Block instead, add it to each template where you
            want the progress bar to appear.
          </s-text>
          <s-link href={HELP_PATH}>
            View Display On &amp; Placement documentation
          </s-link>
        </s-stack>

        <s-grid gridTemplateColumns={RESPONSIVE_COLUMNS} gap="base">
          <s-select
            label="Bar width"
            details="Full width, aligned to the theme content, or a custom width. The bar stays centered."
            value={settings.widthMode}
            onChange={(event) =>
              onChange({ widthMode: fieldValue(event) as WidthMode })
            }
          >
            {WIDTH_MODE_OPTIONS.map((option) => (
              <s-option key={option.value} value={option.value}>
                {option.label}
              </s-option>
            ))}
          </s-select>

          <s-select
            label="Sticky position"
            details={
              stickyAllowed
                ? "Sticky Top keeps the bar pinned to the top of the viewport while scrolling."
                : "Sticky Top is only available when the bar is placed below the header."
            }
            value={stickyAllowed ? settings.stickyPosition : "normal"}
            {...(stickyAllowed ? {} : { disabled: true })}
            onChange={(event) =>
              onChange({ stickyPosition: fieldValue(event) as StickyPosition })
            }
          >
            {STICKY_POSITION_OPTIONS.map((option) => (
              <s-option key={option.value} value={option.value}>
                {option.label}
              </s-option>
            ))}
          </s-select>
        </s-grid>

        {settings.widthMode === "custom" ? (
          <s-number-field
            label="Custom width"
            suffix="%"
            min={CUSTOM_WIDTH_MIN}
            max={CUSTOM_WIDTH_MAX}
            step={1}
            value={String(settings.customWidth)}
            onChange={(event) =>
              onChange({ customWidth: fieldNumber(event, CUSTOM_WIDTH_MAX) })
            }
          />
        ) : null}

        <s-switch
          label="Enable on mobile"
          details="Show the bar on mobile viewports."
          {...(settings.enableMobile ? { checked: true } : {})}
          onChange={(event) => onChange({ enableMobile: fieldChecked(event) })}
        />

        <s-switch
          label="Enable on desktop"
          details="Show the bar on desktop viewports."
          {...(settings.enableDesktop ? { checked: true } : {})}
          onChange={(event) => onChange({ enableDesktop: fieldChecked(event) })}
        />
      </s-stack>
    </s-section>
  );
}
