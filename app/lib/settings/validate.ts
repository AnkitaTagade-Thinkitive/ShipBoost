import type { ShipBoostSettings } from "./types";
import { normalizeHexColor } from "./color";
import { DEFAULT_TEMPLATE, isTemplateStyle } from "./templates";
import {
  DEFAULT_DISPLAY_ON,
  DEFAULT_POSITION,
  isDisplayOn,
  isPosition,
} from "./placement";
import {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_TEXT_ALIGN,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  isFontFamily,
  isFontWeight,
  isTextAlign,
} from "./typography";

/** Field-keyed validation messages. */
export type SettingsErrors = Partial<Record<keyof ShipBoostSettings, string>>;

export interface ValidationResult {
  /** `null` when the input is valid, otherwise a map of field → message. */
  errors: SettingsErrors | null;
  /** The normalized settings (radius/height coerced to integers). */
  value: ShipBoostSettings;
}

export const BORDER_RADIUS_MIN = 0;
export const BORDER_RADIUS_MAX = 50;
export const BAR_HEIGHT_MIN = 4;
export const BAR_HEIGHT_MAX = 40;

/**
 * Validate and normalize merchant-supplied settings.
 *
 * Rules:
 * - Free shipping goal must be a number >= 0
 * - Border radius must be an integer between 0 and 50 px
 * - Progress bar height must be an integer between 4 and 40 px
 * - Remaining and success messages must not be empty
 */
export function validateSettings(input: ShipBoostSettings): ValidationResult {
  const errors: SettingsErrors = {};

  const goal = Number(input.goalAmount);
  if (input.goalAmount.trim() === "" || !Number.isFinite(goal) || goal < 0) {
    errors.goalAmount = "Enter a free shipping goal of 0 or more.";
  }

  const borderRadius = Math.round(input.borderRadius);
  if (
    !Number.isFinite(input.borderRadius) ||
    borderRadius < BORDER_RADIUS_MIN ||
    borderRadius > BORDER_RADIUS_MAX
  ) {
    errors.borderRadius = `Border radius must be between ${BORDER_RADIUS_MIN} and ${BORDER_RADIUS_MAX} px.`;
  }

  const barHeight = Math.round(input.barHeight);
  if (
    !Number.isFinite(input.barHeight) ||
    barHeight < BAR_HEIGHT_MIN ||
    barHeight > BAR_HEIGHT_MAX
  ) {
    errors.barHeight = `Progress bar height must be between ${BAR_HEIGHT_MIN} and ${BAR_HEIGHT_MAX} px.`;
  }

  if (input.remainingMessage.trim() === "") {
    errors.remainingMessage = "Remaining message can't be empty.";
  }

  if (input.successMessage.trim() === "") {
    errors.successMessage = "Success message can't be empty.";
  }

  // Template comes from a fixed dropdown; normalize any unexpected value to the
  // default rather than erroring (appearance-only, never blocks a save).
  const template = isTemplateStyle(input.template)
    ? input.template
    : DEFAULT_TEMPLATE;

  // Typography — appearance-only, so normalize invalid values to their defaults
  // rather than blocking a save. Text colour is passed through and normalized in
  // Liquid exactly like the other colour fields.
  const fontFamily = isFontFamily(input.fontFamily)
    ? input.fontFamily
    : DEFAULT_FONT_FAMILY;
  const fontWeight = isFontWeight(input.fontWeight)
    ? input.fontWeight
    : DEFAULT_FONT_WEIGHT;
  const textAlign = isTextAlign(input.textAlign)
    ? input.textAlign
    : DEFAULT_TEXT_ALIGN;

  const roundedFontSize = Math.round(input.fontSize);
  const fontSize =
    Number.isFinite(input.fontSize) &&
    roundedFontSize >= FONT_SIZE_MIN &&
    roundedFontSize <= FONT_SIZE_MAX
      ? roundedFontSize
      : DEFAULT_FONT_SIZE;

  // Placement & visibility — appearance-only enums normalized to defaults;
  // device toggles are plain booleans.
  const displayOn = isDisplayOn(input.displayOn)
    ? input.displayOn
    : DEFAULT_DISPLAY_ON;
  const position = isPosition(input.position) ? input.position : DEFAULT_POSITION;

  return {
    errors: Object.keys(errors).length > 0 ? errors : null,
    value: {
      ...input,
      template,
      // Normalize colours to a canonical `#RRGGBB` so the stored value renders
      // identically in the admin preview and on the storefront.
      barColor: normalizeHexColor(input.barColor),
      backgroundColor: normalizeHexColor(input.backgroundColor),
      successColor: normalizeHexColor(input.successColor),
      textColor: normalizeHexColor(input.textColor),
      borderRadius,
      barHeight,
      fontFamily,
      fontSize,
      fontWeight,
      textAlign,
      displayOn,
      position,
    },
  };
}
