const getEnv = (key: string) => process.env[key]?.trim();

export const env = {
  appUrl: getEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  supabaseUrl: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  openAiApiKey: getEnv("OPENAI_API_KEY"),
  openAiModel: getEnv("OPENAI_MODEL") ?? "gpt-5-mini",
  stripeSecretKey: getEnv("STRIPE_SECRET_KEY"),
  stripePublishableKey: getEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  stripePriceIdPro: getEnv("STRIPE_PRICE_ID_PRO"),
  stripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET"),
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const isSupabaseAdminConfigured = Boolean(
  env.supabaseUrl && env.supabaseServiceRoleKey,
);
export const isOpenAiConfigured = Boolean(env.openAiApiKey);
export const isStripeConfigured = Boolean(
  env.stripeSecretKey && env.stripePriceIdPro && env.stripePublishableKey,
);
export const isDemoMode = !isSupabaseConfigured;
