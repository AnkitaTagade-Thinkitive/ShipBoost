/**
 * Fail-fast validation of required runtime environment variables.
 *
 * `validateEnv()` is called once at the start of the first server request (from
 * entry.server) so a misconfigured deployment throws a clear, actionable error
 * instead of failing later with a cryptic one. It runs at runtime only — never
 * at build time — and is a no-op once validated. A correctly configured
 * environment is never affected.
 */

const REQUIRED_ENV_VARS = [
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "SHOPIFY_APP_URL",
  "SCOPES",
  "DATABASE_URL",
] as const;

let validated = false;

export function validateEnv(): void {
  if (validated) return;

  const missing = REQUIRED_ENV_VARS.filter((name) => {
    const value = process.env[name];
    return !value || value.trim() === "";
  });

  if (missing.length > 0) {
    throw new Error(
      `[ShipBoost] Missing required environment variable(s): ${missing.join(
        ", ",
      )}. Set them in your hosting environment (see .env.example) and redeploy.`,
    );
  }

  validated = true;
}
