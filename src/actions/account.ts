"use server";

import { revalidatePath } from "next/cache";

import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { logServerError, trackEvent } from "@/lib/observability";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { accountSettingsSchema, type AccountSettingsInput } from "@/lib/validation";
import type { AuthActionResult } from "@/types/domain";

export async function updateAccountSettingsAction(values: AccountSettingsInput): Promise<AuthActionResult> {
  const parsed = accountSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your settings." };
  }

  if (!isSupabaseConfigured) {
    return isDemoMode
      ? { ok: true, message: "Demo settings saved for this session." }
      : { ok: false, message: "Supabase must be configured before saving settings." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "You need to be logged in." };
    }

    const favoriteStrokes = parsed.data.favoriteStrokes
      .split(",")
      .map((stroke) => stroke.trim())
      .filter(Boolean);

    const [profileResult, swimmerResult] = await Promise.all([
      supabase.from("profiles").update({
        first_name: parsed.data.firstName,
        full_name: parsed.data.firstName,
      }).eq("id", user.id),
      supabase.from("swimmer_profiles").update({
        weekly_swim_days: parsed.data.weeklySwimDays,
        favorite_strokes: favoriteStrokes,
        prefers_simple_explanations: parsed.data.prefersSimpleExplanations,
        auto_easy_on_soreness: parsed.data.autoEasyOnSoreness,
      }).eq("user_id", user.id),
    ]);

    if (profileResult.error) {
      throw profileResult.error;
    }

    if (swimmerResult.error) {
      throw swimmerResult.error;
    }

    await trackEvent("settings_updated", user.id);
    revalidatePath("/account");
    revalidatePath("/dashboard");
    revalidatePath("/chat");

    return { ok: true, message: "Settings saved." };
  } catch (error) {
    logServerError("updateAccountSettingsAction", error);
    return { ok: false, message: "Unable to save settings. Please try again." };
  }
}
