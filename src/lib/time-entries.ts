import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { parseTimeString } from "@/lib/swim";
import type { CourseType, SwimEvent, TimeEntry, TrainingContext } from "@/types/domain";

interface PersistTimeEntryInput {
  userId: string;
  event: SwimEvent;
  course: CourseType;
  time: string;
  date: string;
  context: TrainingContext;
  note?: string | null;
  source: "chat" | "manual" | "upload";
  confidence?: number | null;
  uploadedFileId?: string | null;
  swimLogId?: string | null;
}

async function syncBestTime(supabase: SupabaseClient, input: PersistTimeEntryInput, timeSeconds: number) {
  const { data: currentBest, error: bestError } = await supabase
    .from("swimmer_best_times")
    .select("id,time_seconds")
    .eq("user_id", input.userId)
    .eq("event_name", input.event)
    .eq("course", input.course)
    .order("time_seconds", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (bestError) {
    throw bestError;
  }

  if (currentBest && Number(currentBest.time_seconds) <= timeSeconds) {
    return;
  }

  await supabase.from("swimmer_best_times").insert({
    user_id: input.userId,
    event_name: input.event,
    course: input.course,
    time_display: input.time,
    time_seconds: timeSeconds,
    recorded_at: input.date,
    note: input.note ?? `Logged from ${input.source}.`,
    source: input.source,
  });
}

export async function persistTimeEntry(supabase: SupabaseClient, input: PersistTimeEntryInput): Promise<TimeEntry> {
  const timeSeconds = parseTimeString(input.time);

  const { data: existing, error: duplicateError } = await supabase
    .from("time_entries")
    .select("id")
    .eq("user_id", input.userId)
    .eq("event_name", input.event)
    .eq("course", input.course)
    .eq("time_seconds", timeSeconds)
    .eq("recorded_at", input.date)
    .maybeSingle();

  if (duplicateError) {
    throw duplicateError;
  }

  if (existing) {
    return {
      id: existing.id,
      event: input.event,
      course: input.course,
      time: input.time,
      timeSeconds,
      date: input.date,
      context: input.context,
      note: input.note ?? undefined,
      source: input.source,
      confidence: input.confidence ?? undefined,
    };
  }

  let swimLogId = input.swimLogId ?? null;

  if (!swimLogId) {
    const { data: createdLog, error: logError } = await supabase
      .from("swim_logs")
      .insert({
        user_id: input.userId,
        uploaded_file_id: input.uploadedFileId ?? null,
        log_date: input.date,
        yardage: 0,
        duration_minutes: 0,
        log_type: input.context,
        note: input.note ?? `Auto-created from ${input.source}.`,
      })
      .select("id")
      .single();

    if (logError) {
      throw logError;
    }

    swimLogId = createdLog.id;
  }

  const { data: entry, error: entryError } = await supabase
    .from("time_entries")
    .insert({
      user_id: input.userId,
      swim_log_id: swimLogId,
      event_name: input.event,
      course: input.course,
      time_display: input.time,
      time_seconds: timeSeconds,
      recorded_at: input.date,
      context: input.context,
      note: input.note ?? `Logged from ${input.source}.`,
      source: input.source,
      confidence: input.confidence ?? null,
    })
    .select("id")
    .single();

  if (entryError) {
    throw entryError;
  }

  await syncBestTime(supabase, input, timeSeconds);

  return {
    id: entry.id,
    event: input.event,
    course: input.course,
    time: input.time,
    timeSeconds,
    date: input.date,
    context: input.context,
    note: input.note ?? undefined,
    source: input.source,
    confidence: input.confidence ?? undefined,
  };
}
