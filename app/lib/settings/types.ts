/**
 * The complete set of merchant-configurable settings for the ShipBoost
 * free-shipping progress bar. This is the single typed contract shared by the
 * admin dashboard today and by persistence + the storefront extension later.
 */
import type { TemplateStyle } from "./templates";
import type { FontFamily, FontWeight, TextAlign } from "./typography";
import type {
  DisplayOn,
  Position,
  WidthMode,
  StickyPosition,
} from "./placement";
import type {
  RecommendationSource,
  RecommendationLayout,
} from "./recommendations";

export type { TemplateStyle };
export type { FontFamily, FontWeight, TextAlign };
export type { DisplayOn, Position, WidthMode, StickyPosition };
export type { RecommendationSource, RecommendationLayout };

/**
 * Currency codes we currently expose in the admin. In a later phase this will
 * be driven by the shop's own currency via the GraphQL Admin API; for now it is
 * a small explicit union so the values stay valid for both the Polaris
 * `s-money-field` and `Intl.NumberFormat`.
 */
export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD";

export interface ShipBoostSettings {
  /** Master on/off switch for the storefront progress bar. */
  enabled: boolean;

  /** Visual template applied on the storefront (appearance only). */
  template: TemplateStyle;

  /** Free-shipping threshold, stored as a decimal string (e.g. "50.00"). */
  goalAmount: string;

  /** Currency used to display and format the goal. */
  currencyCode: CurrencyCode;

  /** Hex colour of the filled portion of the progress bar. */
  barColor: string;

  /** Hex colour of the empty track behind the bar. */
  backgroundColor: string;

  /** Hex colour used once the customer has unlocked free shipping. */
  successColor: string;

  /** Message shown while below the goal. Supports the `{{remaining}}` token. */
  remainingMessage: string;

  /** Message shown once the goal is reached. */
  successMessage: string;

  /** Corner radius of the bar, in pixels. */
  borderRadius: number;

  /** Height of the bar, in pixels. */
  barHeight: number;

  /** Message font family; "theme" inherits the store font. */
  fontFamily: FontFamily;

  /** Message font size, in pixels. */
  fontSize: number;

  /** Message font weight (400/500/600/700). */
  fontWeight: FontWeight;

  /** Hex colour of the message text. */
  textColor: string;

  /** Message text alignment. */
  textAlign: TextAlign;

  /** Which storefront pages the bar appears on. */
  displayOn: DisplayOn;

  /** Where on the page the bar is positioned (best-effort relocation). */
  position: Position;

  /** Show the bar on mobile viewports. */
  enableMobile: boolean;

  /** Show the bar on desktop viewports. */
  enableDesktop: boolean;

  /** Bar width mode: full width, theme content width, or a custom percentage. */
  widthMode: WidthMode;

  /** Custom width as a percentage (30–100). Only applied when widthMode is "custom". */
  customWidth: number;

  /** Sticky behaviour: normal (in-flow) or stuck to the top of the viewport. */
  stickyPosition: StickyPosition;

  /* ---- Product Recommendations ---- */

  /** Master on/off for showing product recommendations under the bar. */
  recommendationsEnabled: boolean;

  /** How recommended products are chosen. */
  recommendationSource: RecommendationSource;

  /** Maximum number of products to show (1–4). */
  recommendationMax: number;

  /** Card layout for the recommendations. */
  recommendationLayout: RecommendationLayout;

  /** Show the product image on each card. */
  recommendationShowImage: boolean;

  /** Show the product price on each card. */
  recommendationShowPrice: boolean;

  /** Show the Add to cart button on each card. */
  recommendationShowButton: boolean;

  /** Hide recommendations once the free-shipping goal is reached. */
  recommendationHideAfterGoal: boolean;

  /** Collection GID for the "collection" source (empty otherwise). */
  recommendationCollectionId: string;

  /** Comma-separated product GIDs for the "manual" source (empty otherwise). */
  recommendationProductIds: string;
}
