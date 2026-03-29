import { z } from "zod";

import { COURSE_TYPES, SWIM_EVENTS } from "@/lib/constants";

const actionSchema = z.object({
  type: z.enum([
    "log_swim_time",
    "create_weekly_plan",
    "adjust_today_workout",
    "explain_set",
    "recommend_events",
    "suggest_drills",
    "suggest_dryland_if_needed",
    "summarize_uploaded_image",
  ]),
  event: z.enum(SWIM_EVENTS).optional(),
  time: z.string().optional(),
  timeSeconds: z.number().optional(),
  course: z.enum(COURSE_TYPES).optional(),
  date: z.string().optional(),
  context: z.enum(["practice", "meet", "time-trial"]).optional(),
  confidence: z.number().min(0).max(1).optional(),
  focus: z.string().optional(),
  adjustment: z.enum(["easier", "harder", "swap-focus"]).optional(),
  note: z.string().optional(),
  summary: z.string().optional(),
  primary: z.array(z.enum(SWIM_EVENTS)).optional(),
  secondary: z.array(z.enum(SWIM_EVENTS)).optional(),
  drills: z.array(z.string()).optional(),
  exercises: z.array(z.string()).optional(),
});

export const coachResponseSchema = z.object({
  assistantMessage: z.string(),
  followUpSuggestions: z.array(z.string()).max(4),
  coachNote: z.string().optional(),
  riskLevel: z.enum(["normal", "recovery", "medical-check"]),
  actions: z.array(actionSchema),
});

export type CoachResponsePayload = z.infer<typeof coachResponseSchema>;
