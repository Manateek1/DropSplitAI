import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { SUGGESTION_CHIPS } from "@/lib/constants";
import { env, isOpenAiConfigured } from "@/lib/env";
import { getDemoDashboardData } from "@/lib/mock-data";
import { coachResponseSchema, type CoachResponsePayload } from "@/lib/ai/schemas";
import { coachingSystemPrompt } from "@/lib/ai/system-prompt";
import { detectCourse, detectSwimEvent, detectTime, isSeriousRecoverySignal, parseTimeString } from "@/lib/swim";
import type { CoachAction, DashboardData, TimeEntry, UploadedFileRecord } from "@/types/domain";

let openAiClient: OpenAI | null = null;

function getOpenAiClient() {
  if (!isOpenAiConfigured) {
    throw new Error("OpenAI is not configured.");
  }

  if (!openAiClient) {
    openAiClient = new OpenAI({ apiKey: env.openAiApiKey });
  }

  return openAiClient;
}

function normalizeActions(payload: CoachResponsePayload): CoachAction[] {
  return payload.actions.map((action) => action as CoachAction);
}

function buildLoggedEntry(actions: CoachAction[]): TimeEntry | undefined {
  const logAction = actions.find((action) => action.type === "log_swim_time");
  if (!logAction || logAction.type !== "log_swim_time") return undefined;

  return {
    id: `logged-${logAction.event}-${logAction.date}`,
    event: logAction.event,
    course: logAction.course,
    time: logAction.time,
    timeSeconds: logAction.timeSeconds,
    date: logAction.date,
    context: logAction.context,
    source: "chat",
    confidence: logAction.confidence,
  };
}

export interface CoachRequestInput {
  message: string;
  dashboardData?: DashboardData;
  uploadedFile?: UploadedFileRecord | null;
}

function mockCoachReply({ message, dashboardData, uploadedFile }: CoachRequestInput): CoachResponsePayload {
  const data = dashboardData ?? getDemoDashboardData();
  const lowerMessage = message.toLowerCase();
  const todayWorkout = data.weeklyPlan.days.find((day) => !day.completed) ?? data.weeklyPlan.days[0];

  if (isSeriousRecoverySignal(message)) {
    return {
      assistantMessage:
        "That sounds more serious than normal soreness. Stop the hard work today, tell your coach and a parent, and get checked by a real medical professional if the pain is sharp or keeps getting worse.",
      followUpSuggestions: ["Make today's workout recovery only", "What should I tell my coach?"],
      coachNote: "Escalated because the message sounds more like injury than regular fatigue.",
      riskLevel: "medical-check" as const,
      actions: [
        {
          type: "adjust_today_workout",
          adjustment: "easier",
          note: "Switch to easy recovery swim or full rest until a real coach or medical professional clears harder work.",
        },
      ],
    };
  }

  const detectedEvent = detectSwimEvent(message);
  const detectedTime = detectTime(message);

  if (detectedEvent && detectedTime) {
    const timeSeconds = parseTimeString(detectedTime);
    return {
      assistantMessage: `Nice work. ${detectedTime} in the ${detectedEvent} is a real result. Biggest next step: keep the first half sharp, then stay relaxed enough to hold water through the finish instead of rushing it.`,
      followUpSuggestions: ["Compare it to my last swim", "What set helps me hold speed late?"],
      coachNote: `Detected a likely ${detectedEvent} time log from casual chat and logged it automatically.`,
      riskLevel: "normal" as const,
      actions: [
        {
          type: "log_swim_time",
          event: detectedEvent,
          time: detectedTime,
          timeSeconds,
          course: detectCourse(message),
          date: new Date().toISOString().slice(0, 10),
          context: /meet/i.test(message) ? "meet" : "practice",
          confidence: 0.95,
        },
      ],
    };
  }

  if (/sore|tired|fatigue|dead arms|heavy/i.test(message)) {
    return {
      assistantMessage: `Got it. Let's make ${todayWorkout.label.toLowerCase()} easier so you still get something useful without digging a deeper hole. Keep the warmup, cut the hardest race-pace reps in half, and turn the rest of the set into smooth aerobic swimming with clean turns.`,
      followUpSuggestions: ["Show me the easier version", "Give me a recovery warmup"],
      coachNote: "Fatigue signal detected. Lowering intensity is the right move today.",
      riskLevel: "recovery" as const,
      actions: [
        {
          type: "adjust_today_workout",
          adjustment: "easier",
          note: "Reduce fast reps, extend recovery, and prioritize technique quality.",
        },
      ],
    };
  }

  if (/explain|what does this set mean|what does this workout mean|interval/i.test(lowerMessage)) {
    return {
      assistantMessage:
        "Think of this set in two parts: the easy swimming keeps your technique clean, and the faster pieces teach you to hit pace without falling apart. The interval is just the send-off time, not a target finish time. You leave on that clock, then use whatever rest is left.",
      followUpSuggestions: ["Explain the main set only", "What pace should I hold?"],
      coachNote: "Explained training language in simpler terms.",
      riskLevel: "normal" as const,
      actions: [
        {
          type: "explain_set",
          summary: "The set mixes controlled aerobic swimming with shorter race-pace reps so the swimmer learns pace and technique together.",
        },
      ],
    };
  }

  if (/what events|which events|focus on/i.test(lowerMessage)) {
    return {
      assistantMessage: `${data.eventInsight.title}. Your sprint free is trending the best right now, and your backstroke stays valuable because your underwater habits are better there. I'd treat ${data.eventInsight.primaryEvents.join(" and ")} as the main focus, with ${data.eventInsight.secondaryEvents.join(" and ")} as strong secondary options.`,
      followUpSuggestions: ["Why those events?", "What should I train more for them?"],
      coachNote: data.eventInsight.description,
      riskLevel: "normal" as const,
      actions: [
        {
          type: "recommend_events",
          primary: data.eventInsight.primaryEvents,
          secondary: data.eventInsight.secondaryEvents,
        },
      ],
    };
  }

  if (/warmup/i.test(lowerMessage) && /breast/i.test(lowerMessage)) {
    return {
      assistantMessage:
        "For breaststroke day, keep the warmup simple: 300 easy swim, 4 x 50 kick on your back with narrow line, 4 x 50 as 25 breast drill + 25 swim, then 4 x 25 build to race tempo. The goal is to wake up timing and feel the catch without loading your legs too early.",
      followUpSuggestions: ["Give me breaststroke drills", "Make it shorter for before school"],
      coachNote: "Breaststroke warmup should emphasize timing, line, and gentle speed build.",
      riskLevel: "normal" as const,
      actions: [
        {
          type: "suggest_drills",
          drills: ["2 kicks 1 pull", "3-second line hold", "kick count 25s"],
        },
      ],
    };
  }

  if (uploadedFile) {
    return {
      assistantMessage: uploadedFile.summary
        ? `I looked at ${uploadedFile.fileName}. ${uploadedFile.summary}`
        : `I looked at ${uploadedFile.fileName}. I can help turn that into logged times or explain the set once you confirm what matters most.`,
      followUpSuggestions: ["Log the likely times", "Explain the set from the screenshot"],
      coachNote: "Uploaded image summary handled in chat flow.",
      riskLevel: "normal" as const,
      actions: [
        {
          type: "summarize_uploaded_image",
          summary: uploadedFile.summary ?? "Uploaded image reviewed.",
        },
      ],
    };
  }

  return {
    assistantMessage: `You're in a good spot to keep building. Today's key focus is ${todayWorkout.focus.toLowerCase()}. If you want the biggest payoff, keep the set quality high and tell me what part feels confusing or what race you're aiming at.`,
    followUpSuggestions: SUGGESTION_CHIPS,
    coachNote: "Default coach-style response.",
    riskLevel: "normal" as const,
    actions: [],
  };
}

export async function summarizeUploadedImage(file: Pick<UploadedFileRecord, "fileName" | "publicUrl" | "mimeType">) {
  if (!file.publicUrl || !isOpenAiConfigured || !file.mimeType.startsWith("image/")) {
    return `Uploaded ${file.fileName}. Ask the coach to log the likely results or explain the set.`;
  }

  try {
    const client = getOpenAiClient();
    const response = await client.responses.create({
      model: env.openAiModel,
      instructions:
        "You summarize swim-related screenshots for swimmers. Be brief, factual, and note uncertainty. Do not invent exact times if unreadable.",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Summarize the likely swim-relevant information in this image." },
            { type: "input_image", image_url: file.publicUrl, detail: "auto" },
          ],
        },
      ],
      max_output_tokens: 250,
    });

    return response.output_text || `Uploaded ${file.fileName}. Ask the coach to review it.`;
  } catch {
    return `Uploaded ${file.fileName}. Ask the coach to review the screenshot details.`;
  }
}

export async function generateCoachReply(input: CoachRequestInput) {
  const dashboardData = input.dashboardData ?? getDemoDashboardData();

  if (!isOpenAiConfigured) {
    const payload = mockCoachReply({ ...input, dashboardData });
    const actions = normalizeActions(payload);

    return {
      ...payload,
      actions,
      loggedEntry: buildLoggedEntry(actions),
    };
  }

  try {
    const client = getOpenAiClient();
    const response = await client.responses.parse({
      model: env.openAiModel,
      instructions: coachingSystemPrompt,
      input: JSON.stringify({
        swimmerProfile: dashboardData.swimmerProfile,
        bestTimes: dashboardData.bestTimes,
        currentWeeklyFocus: dashboardData.weeklyPlan.strokeFocus,
        todayWorkout: dashboardData.weeklyPlan.days.find((day) => !day.completed) ?? dashboardData.weeklyPlan.days[0],
        recentMessages: dashboardData.recentMessages.slice(-6),
        userMessage: input.message,
        uploadedFile: input.uploadedFile,
      }),
      text: {
        format: zodTextFormat(coachResponseSchema, "coach_response"),
      },
      max_output_tokens: 900,
    });

    const payload = response.output_parsed ?? mockCoachReply({ ...input, dashboardData });
    const actions = normalizeActions(payload);

    return {
      ...payload,
      actions,
      loggedEntry: buildLoggedEntry(actions),
    };
  } catch {
    const payload = mockCoachReply({ ...input, dashboardData });
    const actions = normalizeActions(payload);

    return {
      ...payload,
      actions,
      loggedEntry: buildLoggedEntry(actions),
    };
  }
}

export function createMockPlanSummary() {
  const data = getDemoDashboardData();
  return {
    weeklyPlan: data.weeklyPlan,
    summary: `Built a ${data.swimmerProfile.weeklySwimDays}-day week around ${data.weeklyPlan.strokeFocus.toLowerCase()}.`,
  };
}
