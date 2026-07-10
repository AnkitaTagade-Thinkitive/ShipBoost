/**
 * The complete set of merchant-configurable settings for the ShipBoost
 * free-shipping progress bar. This is the single typed contract shared by the
 * admin dashboard today and by persistence + the storefront extension later.
 */
import type { TemplateStyle } from "./templates";
import type { FontFamily, FontWeight, TextAlign } from "./typography";
import type { DisplayOn, Position } from "./placement";

export type { TemplateStyle };
export type { FontFamily, FontWeight, TextAlign };
export type { DisplayOn, Position };

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
}
