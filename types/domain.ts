import type { ISODate } from "@/lib/dates";
import type {
  CardioEntryRow,
  CardioMode,
  HabitRow,
  HabitScheduleRow,
  HabitLogRow,
  NoteRow,
  ProfileSettingsRow,
  PublicProfile,
  WeeklyGoalRow,
  WeightEntryRow,
  WorkoutEntryRow,
  EntryTypeRow,
  StreakEventRow,
  WeeklySummaryRow,
} from "./db";

export type HabitStatus = "pending" | "in_progress" | "completed" | "skipped" | "rest" | "missed";

/**
 * Estado de un día para la racha:
 *  - completed: todos los hábitos obligatorios programados cumplidos
 *  - pending:   es hoy y aún faltan obligatorios
 *  - rest:      no había obligatorios (o todos excusados por descanso planificado)
 *  - failed:    día cerrado con algún obligatorio sin cumplir
 *  - none:      antes de empezar el seguimiento / futuro
 */
export type DayStatus = "completed" | "pending" | "rest" | "failed" | "none";

export interface Habit extends HabitRow {
  schedules: HabitScheduleRow[];
}

export interface HabitDetail {
  label: string;
  value: string;
}

export interface HabitDayResult {
  habit: Habit;
  date: ISODate;
  scheduled: boolean;
  status: HabitStatus;
  /** Valor numérico registrado (minutos, litros, kg…) */
  value: number | null;
  target: number | null;
  unit: string | null;
  /** Texto corto para mostrar a la derecha: "76,4 kg", "24 / 30 min", "Pierna" */
  display: string | null;
  progress: number;
  details: HabitDetail[];
  log: HabitLogRow | null;
}

export interface DayEvaluation {
  date: ISODate;
  status: DayStatus;
  requiredTotal: number;
  requiredDone: number;
  habits: HabitDayResult[];
}

export interface StreakSummary {
  current: number;
  longest: number;
  today: DayStatus;
  /** Racha que había antes de hoy (para saber si hoy suma) */
  beforeToday: number;
  last7: { date: ISODate; status: DayStatus }[];
  nextMilestone: number | null;
  milestone: number | null;
  /** Hoy se superó el récord histórico */
  isRecord: boolean;
}

export interface WeekGoals {
  workoutTarget: number;
  cardioMode: CardioMode;
  cardioDaysTarget: number;
  cardioMinutesTarget: number;
}

export interface AdherenceWeights {
  habits: number;
  workouts: number;
  cardio: number;
}

export interface WeekObjective {
  key: "habits" | "workouts" | "cardio_days" | "cardio_minutes";
  label: string;
  met: boolean;
  /** "Te faltaron 18 minutos de cardio." */
  missing: string | null;
}

export interface WeekMetrics {
  weekStart: ISODate;
  weekEnd: ISODate;
  isCurrent: boolean;
  isClosed: boolean;
  elapsedDays: number;
  goals: WeekGoals;
  habits: { done: number; total: number; percent: number | null };
  workouts: { count: number; target: number; types: string[] };
  cardio: {
    days: number;
    daysTarget: number;
    minutes: number;
    minutesTarget: number;
    mode: CardioMode;
    dailyMinutes: number[];
  };
  avgWeight: number | null;
  adherence: number;
  components: { key: string; label: string; ratio: number; weight: number }[];
  objectives: WeekObjective[];
  completedDays: number;
  dayStatuses: { date: ISODate; status: DayStatus }[];
  streakAtEnd: number;
}

export interface ProfileSnapshot {
  profile: PublicProfile;
  settings: ProfileSettingsRow;
  habits: Habit[];
  habitLogs: HabitLogRow[];
  weights: WeightEntryRow[];
  workouts: WorkoutEntryRow[];
  cardio: CardioEntryRow[];
  notes: NoteRow[];
  goals: WeeklyGoalRow[];
  entryTypes: EntryTypeRow[];
  streakEvents: StreakEventRow[];
  storedSummaries: WeeklySummaryRow[];
  today: ISODate;
}

export type InsightKind = "weight" | "cardio" | "workouts" | "habits" | "streak";

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  message: string;
  tone: "positive" | "negative" | "neutral";
  chart:
    | { type: "compare"; labels: [string, string]; values: [number, number]; unit: string }
    | { type: "bars"; labels: string[]; values: number[]; unit: string; highlight?: number }
    | { type: "progress"; value: number; max: number; unit: string };
  action?: { label: string; href?: string; quickAdd?: QuickAddKind };
}

export type QuickAddKind = "weight" | "workout" | "cardio" | "habit" | "note";

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}
