/**
 * Production environment validation. Fails fast at startup if required env vars are missing.
 * See docs/ENV-VARS.md for full list and descriptions.
 */

const REQUIRED_IN_PRODUCTION = [
  'DATABASE_URL',
  'GEMINI_API_KEY',
  'SESSION_SECRET',
] as const;

/** At least one of these must be set for Stripe server-side (secret key). */
const STRIPE_SECRET_SOURCES = [
  'STRIPE_SECRET_KEY',
  'TESTING_VITE_STRIPE_PUBLIC_KEY', // naming swap in some setups
] as const;

/** At least one of these must be set for Stripe client-side (publishable key). */
const STRIPE_PUBLISHABLE_SOURCES = [
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_TESTING_STRIPE_PUBLIC_KEY',
  'TESTING_STRIPE_SECRET_KEY', // naming swap in some setups
] as const;

export function getMissingProductionEnv(): string[] {
  const missing: string[] = [];
  for (const key of REQUIRED_IN_PRODUCTION) {
    if (!process.env[key]?.trim()) missing.push(key);
  }
  const hasStripeSecret = STRIPE_SECRET_SOURCES.some((k) => process.env[k]?.trim());
  if (!hasStripeSecret) missing.push('STRIPE_SECRET_KEY (or TESTING_VITE_STRIPE_PUBLIC_KEY)');
  const hasStripePk = STRIPE_PUBLISHABLE_SOURCES.some((k) => process.env[k]?.trim());
  if (!hasStripePk) missing.push('VITE_STRIPE_PUBLIC_KEY (or other publishable key)');
  return missing;
}

export function requireProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;
  const missing = getMissingProductionEnv();
  if (missing.length > 0) {
    throw new Error(
      `Production startup failed: missing required environment variables: ${missing.join(', ')}. See docs/ENV-VARS.md.`
    );
  }
}
