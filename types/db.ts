/** Filas tal y como existen en PostgreSQL (fechas como "YYYY-MM-DD"). */

export type WeightUnit = "kg" | "lb";
export type Goal = "lose_fat" | "gain_muscle" | "maintain" | "habits" | "other";
export type HabitKind = "check" | "quantity" | "weight" | "workout" | "cardio";
export type HabitLogStatus = "completed" | "in_progress" | "skipped";
export type CardioMode = "days" | "minutes" | "both";
export type EntryCategory = "workout" | "cardio";
export type StreakEventKind = "milestone" | "record" | "perfect_day" | "perfect_week";

export interface ProfileRow {
  id: string;
  name: string;
  color: string;
  avatar_url: string | null;
  avatar_emoji: string | null;
  pin_hash: string | null;
  pin_failed_attempts: number;
  pin_locked_until: string | null;
  created_at: string;
  updated_at: string;
}

/** Perfil seguro para enviar al cliente (sin hash). */
export interface PublicProfile {
  id: string;
  name: string;
  color: string;
  avatarUrl: string | null;
  avatarEmoji: string | null;
  hasPin: boolean;
}

export interface ProfileSettingsRow {
  profile_id: string;
  weight_unit: WeightUnit;
  timezone: string;
  goal: Goal | null;
  target_weight: number | null;
  workout_days: number[];
  habits_goal_percent: number;
  weight_habits: number;
  weight_workouts: number;
  weight_cardio: number;
  onboarded: boolean;
  current_streak: number;
  longest_streak: number;
  streak_updated_on: string | null;
  /** "Participar en la liga" (por defecto sí). */
  league_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface EntryTypeRow {
  id: string;
  profile_id: string;
  category: EntryCategory;
  name: string;
  created_at: string;
}

export interface WeightEntryRow {
  id: string;
  profile_id: string;
  date: string;
  time: string | null;
  weight: number;
  unit: WeightUnit;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutEntryRow {
  id: string;
  profile_id: string;
  date: string;
  workout_type: string;
  is_rest: boolean;
  duration_min: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CardioEntryRow {
  id: string;
  profile_id: string;
  date: string;
  cardio_type: string;
  minutes: number;
  distance_km: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteRow {
  id: string;
  profile_id: string;
  date: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface HabitRow {
  id: string;
  profile_id: string;
  name: string;
  icon: string;
  kind: HabitKind;
  required: boolean;
  active: boolean;
  sort_order: number;
  start_date: string;
  /** Último día (incluido) en que se programa; null = sin fin. Hábitos de evento de los torneos. */
  end_date: string | null;
  /** Hábito de grupo (obligatorio y bloqueado para todos); null = personal. */
  group_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitScheduleRow {
  id: string;
  habit_id: string;
  profile_id: string;
  weekday: number;
  target_value: number | null;
  unit: string | null;
}

export interface HabitLogRow {
  id: string;
  profile_id: string;
  habit_id: string;
  date: string;
  value: number | null;
  status: HabitLogStatus;
  completed: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyGoalRow {
  id: string;
  profile_id: string;
  week_start: string;
  workout_sessions_target: number;
  cardio_mode: CardioMode;
  cardio_days_target: number;
  cardio_minutes_target: number;
}

export interface WeeklySummaryRow {
  id: string;
  profile_id: string;
  week_start: string;
  adherence_percent: number;
  habits_percent: number | null;
  workout_count: number;
  workout_target: number;
  cardio_days: number;
  cardio_days_target: number;
  cardio_minutes: number;
  cardio_minutes_target: number;
  avg_weight: number | null;
  weight_unit: WeightUnit | null;
  completed_days: number;
  streak_at_end: number;
}

export interface StreakEventRow {
  id: string;
  profile_id: string;
  date: string;
  kind: StreakEventKind;
  value: number;
  seen_at: string | null;
}

export interface LeagueTitleRow {
  id: string;
  /** Día 1 del mes ganado. */
  month: string;
  profile_id: string;
  points: number;
  adherence: number;
}

export interface TournamentTrophyRow {
  id: string;
  /** id del torneo en lib/domain/tournaments.ts. */
  tournament_id: string;
  profile_id: string;
  /** 1 campeón · 2 subcampeón · 3 bronce. */
  place: 1 | 2 | 3;
  points: number;
}
