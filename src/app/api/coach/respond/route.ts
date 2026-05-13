import { NextResponse } from "next/server";

import { generateCoachReply } from "@/lib/ai/coach";
import { getDashboardData } from "@/lib/data";
import { isDemoMode, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { logServerError, trackEvent } from "@/lib/observability";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { persistTimeEntry } from "@/lib/time-entries";
import type { UploadedFileRecord } from "@/types/domain";

const MAX_MESSAGE_LENGTH = 1200;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: string; uploadedFile?: UploadedFileRecord | null };
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: "Keep coach messages under 1,200 characters." }, { status: 400 });
    }

    let userId: string | null = null;
    let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>> | null = null;

    if (isSupabaseConfigured) {
      supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
      }

      userId = user.id;
    } else if (!isDemoMode) {
      return NextResponse.json({ error: "Supabase must be configured before using coach chat." }, { status: 503 });
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

    if (isSupabaseConfigured && supabase && userId) {
      const { error: messageError } = await supabase.from("chat_messages").insert([
          {
            user_id: userId,
            role: "user",
            content: message,
            uploaded_file_id: body.uploadedFile?.id ?? null,
          },
          {
            user_id: userId,
            role: "assistant",
            content: reply.assistantMessage,
            suggestions: reply.followUpSuggestions,
            actions_json: JSON.stringify(reply.actions ?? []),
          },
        ]);

      if (messageError) {
        throw messageError;
      }

      if (isSupabaseAdminConfigured) {
        const admin = createServiceSupabaseClient();
        const { error: usageError } = await admin.rpc("increment_usage_metric", {
          p_user_id: userId,
          p_metric: "ai_messages",
          p_increment_by: 1,
        });

        if (usageError) {
          throw usageError;
        }
      }

      if (reply.loggedEntry) {
        await persistTimeEntry(supabase, {
          userId,
          event: reply.loggedEntry.event,
          course: reply.loggedEntry.course,
          time: reply.loggedEntry.time,
          date: reply.loggedEntry.date,
          context: reply.loggedEntry.context,
          note: "Logged from coach chat.",
          source: "chat",
          confidence: reply.loggedEntry.confidence ?? null,
          uploadedFileId: body.uploadedFile?.id ?? null,
        });
        await trackEvent("chat_log_created", userId, {
          event: reply.loggedEntry.event,
          date: reply.loggedEntry.date,
        });
      }
    }

    return NextResponse.json(reply);
  } catch (error) {
    logServerError("api.coach.respond", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate coach reply." },
      { status: 500 },
    );
  }
}
