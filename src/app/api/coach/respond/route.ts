import { NextResponse } from "next/server";

import { generateCoachReply } from "@/lib/ai/coach";
import { getDashboardData } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UploadedFileRecord } from "@/types/domain";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: string; uploadedFile?: UploadedFileRecord | null };
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const dashboardData = await getDashboardData();
    const limit = dashboardData.subscription.messageLimit;
    if (limit && dashboardData.subscription.messagesUsed >= limit) {
      return NextResponse.json(
        {
          error: "You have reached this month's AI coach limit on the free plan. Upgrade to keep chatting.",
        },
        { status: 402 },
      );
    }

    const reply = await generateCoachReply({
      message,
      dashboardData,
      uploadedFile: body.uploadedFile,
    });

    if (isSupabaseConfigured) {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("chat_messages").insert([
          {
            user_id: user.id,
            role: "user",
            content: message,
            uploaded_file_id: body.uploadedFile?.id ?? null,
          },
          {
            user_id: user.id,
            role: "assistant",
            content: reply.assistantMessage,
            suggestions: reply.followUpSuggestions,
            actions_json: JSON.stringify(reply.actions ?? []),
          },
        ]);

        await supabase.rpc("increment_usage_metric", {
          p_user_id: user.id,
          p_metric: "ai_messages",
          p_increment_by: 1,
        });

        if (reply.loggedEntry) {
          const { data: createdLog } = await supabase
            .from("swim_logs")
            .insert({
              user_id: user.id,
              log_date: reply.loggedEntry.date,
              yardage: 0,
              duration_minutes: 0,
              log_type: reply.loggedEntry.context,
              note: "Auto-created from coach chat.",
            })
            .select("id")
            .single();

          await supabase.from("time_entries").insert({
            user_id: user.id,
            swim_log_id: createdLog?.id ?? null,
            event_name: reply.loggedEntry.event,
            course: reply.loggedEntry.course,
            time_display: reply.loggedEntry.time,
            time_seconds: reply.loggedEntry.timeSeconds,
            recorded_at: reply.loggedEntry.date,
            context: reply.loggedEntry.context,
            note: "Logged from coach chat.",
            source: "chat",
            confidence: reply.loggedEntry.confidence ?? null,
          });
        }
      }
    }

    return NextResponse.json(reply);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate coach reply." },
      { status: 500 },
    );
  }
}
