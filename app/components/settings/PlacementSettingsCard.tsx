import type {
  DisplayOn,
  Position,
  ShipBoostSettings,
} from "../../lib/settings/types";
import {
  DISPLAY_ON_OPTIONS,
  POSITION_OPTIONS,
} from "../../lib/settings/placement";
import { fieldChecked, fieldValue } from "../../lib/polaris/fieldEvents";

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
            onChange={(event) =>
              onChange({ position: fieldValue(event) as Position })
            }
          >
            {POSITION_OPTIONS.map((option) => (
              <s-option key={option.value} value={option.value}>
                {option.label}
              </s-option>
            ))}
          </s-select>
        </s-grid>

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
