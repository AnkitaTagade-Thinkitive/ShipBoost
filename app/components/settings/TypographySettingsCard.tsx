import type {
  FontFamily,
  FontWeight,
  ShipBoostSettings,
  TextAlign,
} from "../../lib/settings/types";
import type { SettingsErrors } from "../../lib/settings/validate";
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_WEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS,
} from "../../lib/settings/typography";
import { fieldNumber, fieldValue } from "../../lib/polaris/fieldEvents";

interface TypographySettingsCardProps {
  settings: ShipBoostSettings;
  errors: SettingsErrors;
  onChange: (patch: Partial<ShipBoostSettings>) => void;
}

// Responsive: columns wrap automatically on narrow viewports.
const RESPONSIVE_COLUMNS = "repeat(auto-fit, minmax(200px, 1fr))";

/**
 * "Typography" settings for the progress message: font family, size, weight,
 * colour and alignment. Presentational only — reports every change up via
 * `onChange`.
 */
export function TypographySettingsCard({
  settings,
  errors,
  onChange,
}: TypographySettingsCardProps) {
  return (
    <s-section heading="Typography">
      <s-stack direction="block" gap="large">
        <s-select
          label="Font family"
          details="Theme Default inherits your store's font."
          value={settings.fontFamily}
          onChange={(event) =>
            onChange({ fontFamily: fieldValue(event) as FontFamily })
          }
        >
          {FONT_FAMILY_OPTIONS.map((option) => (
            <s-option key={option.value} value={option.value}>
              {option.label}
            </s-option>
          ))}
        </s-select>

        <s-grid gridTemplateColumns={RESPONSIVE_COLUMNS} gap="base">
          <s-number-field
            label="Font size"
            suffix="px"
            min={FONT_SIZE_MIN}
            max={FONT_SIZE_MAX}
            step={1}
            value={String(settings.fontSize)}
            {...(errors.fontSize ? { error: errors.fontSize } : {})}
            onChange={(event) => onChange({ fontSize: fieldNumber(event, 12) })}
          />
          <s-select
            label="Font weight"
            value={String(settings.fontWeight)}
            onChange={(event) =>
              onChange({ fontWeight: Number(fieldValue(event)) as FontWeight })
            }
          >
            {FONT_WEIGHT_OPTIONS.map((option) => (
              <s-option key={option.value} value={String(option.value)}>
                {option.label}
              </s-option>
            ))}
          </s-select>
        </s-grid>

        <s-grid gridTemplateColumns={RESPONSIVE_COLUMNS} gap="base">
          <s-color-field
            label="Text color"
            value={settings.textColor}
            onChange={(event) => onChange({ textColor: fieldValue(event) })}
          />
          <s-select
            label="Text alignment"
            value={settings.textAlign}
            onChange={(event) =>
              onChange({ textAlign: fieldValue(event) as TextAlign })
            }
          >
            {TEXT_ALIGN_OPTIONS.map((option) => (
              <s-option key={option.value} value={option.value}>
                {option.label}
              </s-option>
            ))}
          </s-select>
        </s-grid>
      </s-stack>
    </s-section>
  );
}
