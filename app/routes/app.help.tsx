import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
import {
  APP_VERSION,
  PRIVACY_URL,
  SETTINGS_PATH,
  SUPPORT_URL,
  isExternalUrl,
} from "../lib/constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

const FAQS = [
  {
    q: "Where does the progress bar appear on my store?",
    a: "It appears on the pages you choose under Display On, at the spot you choose under Position (for example, below the Add to Cart button). You also control whether it shows on mobile and desktop.",
  },
  {
    q: "The progress bar isn't showing. What should I check?",
    a: "Make sure the bar is enabled in Settings, the page you're viewing matches your Display On setting, the current device is enabled, and the ShipBoost block has been added in your theme editor.",
  },
  {
    q: "Can I customize the message?",
    a: "Yes. In Settings you can edit both the remaining and success messages. Use the {{remaining}} token to insert the amount left to reach free shipping.",
  },
  {
    q: "Will it slow down my store?",
    a: "No. ShipBoost ships lightweight CSS and a small script, reads the cart from the storefront, and only loads the single Google Font you select (Theme Default loads nothing).",
  },
  {
    q: "Does the bar update as customers add items?",
    a: "Yes. It reads the live cart and re-renders whenever the cart changes, including a success state once the goal is reached.",
  },
];

export default function HelpPage() {
  return (
    <s-page heading="Help & Support">
      {/* Getting Started */}
      <s-section heading="Getting started">
        <s-ordered-list>
          <s-list-item>
            Open <s-link href={SETTINGS_PATH}>Settings</s-link> and set your free
            shipping goal.
          </s-list-item>
          <s-list-item>
            Choose a template and customize the colors, typography, and border
            radius.
          </s-list-item>
          <s-list-item>
            Set placement and visibility — which pages, the position, and mobile
            or desktop.
          </s-list-item>
          <s-list-item>
            In your theme editor, add the “ShipBoost Progress Bar” app block to
            the section where you want it to appear.
          </s-list-item>
          <s-list-item>Save, then preview your storefront.</s-list-item>
        </s-ordered-list>
      </s-section>

      {/* FAQ */}
      <s-section heading="Frequently asked questions">
        <s-stack direction="block" gap="large">
          {FAQS.map((item) => (
            <s-stack key={item.q} direction="block" gap="small-300">
              <s-text type="strong">{item.q}</s-text>
              <s-paragraph>{item.a}</s-paragraph>
            </s-stack>
          ))}
        </s-stack>
      </s-section>

      {/* Placement guide */}
      <s-section heading="Placement guide">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            The Position setting relocates the bar next to a standard theme
            element. Pick the option that matches the page you selected under
            Display On:
          </s-paragraph>
          <s-unordered-list>
            <s-list-item>
              <s-text type="strong">Above / Below Product Information</s-text> —
              product pages, around the product details.
            </s-list-item>
            <s-list-item>
              <s-text type="strong">Above / Below Add to Cart</s-text> — product
              pages, next to the buy button (highest visibility).
            </s-list-item>
          </s-unordered-list>
          <s-paragraph>
            If the chosen spot doesn’t exist in your theme, the bar simply stays
            where you placed the block — it never breaks your storefront.
          </s-paragraph>
        </s-stack>
      </s-section>

      {/* Theme compatibility */}
      <s-section heading="Theme compatibility">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            ShipBoost works with any Online Store 2.0 theme that supports app
            blocks, including Dawn and Horizon. It uses Shopify’s Theme App
            Extension system, so there are no code edits to your theme.
          </s-paragraph>
          <s-paragraph>
            The bar inherits your theme’s fonts by default and adapts to light
            and dark backgrounds. Colors, radius, and typography are fully
            configurable in Settings.
          </s-paragraph>
        </s-stack>
      </s-section>

      {/* Troubleshooting */}
      <s-section heading="Troubleshooting">
        <s-stack direction="block" gap="base">
          <s-stack direction="block" gap="small-300">
            <s-text type="strong">The bar doesn’t appear</s-text>
            <s-paragraph>
              Confirm it’s enabled, the ShipBoost block is added in the theme
              editor, the current page matches Display On, and the current
              device (mobile/desktop) is enabled.
            </s-paragraph>
          </s-stack>
          <s-stack direction="block" gap="small-300">
            <s-text type="strong">It shows in the wrong place</s-text>
            <s-paragraph>
              Check your Position setting, and make sure the block is added on
              the matching page template (product or cart).
            </s-paragraph>
          </s-stack>
          <s-stack direction="block" gap="small-300">
            <s-text type="strong">The font looks wrong</s-text>
            <s-paragraph>
              Some fonts render only when available. Theme Default always uses
              your store’s font. Re-save Settings to reload the selected font.
            </s-paragraph>
          </s-stack>
          <s-stack direction="block" gap="small-300">
            <s-text type="strong">Text is hard to read</s-text>
            <s-paragraph>
              Adjust the Text Color in Settings — the preview warns you when the
              contrast against your background is low.
            </s-paragraph>
          </s-stack>
        </s-stack>
      </s-section>

      {/* Documentation & Support */}
      <s-section heading="Documentation & support">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Need a hand? We’re happy to help you get set up and boost your
            average order value.
          </s-paragraph>
          <s-stack direction="inline" gap="base">
            <s-button
              href={SUPPORT_URL}
              target={isExternalUrl(SUPPORT_URL) ? "_blank" : undefined}
            >
              Contact Support
            </s-button>
            <s-button
              href={PRIVACY_URL}
              target={isExternalUrl(PRIVACY_URL) ? "_blank" : undefined}
              variant="tertiary"
            >
              Privacy Policy
            </s-button>
          </s-stack>
        </s-stack>
      </s-section>

      {/* App version */}
      <s-section slot="aside" heading="About">
        <s-stack direction="block" gap="small-300">
          <s-text color="subdued">App version</s-text>
          <s-badge tone="info">v{APP_VERSION}</s-badge>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
