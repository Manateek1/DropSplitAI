import { format, parseISO } from "date-fns";

import type { CourseType, SwimEvent } from "@/types/domain";

export const swimEventAliasMap: Array<{ event: SwimEvent; pattern: RegExp }> = [
  { event: "50 free", pattern: /\b50\s*(free|freestyle)\b/i },
  { event: "100 free", pattern: /\b100\s*(free|freestyle)\b/i },
  { event: "200 free", pattern: /\b200\s*(free|freestyle)\b/i },
  { event: "500 free", pattern: /\b500\s*(free|freestyle)\b/i },
  { event: "50 back", pattern: /\b50\s*(back|backstroke)\b/i },
  { event: "100 back", pattern: /\b100\s*(back|backstroke)\b/i },
  { event: "200 back", pattern: /\b200\s*(back|backstroke)\b/i },
  { event: "50 breast", pattern: /\b50\s*(breast|breaststroke)\b/i },
  { event: "100 breast", pattern: /\b100\s*(breast|breaststroke)\b/i },
  { event: "200 breast", pattern: /\b200\s*(breast|breaststroke)\b/i },
  { event: "50 fly", pattern: /\b50\s*(fly|butterfly)\b/i },
  { event: "100 fly", pattern: /\b100\s*(fly|butterfly)\b/i },
  { event: "200 fly", pattern: /\b200\s*(fly|butterfly)\b/i },
  { event: "100 IM", pattern: /\b100\s*(im|individual\s*medley)\b/i },
  { event: "200 IM", pattern: /\b200\s*(im|individual\s*medley)\b/i },
  { event: "400 IM", pattern: /\b400\s*(im|individual\s*medley)\b/i },
];

export function detectSwimEvent(text: string): SwimEvent | null {
  const normalized = text.toLowerCase();
  const match = swimEventAliasMap.find(({ pattern }) => pattern.test(normalized));
  return match?.event ?? null;
}

export function parseTimeString(raw: string): number {
  if (raw.includes(":")) {
    const [minutes, secondsPart] = raw.split(":");
    return Number(minutes) * 60 + Number(secondsPart);
  }

  return Number(raw);
}

export function formatSeconds(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remaining = (seconds % 60).toFixed(2).padStart(5, "0");
    return `${minutes}:${remaining}`;
  }

  return seconds.toFixed(2);
}

export function detectTime(text: string): string | null {
  const match = text.match(/\b(\d{1,2}:\d{2}(?:\.\d{1,2})?|\d{1,2}\.\d{1,2})\b/);
  return match?.[1] ?? null;
}

export function detectCourse(text: string): CourseType {
  if (/\blcm\b/i.test(text)) return "LCM";
  if (/\bscm\b/i.test(text)) return "SCM";
  return "SCY";
}

export function humanDate(date: string): string {
  return format(parseISO(date), "MMM d");
}

export function standardizeStrokeLabel(label: string) {
  return label
    .replace(/\bfree(style)?\b/gi, "Free")
    .replace(/\bback(stroke)?\b/gi, "Back")
    .replace(/\bbreast(stroke)?\b/gi, "Breast")
    .replace(/\bbutterfly\b/gi, "Fly")
    .replace(/\bim\b/gi, "IM");
}

export function isSeriousRecoverySignal(message: string) {
  return /(sharp pain|injured|can't move|shoulder pain|back pain|knee pain|dizzy|lightheaded)/i.test(
    message,
  );
}
