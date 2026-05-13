"use server";

import { revalidatePath } from "next/cache";

import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { logServerError, trackEvent } from "@/lib/observability";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthActionResult, WorkoutDay } from "@/types/domain";

type WorkoutAdjustment = "easier" | "harder" | "swap-focus";

async function getUserId() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

export async function updateWorkoutCompletionAction(
  dayId: string,
  completed: boolean,
): Promise<AuthActionResult & { completed?: boolean }> {
  if (!isSupabaseConfigured) {
    return isDemoMode
      ? { ok: true, completed, message: "Demo workout status updated for this session." }
      : { ok: false, message: "Supabase must be configured before updating workouts." };
  }

  try {
    const { supabase, userId } = await getUserId();
    if (!userId) {
      return { ok: false, message: "You need to be logged in." };
    }

    const { error } = await supabase
      .from("workout_days")
      .update({ completed })
      .eq("id", dayId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    if (completed) {
      await trackEvent("workout_completed", userId, { dayId });
    }

    revalidatePath("/dashboard");
    revalidatePath("/plan");

    return { ok: true, completed, message: completed ? "Workout marked complete." : "Workout marked incomplete." };
  } catch (error) {
    logServerError("updateWorkoutCompletionAction", error, { dayId });
    return { ok: false, message: "Unable to update that workout." };
  }
}

export async function adjustWorkoutDayAction(
  day: WorkoutDay,
  adjustment: WorkoutAdjustment,
): Promise<AuthActionResult & { day?: WorkoutDay }> {
  const updated: WorkoutDay =
    adjustment === "easier"
      ? { ...day, intensity: "easy", coachNote: `Made easier: ${day.coachNote}` }
      : adjustment === "harder"
        ? { ...day, intensity: "hard", coachNote: `Made harder: ${day.coachNote}` }
        : { ...day, focus: `Swap focus: ${day.strokeFocus}` };

  if (!isSupabaseConfigured) {
    return isDemoMode
      ? { ok: true, day: updated, message: "Demo workout adjusted for this session." }
      : { ok: false, message: "Supabase must be configured before adjusting workouts." };
  }

  try {
    const { supabase, userId } = await getUserId();
    if (!userId) {
      return { ok: false, message: "You need to be logged in." };
    }

    const { error } = await supabase
      .from("workout_days")
      .update({
        focus: updated.focus,
        intensity: updated.intensity,
        coach_note: updated.coachNote,
      })
      .eq("id", day.id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    revalidatePath("/dashboard");
    revalidatePath("/plan");

    return { ok: true, day: updated, message: "Workout adjusted." };
  } catch (error) {
    logServerError("adjustWorkoutDayAction", error, { dayId: day.id, adjustment });
    return { ok: false, message: "Unable to adjust that workout." };
  }
}
