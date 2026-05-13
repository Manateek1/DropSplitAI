import "server-only";

import { isSupabaseAdminConfigured } from "@/lib/env";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

type EventName =
  | "signup_started"
  | "signup_completed"
  | "onboarding_completed"
  | "chat_log_created"
  | "manual_log_created"
  | "workout_completed"
  | "settings_updated"
  | "checkout_started";

type Metadata = Record<string, string | number | boolean | null | undefined>;

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }

  return { name: "UnknownError", message: String(error) };
}

export function logServerError(scope: string, error: unknown, metadata: Metadata = {}) {
  console.error(JSON.stringify({ level: "error", scope, error: normalizeError(error), metadata }));
}

export async function trackEvent(eventName: EventName, userId?: string | null, metadata: Metadata = {}) {
  const payload = { eventName, userId: userId ?? null, metadata };
  console.info(JSON.stringify({ level: "info", event: payload }));

  if (!isSupabaseAdminConfigured || !userId) {
    return;
  }

  try {
    const supabase = createServiceSupabaseClient();
    await supabase.from("app_events").insert({
      user_id: userId,
      event_name: eventName,
      metadata_json: metadata,
    });
  } catch (error) {
    logServerError("trackEvent", error, { eventName });
  }
}
