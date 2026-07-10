import type {
  ShipBoostSettings,
  TemplateStyle,
} from "../../lib/settings/types";
import type { SettingsErrors } from "../../lib/settings/validate";
import {
  BAR_HEIGHT_MAX,
  BAR_HEIGHT_MIN,
  BORDER_RADIUS_MAX,
  BORDER_RADIUS_MIN,
} from "../../lib/settings/validate";
import { TEMPLATE_OPTIONS } from "../../lib/settings/templates";
import { fieldNumber, fieldValue } from "../../lib/polaris/fieldEvents";

interface AppearanceSettingsCardProps {
  settings: ShipBoostSettings;
  errors: SettingsErrors;
  onChange: (patch: Partial<ShipBoostSettings>) => void;
}

// Responsive: columns wrap automatically on narrow viewports.
const RESPONSIVE_COLUMNS = "repeat(auto-fit, minmax(200px, 1fr))";

/**
 * "Appearance" settings: the three colours and the two dimension controls.
 * Presentational only — reports every change up via `onChange`.
 */
export function AppearanceSettingsCard({
  settings,
  errors,
  onChange,
}: AppearanceSettingsCardProps) {
  return (
    <s-section heading="Appearance">
      <s-stack direction="block" gap="large">
        <s-select
          label="Template style"
          details="Choose a professionally designed look for the storefront bar."
          value={settings.template}
          onChange={(event) =>
            onChange({ template: fieldValue(event) as TemplateStyle })
          }
        >
          {TEMPLATE_OPTIONS.map((option) => (
            <s-option key={option.value} value={option.value}>
              {option.label}
            </s-option>
          ))}
        </s-select>

        <s-grid gridTemplateColumns={RESPONSIVE_COLUMNS} gap="base">
          <s-color-field
            label="Progress bar color"
            value={settings.barColor}
            onChange={(event) => onChange({ barColor: fieldValue(event) })}
          />
          <s-color-field
            label="Background color"
            value={settings.backgroundColor}
            onChange={(event) =>
              onChange({ backgroundColor: fieldValue(event) })
            }
          />
          <s-color-field
            label="Success color"
            value={settings.successColor}
            onChange={(event) => onChange({ successColor: fieldValue(event) })}
          />
        </s-grid>

        <s-grid gridTemplateColumns={RESPONSIVE_COLUMNS} gap="base">
          <s-number-field
            label="Border radius"
            suffix="px"
            min={BORDER_RADIUS_MIN}
            max={BORDER_RADIUS_MAX}
            step={1}
            value={String(settings.borderRadius)}
            {...(errors.borderRadius ? { error: errors.borderRadius } : {})}
            onChange={(event) =>
              onChange({ borderRadius: fieldNumber(event, 0) })
            }
          />
          <s-number-field
            label="Progress bar height"
            suffix="px"
            min={BAR_HEIGHT_MIN}
            max={BAR_HEIGHT_MAX}
            step={1}
            value={String(settings.barHeight)}
            {...(errors.barHeight ? { error: errors.barHeight } : {})}
            onChange={(event) => onChange({ barHeight: fieldNumber(event, 12) })}
          />
        </s-grid>
      </s-stack>
    </s-section>
  );
}
