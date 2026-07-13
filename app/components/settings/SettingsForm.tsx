import { useCallback, useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";

import type { ShipBoostSettings } from "../../lib/settings/types";
import { DEFAULT_SETTINGS } from "../../lib/settings/defaults";
import {
  validateSettings,
  type SettingsErrors,
} from "../../lib/settings/validate";
import type { action } from "../../routes/app.settings";
import { GeneralSettingsCard } from "./GeneralSettingsCard";
import { AppearanceSettingsCard } from "./AppearanceSettingsCard";
import { TypographySettingsCard } from "./TypographySettingsCard";
import { PlacementSettingsCard } from "./PlacementSettingsCard";
import { ProgressBarPreview } from "./ProgressBarPreview";

interface SettingsFormProps {
  initialSettings: ShipBoostSettings;
}

/** Serialize settings into string form-data values for the action. */
function toFormValues(settings: ShipBoostSettings): Record<string, string> {
  return {
    enabled: String(settings.enabled),
    template: settings.template,
    goalAmount: settings.goalAmount,
    currencyCode: settings.currencyCode,
    barColor: settings.barColor,
    backgroundColor: settings.backgroundColor,
    successColor: settings.successColor,
    remainingMessage: settings.remainingMessage,
    successMessage: settings.successMessage,
    borderRadius: String(settings.borderRadius),
    barHeight: String(settings.barHeight),
    fontFamily: settings.fontFamily,
    fontSize: String(settings.fontSize),
    fontWeight: String(settings.fontWeight),
    textColor: settings.textColor,
    textAlign: settings.textAlign,
    displayOn: settings.displayOn,
    position: settings.position,
    enableMobile: String(settings.enableMobile),
    enableDesktop: String(settings.enableDesktop),
  };
}

/**
 * Stateful orchestrator for the settings dashboard. It owns the working copy of
 * the settings, tracks unsaved changes, validates input, and persists via a
 * Remix action (`useFetcher`).
 */
export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const shopify = useAppBridge();
  const fetcher = useFetcher<typeof action>();

  const [settings, setSettings] = useState<ShipBoostSettings>(initialSettings);
  const [savedSettings, setSavedSettings] =
    useState<ShipBoostSettings>(initialSettings);
  const [errors, setErrors] = useState<SettingsErrors>({});

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const isSaving = fetcher.state !== "idle";

  const update = useCallback((patch: Partial<ShipBoostSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    // Clear any errors on the fields the merchant is actively editing.
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof ShipBoostSettings)[]) {
        delete next[key];
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    const { errors: validationErrors } = validateSettings(settings);
    if (validationErrors) {
      setErrors(validationErrors);
      shopify.toast.show("Please fix the highlighted fields", {
        isError: true,
      });
      return;
    }

    setErrors({});
    fetcher.submit(toFormValues(settings), { method: "POST" });
  }, [settings, fetcher, shopify]);

  const handleDiscard = useCallback(() => {
    setSettings(savedSettings);
    setErrors({});
  }, [savedSettings]);

  // Restore factory defaults into the working copy (does not persist until the
  // merchant saves). The shop's currency is preserved — it's derived from the
  // store, not a visual default the merchant chose.
  const handleReset = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS, currencyCode: savedSettings.currencyCode });
    setErrors({});
  }, [savedSettings]);

  // React to the action result: toast + new baseline on success, errors on fail.
  useEffect(() => {
    const data = fetcher.data;
    if (!data) return;

    if (data.ok) {
      setSettings(data.settings);
      setSavedSettings(data.settings);
      setErrors({});
      shopify.toast.show("Settings saved");
    } else if (data.errors) {
      setErrors(data.errors);
      shopify.toast.show("Please fix the highlighted fields", {
        isError: true,
      });
    }
  }, [fetcher.data, shopify]);

  return (
    <s-page heading="ShipBoost Settings">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={handleSave}
        {...(isSaving ? { loading: true } : {})}
        {...(isDirty && !isSaving ? {} : { disabled: true })}
      >
        Save settings
      </s-button>
      {isDirty && !isSaving ? (
        <s-button slot="secondary-actions" onClick={handleDiscard}>
          Discard
        </s-button>
      ) : null}
      <s-button
        slot="secondary-actions"
        onClick={handleReset}
        {...(isSaving ? { disabled: true } : {})}
      >
        Reset to defaults
      </s-button>

      <ProgressBarPreview settings={settings} />

      <GeneralSettingsCard
        settings={settings}
        errors={errors}
        onChange={update}
      />
      <AppearanceSettingsCard
        settings={settings}
        errors={errors}
        onChange={update}
      />
      <TypographySettingsCard
        settings={settings}
        errors={errors}
        onChange={update}
      />
      <PlacementSettingsCard settings={settings} onChange={update} />
    </s-page>
  );
}
