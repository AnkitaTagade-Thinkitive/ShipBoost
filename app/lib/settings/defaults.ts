import type { ShipBoostSettings } from "./types";
import { DEFAULT_TEMPLATE } from "./templates";
import {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_TEXT_COLOR,
} from "./typography";
import {
  DEFAULT_DISPLAY_ON,
  DEFAULT_POSITION,
  DEFAULT_WIDTH_MODE,
  DEFAULT_CUSTOM_WIDTH,
  DEFAULT_STICKY_POSITION,
} from "./placement";
import {
  DEFAULT_RECOMMENDATION_SOURCE,
  DEFAULT_RECOMMENDATION_LAYOUT,
  DEFAULT_RECOMMENDATION_MAX,
} from "./recommendations";

/**
 * Default ShipBoost settings.
 *
 * NOTE: This is mock data for the dashboard UI phase. Persistence (Prisma) and
 * loading real per-shop settings are added in a later phase — at that point the
 * route loader will read from the database and fall back to these defaults.
 */
export const DEFAULT_SETTINGS: ShipBoostSettings = {
  enabled: true,
  template: DEFAULT_TEMPLATE,
  goalAmount: "50.00",
  currencyCode: "USD",
  barColor: "#2E7D32",
  backgroundColor: "#E8F5E9",
  successColor: "#1B5E20",
  remainingMessage: "Spend {{remaining}} more to unlock FREE SHIPPING.",
  successMessage: "🎉 Congratulations! You've unlocked FREE SHIPPING.",
  borderRadius: 8,
  barHeight: 12,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontSize: DEFAULT_FONT_SIZE,
  fontWeight: DEFAULT_FONT_WEIGHT,
  textColor: DEFAULT_TEXT_COLOR,
  textAlign: DEFAULT_TEXT_ALIGN,
  displayOn: DEFAULT_DISPLAY_ON,
  position: DEFAULT_POSITION,
  enableMobile: true,
  enableDesktop: true,
  widthMode: DEFAULT_WIDTH_MODE,
  customWidth: DEFAULT_CUSTOM_WIDTH,
  stickyPosition: DEFAULT_STICKY_POSITION,
  // Recommendations are off by default — existing merchants see no change.
  recommendationsEnabled: false,
  recommendationSource: DEFAULT_RECOMMENDATION_SOURCE,
  recommendationMax: DEFAULT_RECOMMENDATION_MAX,
  recommendationLayout: DEFAULT_RECOMMENDATION_LAYOUT,
  recommendationShowImage: true,
  recommendationShowPrice: true,
  recommendationShowButton: true,
  recommendationHideAfterGoal: true,
  recommendationCollectionId: "",
  recommendationProductIds: "",
};
