import { describe, expect, it } from "vitest";

import { accountSettingsSchema, manualTimeEntrySchema, onboardingSchema } from "@/lib/validation";

describe("validation", () => {
  it("accepts optional onboarding fields when required coaching context exists", () => {
    const result = onboardingSchema.safeParse({
      firstName: "Sam",
      skillLevel: "intermediate",
      favoriteStrokes: ["Freestyle"],
      bestEvents: ["50 free"],
      bestTimes: [],
      weaknesses: [],
      weeklySwimDays: 4,
      goals: ["Drop time"],
      targetEvents: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid swim times", () => {
    const result = manualTimeEntrySchema.safeParse({
      event: "50 free",
      course: "SCY",
      time: "fast",
      date: "2026-05-13",
      context: "practice",
    });

    expect(result.success).toBe(false);
  });

  it("validates account preferences", () => {
    const result = accountSettingsSchema.safeParse({
      firstName: "Sam",
      weeklySwimDays: 5,
      favoriteStrokes: "Freestyle, Backstroke",
      prefersSimpleExplanations: true,
      autoEasyOnSoreness: true,
    });

    expect(result.success).toBe(true);
  });
});
