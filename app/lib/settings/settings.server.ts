import type { ShipBoostSetting } from "@prisma/client";

import prisma from "../../db.server";
import { DEFAULT_SETTINGS } from "./defaults";
import { DEFAULT_TEMPLATE, isTemplateStyle } from "./templates";
import {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_TEXT_ALIGN,
  isFontFamily,
  isFontWeight,
  isTextAlign,
} from "./typography";
import {
  CUSTOM_WIDTH_MAX,
  CUSTOM_WIDTH_MIN,
  DEFAULT_CUSTOM_WIDTH,
  DEFAULT_DISPLAY_ON,
  DEFAULT_POSITION,
  DEFAULT_STICKY_POSITION,
  DEFAULT_WIDTH_MODE,
  isDisplayOn,
  isPosition,
  isStickyPosition,
  isWidthMode,
} from "./placement";
import {
  DEFAULT_RECOMMENDATION_MAX,
  DEFAULT_RECOMMENDATION_SOURCE,
  RECOMMENDATION_MAX_MAX,
  RECOMMENDATION_MAX_MIN,
  isRecommendationSource,
} from "./recommendations";
import {
  DEFAULT_REC_BUTTON_MODE,
  isRecButtonMode,
  normalizeRecButton,
} from "./recButton";
import type { CurrencyCode, ShipBoostSettings } from "./types";

/**
 * Map a persisted Prisma row to the UI-facing `ShipBoostSettings` shape.
 * The database stores `currencyCode` as a plain string; we narrow it back to
 * the `CurrencyCode` union for the rest of the app.
 */
function toSettings(record: ShipBoostSetting): ShipBoostSettings {
  return {
    enabled: record.enabled,
    template: isTemplateStyle(record.template)
      ? record.template
      : DEFAULT_TEMPLATE,
    goalAmount: record.goalAmount,
    currencyCode: record.currencyCode as CurrencyCode,
    barColor: record.barColor,
    backgroundColor: record.backgroundColor,
    successColor: record.successColor,
    remainingMessage: record.remainingMessage,
    successMessage: record.successMessage,
    borderRadius: record.borderRadius,
    barHeight: record.barHeight,
    fontFamily: isFontFamily(record.fontFamily)
      ? record.fontFamily
      : DEFAULT_FONT_FAMILY,
    fontSize: record.fontSize,
    fontWeight: isFontWeight(record.fontWeight)
      ? record.fontWeight
      : DEFAULT_FONT_WEIGHT,
    textColor: record.textColor,
    textAlign: isTextAlign(record.textAlign)
      ? record.textAlign
      : DEFAULT_TEXT_ALIGN,
    displayOn: isDisplayOn(record.displayOn)
      ? record.displayOn
      : DEFAULT_DISPLAY_ON,
    position: isPosition(record.position) ? record.position : DEFAULT_POSITION,
    enableMobile: record.enableMobile,
    enableDesktop: record.enableDesktop,
    widthMode: isWidthMode(record.widthMode)
      ? record.widthMode
      : DEFAULT_WIDTH_MODE,
    customWidth: Number.isFinite(record.customWidth)
      ? Math.min(Math.max(record.customWidth, CUSTOM_WIDTH_MIN), CUSTOM_WIDTH_MAX)
      : DEFAULT_CUSTOM_WIDTH,
    // Sticky Top only applies with the Below Header ("none") position; force
    // Normal otherwise so loaded settings match the storefront + the UI control.
    stickyPosition:
      record.position === "none" && isStickyPosition(record.stickyPosition)
        ? record.stickyPosition
        : DEFAULT_STICKY_POSITION,
    recommendationsEnabled: record.recommendationsEnabled,
    recommendationSource: isRecommendationSource(record.recommendationSource)
      ? record.recommendationSource
      : DEFAULT_RECOMMENDATION_SOURCE,
    recommendationMax: Number.isFinite(record.recommendationMax)
      ? Math.min(
          Math.max(record.recommendationMax, RECOMMENDATION_MAX_MIN),
          RECOMMENDATION_MAX_MAX,
        )
      : DEFAULT_RECOMMENDATION_MAX,
    recommendationShowImage: record.recommendationShowImage,
    recommendationShowPrice: record.recommendationShowPrice,
    recommendationShowButton: record.recommendationShowButton,
    recommendationHideAfterGoal: record.recommendationHideAfterGoal,
    recommendationCollectionId: record.recommendationCollectionId,
    recommendationProductIds: record.recommendationProductIds,
    recommendationButtonMode: isRecButtonMode(record.recommendationButtonMode)
      ? record.recommendationButtonMode
      : DEFAULT_REC_BUTTON_MODE,
    // The button config is stored as a JSON string; parse + normalize it.
    recommendationButton: normalizeRecButton(
      parseButton(record.recommendationButton),
    ),
  };
}

/** Parse the stored button JSON string; tolerate missing/invalid data. */
function parseButton(value: string | null | undefined): unknown {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

/**
 * Convert UI-facing settings to the Prisma row shape. Only the button config
 * needs transforming — it is stored as a JSON string column.
 */
function toRecord(settings: ShipBoostSettings) {
  const { recommendationButton, ...rest } = settings;
  return { ...rest, recommendationButton: JSON.stringify(recommendationButton) };
}

/**
 * Load a shop's settings, creating a default record on first access.
 * This guarantees every installed shop always has exactly one settings row.
 */
export async function getSettings(shop: string): Promise<ShipBoostSettings> {
  const existing = await prisma.shipBoostSetting.findUnique({ where: { shop } });
  if (existing) {
    return toSettings(existing);
  }

  const created = await prisma.shipBoostSetting.create({
    data: { shop, ...toRecord(DEFAULT_SETTINGS) },
  });
  return toSettings(created);
}

/**
 * Persist a shop's settings. Uses an upsert so a save always succeeds whether
 * or not the row already exists.
 */
export async function saveSettings(
  shop: string,
  settings: ShipBoostSettings,
): Promise<ShipBoostSettings> {
  const record = await prisma.shipBoostSetting.upsert({
    where: { shop },
    update: toRecord(settings),
    create: { shop, ...toRecord(settings) },
  });
  return toSettings(record);
}

/**
 * Read-only: the "last updated" timestamp for a shop's settings, or `null`
 * if no record exists yet. Used to show "Last saved" on the dashboard.
 */
export async function getSettingsUpdatedAt(
  shop: string,
): Promise<string | null> {
  const record = await prisma.shipBoostSetting.findUnique({
    where: { shop },
    select: { updatedAt: true },
  });
  return record ? record.updatedAt.toISOString() : null;
}
