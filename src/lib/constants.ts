import type { CourseType, SwimEvent } from "@/types/domain";

export const APP_NAME = "DropSplit AI";
export const APP_DESCRIPTION =
  "Personalized swim coaching, powered by AI. Build weekly plans, log times, and get coach-style swim guidance.";

export const FREE_TIER_MESSAGE_LIMIT = 40;
export const PRO_TIER_MESSAGE_LIMIT = null;

export const SWIM_EVENTS: SwimEvent[] = [
  "50 free",
  "100 free",
  "200 free",
  "500 free",
  "50 back",
  "100 back",
  "200 back",
  "50 breast",
  "100 breast",
  "200 breast",
  "50 fly",
  "100 fly",
  "200 fly",
  "100 IM",
  "200 IM",
  "400 IM",
];

export const COURSE_TYPES: CourseType[] = ["SCY", "SCM", "LCM"];

export const SUGGESTION_CHIPS = [
  "I'm sore today",
  "Explain this set",
  "Best warmup for breaststroke?",
  "Help me drop time",
];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat" },
  { href: "/plan", label: "Weekly plan" },
  { href: "/log", label: "Swim log" },
  { href: "/settings", label: "Settings" },
  { href: "/billing", label: "Billing" },
] as const;

export const LANDING_FAQS = [
  {
    question: "Is DropSplit AI for competitive swimmers only?",
    answer:
      "It is built for middle school and high school swimmers who already care about improving, especially intermediate swimmers who want more personal coaching support.",
  },
  {
    question: "Does it replace my team coach?",
    answer:
      "No. It works like an extra coach in your pocket. It helps you understand sets, adjust training, and make smarter decisions between practices.",
  },
  {
    question: "Can I upload meet screenshots or practice boards?",
    answer:
      "Yes. You can upload result screenshots, split sheets, or a photo of a workout board, and the app can summarize and help log the useful parts.",
  },
  {
    question: "What do I get on the free plan?",
    answer:
      "The free plan includes the full app with a monthly AI message cap so swimmers can try real coaching support before upgrading.",
  },
];
