import { buildContext, type ContextInput } from "@/lib/domain/context";
import type { HabitKind, HabitLogRow, WeightEntryRow, WorkoutEntryRow, CardioEntryRow } from "@/types/db";
import type { Habit } from "@/types/domain";

let seq = 0;
const id = () => `id-${++seq}`;

export function habit(partial: Partial<Habit> & { kind?: HabitKind; weekdays?: number[]; target?: number }): Habit {
  const hid = partial.id ?? id();
  const weekdays = partial.weekdays ?? [1, 2, 3, 4, 5, 6, 7];
  return {
    id: hid,
    profile_id: "p",
    name: partial.name ?? "Hábito",
    icon: "check",
    kind: partial.kind ?? "check",
    required: partial.required ?? true,
    active: partial.active ?? true,
    sort_order: 0,
    start_date: partial.start_date ?? "2026-01-01",
    end_date: partial.end_date ?? null,
    group_key: partial.group_key ?? null,
    created_at: "",
    updated_at: "",
    schedules: weekdays.map((weekday) => ({
      id: id(),
      habit_id: hid,
      profile_id: "p",
      weekday,
      target_value: partial.target ?? null,
      unit: null,
    })),
  };
}

export function log(habitId: string, date: string, extra: Partial<HabitLogRow> = {}): HabitLogRow {
  return {
    id: id(),
    profile_id: "p",
    habit_id: habitId,
    date,
    value: null,
    status: "completed",
    completed: true,
    note: null,
    created_at: "",
    updated_at: "",
    ...extra,
  };
}

export function workout(date: string, type = "Pierna", isRest = false): WorkoutEntryRow {
  return { id: id(), profile_id: "p", date, workout_type: type, is_rest: isRest, duration_min: 60, note: null, created_at: "", updated_at: "" };
}

export function cardio(date: string, minutes: number): CardioEntryRow {
  return { id: id(), profile_id: "p", date, cardio_type: "Caminar", minutes, distance_km: null, note: null, created_at: "", updated_at: "" };
}

export function weight(date: string, value: number): WeightEntryRow {
  return { id: id(), profile_id: "p", date, time: null, weight: value, unit: "kg", note: null, created_at: "", updated_at: "" };
}

export function ctx(input: Partial<ContextInput> & { today: string }) {
  return buildContext({
    settings: {
      weight_unit: "kg",
      workout_days: [1, 3, 5],
      habits_goal_percent: 85,
      weight_habits: 40,
      weight_workouts: 30,
      weight_cardio: 30,
      goal: null,
      target_weight: null,
    },
    habits: [],
    habitLogs: [],
    weights: [],
    workouts: [],
    cardio: [],
    goals: [],
    ...input,
  });
}
