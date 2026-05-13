"use server";

import { revalidatePath } from "next/cache";

import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { logServerError, trackEvent } from "@/lib/observability";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { persistTimeEntry } from "@/lib/time-entries";
import { manualTimeEntrySchema, type ManualTimeEntryInput } from "@/lib/validation";
import type { AuthActionResult, TimeEntry } from "@/types/domain";

export async function createManualTimeEntryAction(
  values: ManualTimeEntryInput,
): Promise<AuthActionResult & { entry?: TimeEntry }> {
  const parsed = manualTimeEntrySchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the time entry." };
  }

  if (!isSupabaseConfigured) {
    return isDemoMode
      ? { ok: true, message: "Demo entry saved for this session." }
      : { ok: false, message: "Supabase must be configured before logging swims." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "You need to be logged in." };
    }

    const entry = await persistTimeEntry(supabase, {
      userId: user.id,
      event: parsed.data.event,
      course: parsed.data.course,
      time: parsed.data.time,
      date: parsed.data.date,
      context: parsed.data.context,
      note: parsed.data.note,
      source: "manual",
    });

    await trackEvent("manual_log_created", user.id, { event: entry.event, date: entry.date });
    revalidatePath("/dashboard");
    revalidatePath("/log");

    return { ok: true, message: `${entry.event} logged.`, entry };
  } catch (error) {
    logServerError("createManualTimeEntryAction", error);
    return { ok: false, message: "Unable to save that swim time. Please try again." };
  }
}
