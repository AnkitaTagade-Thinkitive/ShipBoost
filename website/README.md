# ShipBoost — Public Website

Static, framework-free marketing & legal site for the ShipBoost Shopify app. It
is completely separate from the app (nothing here imports or affects the app,
dashboard, settings, theme extension, database, or auth).

## Pages

| File           | URL path        | Purpose                                        |
| -------------- | --------------- | ---------------------------------------------- |
| `index.html`   | `/`             | Home — hero, overview, features, why, CTA      |
| `docs.html`    | `/docs.html`    | Documentation — install, app block, config, placement, FAQ, troubleshooting |
| `support.html` | `/support.html` | Support — contact, hours, process, response    |
| `privacy.html` | `/privacy.html` | Privacy Policy                                 |
| `terms.html`   | `/terms.html`   | Terms of Service                               |
| `assets/styles.css` | —          | Shared stylesheet (ShipBoost branding)         |

## Deploying

It is pure static HTML/CSS — host it anywhere:

- Netlify / Vercel / Cloudflare Pages: point the project/output directory at
  `website/` (no build command needed).
- GitHub Pages, S3 + CloudFront, or any static host: upload the contents of
  `website/`.

No build step, no dependencies. Fonts load from Google Fonts; everything else is
inline or in `assets/styles.css`.

## Before publishing — replace these placeholders

Search the `website/` folder for `[` and replace **every** bracketed token with
your real details (they render highlighted so they are easy to spot):

| Placeholder | Meaning |
| --- | --- |
| `[SITE_URL]` | The site's own base URL, e.g. `https://shipboost.yourdomain.com` (used in `canonical` + Open Graph tags). |
| `[SHOPIFY_APP_STORE_URL]` | Your Shopify App Store listing URL for the “Install on Shopify” buttons. |
| `[SUPPORT_EMAIL]` | Your real support email address. |
| `[SUPPORT_HOURS]` | Support business hours + timezone. |
| `[RESPONSE_TIME]` | Expected first-response time. |
| `[COMPANY_LEGAL_NAME]` | Your legal business entity name. |
| `[BUSINESS_ADDRESS]` | Registered business address. |
| `[EFFECTIVE_DATE]` | Effective date for Privacy Policy / Terms. |
| `[HOSTING_PROVIDER_AND_REGION]` / `[HOSTING_REGION]` | Where the app + database are hosted. |
| `[PRICING_TERMS]` | Pricing/billing description (or “free”). |
| `[LIABILITY_CAP_PERIOD]` | Liability cap period in Terms. |
| `[GOVERNING_LAW_JURISDICTION]` | Governing-law jurisdiction for Terms. |

> The Privacy Policy and Terms are **templates**. Have them reviewed by a
> qualified legal professional before publishing.

## Wiring the URLs back into the app

Once the site is live, point the app's footer/Help links at these pages by
setting the build-time env vars (see the repo `.env.example`), then rebuild:

```
VITE_DOCS_URL="https://<site>/docs.html"
VITE_SUPPORT_URL="https://<site>/support.html"
VITE_PRIVACY_URL="https://<site>/privacy.html"
```

Also set the **Privacy Policy URL** (and app URL) in your Shopify Partner
Dashboard app listing — the App Store submission form requires them.
