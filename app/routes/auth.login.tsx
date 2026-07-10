import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import {
  LoginErrorType,
  type LoginError,
} from "@shopify/shopify-app-react-router/server";

import { login } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

function loginErrorMessage(loginErrors: LoginError): { shop?: string } {
  if (loginErrors?.shop === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if (loginErrors?.shop === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }

  return {};
}

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors || loaderData.errors;

  return (
    <AppProvider embedded={false}>
      <s-page inlineSize="small">
        <s-section heading="Log in">
          <Form method="post">
            <s-stack direction="block" gap="base">
              <s-text-field
                name="shop"
                label="Shop domain"
                details="example.myshopify.com"
                error={errors.shop}
              />
              <s-button type="submit" variant="primary">
                Log in
              </s-button>
            </s-stack>
          </Form>
        </s-section>
      </s-page>
    </AppProvider>
  );
}
