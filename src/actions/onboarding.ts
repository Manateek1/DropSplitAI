"use server";

import { getDemoDashboardData } from "@/lib/mock-data";
import { createMockPlanSummary } from "@/lib/ai/coach";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { logServerError, trackEvent } from "@/lib/observability";
import { parseTimeString } from "@/lib/swim";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { onboardingSchema, type OnboardingSchemaInput } from "@/lib/validation";
import type { AuthActionResult } from "@/types/domain";

function throwIfError(result: { error: unknown }) {
  if (result.error) {
    throw result.error;
  }
}

export async function saveOnboardingAction(values: OnboardingSchemaInput): Promise<AuthActionResult> {
  const parsed = onboardingSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please fix the onboarding form." };
  }

  if (!isSupabaseConfigured) {
    return isDemoMode
      ? { ok: true, redirectTo: "/dashboard", message: createMockPlanSummary().summary }
      : { ok: false, message: "Supabase must be configured before onboarding." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "You need to be logged in first." };
    }

    const input = parsed.data;

    throwIfError(await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      first_name: input.firstName,
      full_name: input.firstName,
    }));

    throwIfError(await supabase.from("swimmer_profiles").upsert({
      user_id: user.id,
      age: input.age ?? null,
      grade_group: input.gradeGroup ?? null,
      skill_level: input.skillLevel,
      height_in_inches: input.heightInInches ?? null,
      weight_lbs: input.weightLbs ?? null,
      favorite_strokes: input.favoriteStrokes,
      best_events: input.bestEvents,
      weaknesses: input.weaknesses,
      weekly_swim_days: input.weeklySwimDays,
      pool_access: input.poolAccess ?? null,
      goals: input.goals,
      target_events: input.targetEvents,
      current_training_level: input.currentTrainingLevel ?? null,
      soreness_notes: input.sorenessNotes ?? null,
      prefers_simple_explanations: true,
      auto_easy_on_soreness: true,
      onboarding_completed: true,
    }));

    throwIfError(await supabase.from("swimmer_goals").delete().eq("user_id", user.id));
    if (input.goals.length) {
      throwIfError(await supabase.from("swimmer_goals").insert(
        input.goals.map((goal, index) => ({
          user_id: user.id,
          title: goal,
          priority_order: index + 1,
        })),
      ));
    }

    throwIfError(await supabase.from("swimmer_best_times").delete().eq("user_id", user.id));
    if (input.bestTimes.length) {
      throwIfError(await supabase.from("swimmer_best_times").insert(
        input.bestTimes.map((timeEntry) => ({
          user_id: user.id,
          event_name: timeEntry.event,
          course: timeEntry.course,
          time_display: timeEntry.time,
          time_seconds: parseTimeString(timeEntry.time),
          recorded_at: new Date().toISOString().slice(0, 10),
          source: "manual",
        })),
      ));
    }

    const demoPlan = getDemoDashboardData().weeklyPlan;
    const { data: insertedPlan, error: planError } = await supabase
      .from("weekly_plans")
      .insert({
        user_id: user.id,
        week_of: demoPlan.weekOf,
        total_yardage: demoPlan.totalPlannedYardage,
        target_swim_days: demoPlan.targetSwimDays,
        stroke_focus: demoPlan.strokeFocus,
        coach_summary: demoPlan.coachSummary,
        source: "onboarding",
      })
      .select("id")
      .single();

    if (planError) {
      throw planError;
    }

    if (insertedPlan) {
      throwIfError(await supabase.from("workout_days").delete().eq("weekly_plan_id", insertedPlan.id));
      throwIfError(await supabase.from("workout_days").insert(
        demoPlan.days.map((day, index) => ({
          weekly_plan_id: insertedPlan.id,
          user_id: user.id,
          day_index: index,
          day_label: day.label,
          day_date: day.date,
          focus: day.focus,
          intensity: day.intensity,
          stroke_focus: day.strokeFocus,
          total_yardage: day.totalYardage,
          coach_note: day.coachNote,
          warmup_json: JSON.stringify(day.warmup),
          pre_set_json: JSON.stringify(day.preSet ?? []),
          main_set_json: JSON.stringify(day.mainSet),
          kick_json: JSON.stringify(day.kick ?? []),
          pull_json: JSON.stringify(day.pull ?? []),
          drill_json: JSON.stringify(day.drill ?? []),
          cooldown_json: JSON.stringify(day.cooldown),
          dryland_json: JSON.stringify(day.dryland ?? []),
          completed: day.completed,
        })),
      ));
    }

    await trackEvent("onboarding_completed", user.id, {
      weeklySwimDays: input.weeklySwimDays,
      bestTimes: input.bestTimes.length,
    });

    return { ok: true, redirectTo: "/dashboard", message: createMockPlanSummary().summary };
  } catch (error) {
    logServerError("saveOnboardingAction", error);
    return { ok: false, message: "Unable to save onboarding. Please try again." };
  }
}
