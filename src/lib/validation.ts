import { z } from "zod";

import { COURSE_TYPES, SWIM_EVENTS } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters."),
});

export const signupSchema = loginSchema.extend({
  firstName: z.string().min(2, "Tell us what to call you."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters."),
});

export const onboardingSchema = z.object({
  firstName: z.string().min(2),
  age: z.coerce.number().min(10).max(19).optional(),
  gradeGroup: z.string().min(2).optional(),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  heightInInches: z.coerce.number().min(48).max(84).optional(),
  weightLbs: z.coerce.number().min(60).max(260).optional(),
  favoriteStrokes: z.array(z.string()).min(1, "Pick at least one stroke."),
  bestEvents: z.array(z.enum(SWIM_EVENTS)).min(1, "Pick at least one event."),
  bestTimes: z
    .array(
      z.object({
        event: z.enum(SWIM_EVENTS),
        time: z.string().min(3),
        course: z.enum(COURSE_TYPES),
      }),
    )
    .default([]),
  weaknesses: z.array(z.string()).default([]),
  weeklySwimDays: z.coerce.number().min(1).max(7),
  poolAccess: z.string().optional(),
  goals: z.array(z.string()).min(1, "Add at least one goal."),
  targetEvents: z.array(z.enum(SWIM_EVENTS)).default([]),
  currentTrainingLevel: z.string().optional(),
  sorenessNotes: z.string().optional(),
});

export const manualTimeEntrySchema = z.object({
  event: z.enum(SWIM_EVENTS),
  course: z.enum(COURSE_TYPES),
  time: z.string().min(3),
  date: z.string().min(4),
  context: z.enum(["practice", "meet", "time-trial"]),
  note: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OnboardingSchemaInput = z.infer<typeof onboardingSchema>;
export type ManualTimeEntryInput = z.infer<typeof manualTimeEntrySchema>;
