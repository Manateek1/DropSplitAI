import { demoOnboardingDefaults, getDemoDashboardData } from "@/lib/mock-data";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeJsonParse } from "@/lib/utils";
import type { DashboardData, OnboardingInput, UploadedFileRecord, WorkoutSection } from "@/types/domain";

function parseWorkoutSections(value: unknown): WorkoutSection[] {
  return safeJsonParse(typeof value === "string" ? value : JSON.stringify(value ?? []), []);
}

function parseExtractedEntries(value: unknown): UploadedFileRecord["extractedEntries"] {
  return safeJsonParse(typeof value === "string" ? value : JSON.stringify(value ?? []), []);
}

function normalizeEmbeddedRows<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object") {
    return [value as T];
  }

  return [];
}

function applyRealtimeFields(data: DashboardData) {
  const todayWorkout = data.weeklyPlan.days.find((day) => !day.completed) ?? data.weeklyPlan.days[0];
  const totalLoggedYardage = data.swimLogs.reduce((sum, log) => sum + log.yardage, 0);

  return {
    ...data,
    dashboardStats: data.dashboardStats.map((stat) => {
      if (stat.label === "This week") {
        return { ...stat, helper: `${totalLoggedYardage.toLocaleString()} yds logged so far` };
      }

      if (stat.label === "Swim days") {
        return { ...stat, helper: `Today's focus: ${todayWorkout.focus}` };
      }

      return stat;
    }),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!isSupabaseConfigured || isDemoMode) {
    return applyRealtimeFields(getDemoDashboardData());
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return applyRealtimeFields(getDemoDashboardData());
    }

    const [profileResult, swimmerResult, bestTimesResult, plansResult, logsResult, messagesResult, notesResult, subscriptionResult, usageResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("swimmer_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("swimmer_best_times").select("*").eq("user_id", user.id).order("time_seconds", { ascending: true }),
      supabase
        .from("weekly_plans")
        .select("*, workout_days(*)")
        .eq("user_id", user.id)
        .order("week_of", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("swim_logs")
        .select("*, time_entries(*), uploaded_files(*)")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
        .limit(12),
      supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: true }).limit(24),
      supabase.from("coach_notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("usage_tracking").select("*").eq("user_id", user.id).eq("metric", "ai_messages").maybeSingle(),
    ]);

    const fallback = getDemoDashboardData();
    const profile = profileResult.data;
    const swimmer = swimmerResult.data;
    const plan = plansResult.data as Record<string, unknown> | null;

    const mapped: DashboardData = {
      ...fallback,
      user: {
        id: user.id,
        email: user.email ?? fallback.user.email,
        firstName: profile?.first_name ?? fallback.user.firstName,
        fullName:
          profile?.full_name ?? `${profile?.first_name ?? fallback.user.firstName} ${profile?.last_name ?? ""}`.trim(),
        avatarUrl: profile?.avatar_url ?? null,
      },
      swimmerProfile: {
        ...fallback.swimmerProfile,
        age: swimmer?.age ?? fallback.swimmerProfile.age,
        gradeGroup: swimmer?.grade_group ?? fallback.swimmerProfile.gradeGroup,
        skillLevel: swimmer?.skill_level ?? fallback.swimmerProfile.skillLevel,
        heightInInches: swimmer?.height_in_inches ?? fallback.swimmerProfile.heightInInches,
        weightLbs: swimmer?.weight_lbs ?? fallback.swimmerProfile.weightLbs,
        favoriteStrokes: swimmer?.favorite_strokes ?? fallback.swimmerProfile.favoriteStrokes,
        bestEvents: swimmer?.best_events ?? fallback.swimmerProfile.bestEvents,
        weaknesses: swimmer?.weaknesses ?? fallback.swimmerProfile.weaknesses,
        weeklySwimDays: swimmer?.weekly_swim_days ?? fallback.swimmerProfile.weeklySwimDays,
        poolAccess: swimmer?.pool_access ?? fallback.swimmerProfile.poolAccess,
        goals: swimmer?.goals ?? fallback.swimmerProfile.goals,
        targetEvents: swimmer?.target_events ?? fallback.swimmerProfile.targetEvents,
        currentTrainingLevel: swimmer?.current_training_level ?? fallback.swimmerProfile.currentTrainingLevel,
        sorenessNotes: swimmer?.soreness_notes ?? fallback.swimmerProfile.sorenessNotes,
        onboardingCompleted: swimmer?.onboarding_completed ?? fallback.swimmerProfile.onboardingCompleted,
      },
      bestTimes:
        bestTimesResult.data?.map((row) => ({
          id: row.id,
          event: row.event_name,
          course: row.course,
          time: row.time_display,
          timeSeconds: row.time_seconds,
          date: row.recorded_at,
          note: row.note ?? undefined,
        })) ?? fallback.bestTimes,
      weeklyPlan:
        plan
          ? {
              id: String(plan.id),
              weekOf: String(plan.week_of),
              totalPlannedYardage: Number(plan.total_yardage ?? 0),
              targetSwimDays: Number(plan.target_swim_days ?? 0),
              strokeFocus: String(plan.stroke_focus ?? fallback.weeklyPlan.strokeFocus),
              coachSummary: String(plan.coach_summary ?? fallback.weeklyPlan.coachSummary),
              days: ((plan.workout_days ?? []) as Array<Record<string, unknown>>).map((day) => ({
                id: String(day.id),
                date: String(day.day_date),
                label: String(day.day_label),
                focus: String(day.focus),
                intensity: day.intensity as "easy" | "moderate" | "hard" | "recovery",
                strokeFocus: String(day.stroke_focus),
                totalYardage: Number(day.total_yardage ?? 0),
                coachNote: String(day.coach_note ?? ""),
                completed: Boolean(day.completed),
                warmup: parseWorkoutSections(day.warmup_json),
                preSet: parseWorkoutSections(day.pre_set_json),
                mainSet: parseWorkoutSections(day.main_set_json),
                kick: parseWorkoutSections(day.kick_json),
                pull: parseWorkoutSections(day.pull_json),
                drill: parseWorkoutSections(day.drill_json),
                cooldown: parseWorkoutSections(day.cooldown_json),
                dryland: parseWorkoutSections(day.dryland_json),
              })),
            }
          : fallback.weeklyPlan,
      swimLogs:
        logsResult.data?.map((row) => ({
          id: row.id,
          date: row.log_date,
          yardage: row.yardage,
          durationMinutes: row.duration_minutes,
          type: row.log_type,
          sorenessLevel: row.soreness_level ?? undefined,
          note: row.note ?? undefined,
          timeEntries: normalizeEmbeddedRows<Record<string, unknown>>(row.time_entries).map((entry) => ({
            id: String(entry.id),
            event: String(entry.event_name) as DashboardData["bestTimes"][number]["event"],
            course: String(entry.course) as DashboardData["bestTimes"][number]["course"],
            time: String(entry.time_display),
            timeSeconds: Number(entry.time_seconds),
            date: String(entry.recorded_at),
            context: String(entry.context) as DashboardData["swimLogs"][number]["type"],
            note: (entry.note as string | null | undefined) ?? undefined,
            source: String(entry.source) as "chat" | "manual" | "upload",
            confidence: (entry.confidence as number | null | undefined) ?? undefined,
          })),
          uploadedFiles: normalizeEmbeddedRows<Record<string, unknown>>(row.uploaded_files).map((file) => ({
            id: String(file.id),
            fileName: String(file.file_name),
            storagePath: (file.storage_path as string | null | undefined) ?? null,
            publicUrl: (file.public_url as string | null | undefined) ?? null,
            mimeType: String(file.mime_type),
            sizeBytes: Number(file.size_bytes),
            kind: String(file.kind) as UploadedFileRecord["kind"],
            summary: (file.summary as string | null | undefined) ?? undefined,
            extractedEntries: parseExtractedEntries(file.extracted_entries_json),
            createdAt: String(file.created_at),
          })),
        })) ?? fallback.swimLogs,
      recentMessages:
        messagesResult.data?.map((row) => ({
          id: row.id,
          role: row.role,
          content: row.content,
          createdAt: row.created_at,
          suggestions: row.suggestions ?? undefined,
          actions: safeJsonParse(row.actions_json ?? "[]", []),
        })) ?? fallback.recentMessages,
      coachNotes:
        notesResult.data?.map((row) => ({
          id: row.id,
          title: row.title,
          body: row.body,
          createdAt: row.created_at,
          category: row.category,
        })) ?? fallback.coachNotes,
      subscription: {
        tier: subscriptionResult.data?.tier ?? fallback.subscription.tier,
        status: subscriptionResult.data?.status ?? fallback.subscription.status,
        messageLimit: subscriptionResult.data?.monthly_message_limit ?? fallback.subscription.messageLimit,
        messagesUsed: usageResult.data?.current_count ?? fallback.subscription.messagesUsed,
        renewalDate: subscriptionResult.data?.current_period_end ?? fallback.subscription.renewalDate,
      },
    };

    return applyRealtimeFields(mapped);
  } catch {
    return applyRealtimeFields(getDemoDashboardData());
  }
}

export async function getViewerState() {
  const data = await getDashboardData();

  return {
    demoMode: isDemoMode,
    user: data.user,
    onboardingCompleted: data.swimmerProfile.onboardingCompleted,
    subscription: data.subscription,
  };
}

export async function getOnboardingDefaults(): Promise<OnboardingInput> {
  if (!isSupabaseConfigured || isDemoMode) {
    return demoOnboardingDefaults;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return demoOnboardingDefaults;
    }

    const [profileResult, swimmerResult, bestTimesResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("swimmer_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("swimmer_best_times").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }),
    ]);

    return {
      firstName: profileResult.data?.first_name ?? demoOnboardingDefaults.firstName,
      age: swimmerResult.data?.age ?? undefined,
      gradeGroup: swimmerResult.data?.grade_group ?? undefined,
      skillLevel: swimmerResult.data?.skill_level ?? demoOnboardingDefaults.skillLevel,
      heightInInches: swimmerResult.data?.height_in_inches ?? undefined,
      weightLbs: swimmerResult.data?.weight_lbs ?? undefined,
      favoriteStrokes: swimmerResult.data?.favorite_strokes ?? demoOnboardingDefaults.favoriteStrokes,
      bestEvents: swimmerResult.data?.best_events ?? demoOnboardingDefaults.bestEvents,
      bestTimes:
        bestTimesResult.data?.map((row) => ({ event: row.event_name, time: row.time_display, course: row.course })) ??
        demoOnboardingDefaults.bestTimes,
      weaknesses: swimmerResult.data?.weaknesses ?? demoOnboardingDefaults.weaknesses,
      weeklySwimDays: swimmerResult.data?.weekly_swim_days ?? demoOnboardingDefaults.weeklySwimDays,
      poolAccess: swimmerResult.data?.pool_access ?? undefined,
      goals: swimmerResult.data?.goals ?? demoOnboardingDefaults.goals,
      targetEvents: swimmerResult.data?.target_events ?? demoOnboardingDefaults.targetEvents,
      currentTrainingLevel: swimmerResult.data?.current_training_level ?? undefined,
      sorenessNotes: swimmerResult.data?.soreness_notes ?? undefined,
    };
  } catch {
    return demoOnboardingDefaults;
  }
}
