import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Top-level error boundary. Catches errors that bubble above the embedded
 * `/app` routes (which have their own Shopify error boundary) and renders a
 * friendly, self-contained page instead of React Router's default screen.
 */
export function ErrorBoundary() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>ShipBoost — {title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div
          style={{
            maxWidth: "32rem",
            margin: "3rem auto",
            padding: "0 1.5rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
            lineHeight: 1.5,
          }}
        >
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>{title}</h1>
          <p style={{ margin: 0, color: "#555" }}>
            ShipBoost hit an unexpected error. Please reload the page, and if the
            problem continues, try again shortly.
          </p>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
