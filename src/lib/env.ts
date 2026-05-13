const getEnv = (key: string) => process.env[key]?.trim();
const getBooleanEnv = (key: string) => ["1", "true", "yes", "on"].includes((getEnv(key) ?? "").toLowerCase());

export const isProduction = process.env.NODE_ENV === "production";

export const env = {
  appUrl: getEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  demoModeEnabled: getBooleanEnv("NEXT_PUBLIC_DEMO_MODE") || getBooleanEnv("DEMO_MODE"),
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
export const isFullSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceRoleKey,
);
export const isDemoMode = !isSupabaseConfigured && (!isProduction || env.demoModeEnabled);

export const requiredProductionEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
] as const;

export const missingProductionEnv = requiredProductionEnv.filter((key) => !getEnv(key));
export const hasProductionConfigError = isProduction && !env.demoModeEnabled && missingProductionEnv.length > 0;

export function getProductionConfigMessage() {
  return `Missing required production environment variables: ${missingProductionEnv.join(", ")}`;
}
