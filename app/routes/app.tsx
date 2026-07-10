import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";
import {
  APP_NAME,
  APP_VERSION,
  DOCS_URL,
  HELP_PATH,
  PRIVACY_URL,
  SUPPORT_URL,
  isExternalUrl,
} from "../lib/constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Dashboard</s-link>
        <s-link href="/app/settings">Settings</s-link>
        <s-link href={HELP_PATH}>Help</s-link>
      </s-app-nav>
      <Outlet />
      <s-divider />
      <s-box padding="base">
        <s-stack
          direction="inline"
          gap="base"
          alignItems="center"
          justifyContent="center"
        >
          <s-text color="subdued">
            {APP_NAME} v{APP_VERSION}
          </s-text>
          <s-link
            href={DOCS_URL}
            target={isExternalUrl(DOCS_URL) ? "_blank" : undefined}
          >
            Documentation
          </s-link>
          <s-link
            href={SUPPORT_URL}
            target={isExternalUrl(SUPPORT_URL) ? "_blank" : undefined}
          >
            Support
          </s-link>
          <s-link
            href={PRIVACY_URL}
            target={isExternalUrl(PRIVACY_URL) ? "_blank" : undefined}
          >
            Privacy Policy
          </s-link>
        </s-stack>
      </s-box>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
