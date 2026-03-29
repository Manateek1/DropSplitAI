export type CourseType = "SCY" | "SCM" | "LCM";
export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type TrainingContext = "practice" | "meet" | "time-trial";
export type UploadKind = "meet-results" | "practice-board" | "splits" | "heat-sheet" | "other";
export type SubscriptionTier = "free" | "pro";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "free";

export type SwimEvent =
  | "50 free"
  | "100 free"
  | "200 free"
  | "500 free"
  | "50 back"
  | "100 back"
  | "200 back"
  | "50 breast"
  | "100 breast"
  | "200 breast"
  | "50 fly"
  | "100 fly"
  | "200 fly"
  | "100 IM"
  | "200 IM"
  | "400 IM";

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface SwimmerProfile {
  age?: number;
  gradeGroup?: string;
  skillLevel: SkillLevel;
  heightInInches?: number;
  weightLbs?: number;
  favoriteStrokes: string[];
  bestEvents: SwimEvent[];
  weaknesses: string[];
  weeklySwimDays: number;
  poolAccess?: string;
  goals: string[];
  targetEvents: SwimEvent[];
  currentTrainingLevel?: string;
  sorenessNotes?: string;
  onboardingCompleted: boolean;
}

export interface BestTime {
  id: string;
  event: SwimEvent;
  course: CourseType;
  time: string;
  timeSeconds: number;
  date: string;
  note?: string;
}

export interface TimeEntry {
  id: string;
  event: SwimEvent;
  course: CourseType;
  time: string;
  timeSeconds: number;
  date: string;
  context: TrainingContext;
  note?: string;
  source: "chat" | "manual" | "upload";
  confidence?: number;
}

export interface UploadedFileRecord {
  id: string;
  fileName: string;
  storagePath?: string | null;
  publicUrl?: string | null;
  mimeType: string;
  sizeBytes: number;
  kind: UploadKind;
  summary?: string;
  extractedEntries?: Array<{
    event: SwimEvent;
    time: string;
    confidence: number;
  }>;
  createdAt: string;
}

export interface WorkoutSection {
  title: string;
  reps: string;
  details: string;
  focus: string;
  interval?: string;
  rest?: string;
  yardage?: number;
}

export interface WorkoutDay {
  id: string;
  date: string;
  label: string;
  focus: string;
  intensity: "easy" | "moderate" | "hard" | "recovery";
  strokeFocus: string;
  totalYardage: number;
  coachNote: string;
  completed: boolean;
  warmup: WorkoutSection[];
  preSet?: WorkoutSection[];
  mainSet: WorkoutSection[];
  kick?: WorkoutSection[];
  pull?: WorkoutSection[];
  drill?: WorkoutSection[];
  cooldown: WorkoutSection[];
  dryland?: WorkoutSection[];
}

export interface WeeklyPlan {
  id: string;
  weekOf: string;
  totalPlannedYardage: number;
  targetSwimDays: number;
  strokeFocus: string;
  coachSummary: string;
  days: WorkoutDay[];
}

export interface CoachNote {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  category: "technique" | "recovery" | "mindset" | "race";
}

export interface ChatActionLogTime {
  type: "log_swim_time";
  event: SwimEvent;
  time: string;
  timeSeconds: number;
  course: CourseType;
  date: string;
  context: TrainingContext;
  confidence: number;
}

export interface ChatActionCreatePlan {
  type: "create_weekly_plan";
  focus: string;
}

export interface ChatActionAdjustWorkout {
  type: "adjust_today_workout";
  adjustment: "easier" | "harder" | "swap-focus";
  note: string;
}

export interface ChatActionExplainSet {
  type: "explain_set";
  summary: string;
}

export interface ChatActionRecommendEvents {
  type: "recommend_events";
  primary: SwimEvent[];
  secondary: SwimEvent[];
}

export interface ChatActionSuggestDrills {
  type: "suggest_drills";
  drills: string[];
}

export interface ChatActionSuggestDryland {
  type: "suggest_dryland_if_needed";
  exercises: string[];
}

export interface ChatActionSummarizeUpload {
  type: "summarize_uploaded_image";
  summary: string;
}

export type CoachAction =
  | ChatActionLogTime
  | ChatActionCreatePlan
  | ChatActionAdjustWorkout
  | ChatActionExplainSet
  | ChatActionRecommendEvents
  | ChatActionSuggestDrills
  | ChatActionSuggestDryland
  | ChatActionSummarizeUpload;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  suggestions?: string[];
  actions?: CoachAction[];
  loggedEntry?: TimeEntry;
  uploadedFile?: UploadedFileRecord;
}

export interface SwimLog {
  id: string;
  date: string;
  yardage: number;
  durationMinutes: number;
  type: TrainingContext;
  sorenessLevel?: number;
  note?: string;
  timeEntries: TimeEntry[];
  uploadedFiles?: UploadedFileRecord[];
}

export interface DashboardStat {
  label: string;
  value: string;
  delta?: string;
  helper?: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface EventRecommendationInsight {
  title: string;
  description: string;
  primaryEvents: SwimEvent[];
  secondaryEvents: SwimEvent[];
}

export interface DashboardData {
  user: AppUser;
  swimmerProfile: SwimmerProfile;
  bestTimes: BestTime[];
  weeklyPlan: WeeklyPlan;
  recentMessages: ChatMessage[];
  swimLogs: SwimLog[];
  coachNotes: CoachNote[];
  dashboardStats: DashboardStat[];
  progressSeries: ChartPoint[];
  frequencySeries: ChartPoint[];
  eventInsight: EventRecommendationInsight;
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    messageLimit: number | null;
    messagesUsed: number;
    renewalDate?: string | null;
  };
}

export interface AuthActionResult {
  ok: boolean;
  message?: string;
  redirectTo?: string;
}

export interface OnboardingInput {
  firstName: string;
  age?: number;
  gradeGroup?: string;
  skillLevel: SkillLevel;
  heightInInches?: number;
  weightLbs?: number;
  favoriteStrokes: string[];
  bestEvents: SwimEvent[];
  bestTimes: Array<{
    event: SwimEvent;
    time: string;
    course: CourseType;
  }>;
  weaknesses: string[];
  weeklySwimDays: number;
  poolAccess?: string;
  goals: string[];
  targetEvents: SwimEvent[];
  currentTrainingLevel?: string;
  sorenessNotes?: string;
}
