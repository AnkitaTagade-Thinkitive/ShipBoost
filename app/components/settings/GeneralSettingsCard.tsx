import type { ShipBoostSettings } from "../../lib/settings/types";
import type { SettingsErrors } from "../../lib/settings/validate";
import { fieldChecked, fieldValue } from "../../lib/polaris/fieldEvents";

interface GeneralSettingsCardProps {
  settings: ShipBoostSettings;
  errors: SettingsErrors;
  onChange: (patch: Partial<ShipBoostSettings>) => void;
}

/**
 * "General" settings: the master toggle, the free-shipping goal and the two
 * customer-facing messages. Presentational only — it receives the current
 * settings and reports every change up via `onChange`.
 */
export function GeneralSettingsCard({
  settings,
  errors,
  onChange,
}: GeneralSettingsCardProps) {
  return (
    <s-section heading="General">
      <s-stack direction="block" gap="large">
        <s-switch
          label="Enable progress bar"
          details="Show the free shipping progress bar on your storefront."
          {...(settings.enabled ? { checked: true } : {})}
          onChange={(event) => onChange({ enabled: fieldChecked(event) })}
        />

        <s-money-field
          label="Free shipping goal"
          currencyCode={settings.currencyCode}
          value={settings.goalAmount}
          min={0}
          {...(errors.goalAmount ? { error: errors.goalAmount } : {})}
          onChange={(event) => onChange({ goalAmount: fieldValue(event) })}
        />

        <s-text-area
          label="Remaining message"
          details="Shown while the customer is below the goal. Use {{remaining}} for the amount left to spend."
          rows={2}
          value={settings.remainingMessage}
          {...(errors.remainingMessage
            ? { error: errors.remainingMessage }
            : {})}
          onChange={(event) => onChange({ remainingMessage: fieldValue(event) })}
        />

        <s-text-area
          label="Success message"
          details="Shown once the customer qualifies for free shipping."
          rows={2}
          value={settings.successMessage}
          {...(errors.successMessage ? { error: errors.successMessage } : {})}
          onChange={(event) => onChange({ successMessage: fieldValue(event) })}
        />
      </s-stack>
    </s-section>
  );
}
