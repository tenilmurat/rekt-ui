/**
 * Every setting comes from the environment (see .env.example). Read once here
 * so a missing value is reported in one place rather than deep in a request.
 */
export const config = {
  port: Number(process.env.PORT ?? 4000),
  /** Comma-separated origins allowed to call the API, e.g. "https://rektui.com". */
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3500')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? '',

  paddleEnv: process.env.PADDLE_ENV === 'production' ? 'production' : 'sandbox',
  paddleApiKey: process.env.PADDLE_API_KEY ?? '',
  paddleWebhookSecret: process.env.PADDLE_WEBHOOK_SECRET ?? '',
  paddlePriceLifetime: process.env.PADDLE_PRICE_LIFETIME ?? '',
};

export const accountsEnabled = Boolean(
  config.supabaseUrl && config.supabasePublishableKey && config.supabaseSecretKey,
);
