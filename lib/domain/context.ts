import type { ISODate } from "@/lib/dates";
import type {
  CardioEntryRow,
  HabitLogRow,
  ProfileSettingsRow,
  WeeklyGoalRow,
  WeightEntryRow,
  WorkoutEntryRow,
} from "@/types/db";
import type { DayEvaluation, Habit } from "@/types/domain";

/**
 * Índices en memoria de todo el historial de un perfil. Toda la lógica de
 * dominio (rachas, semanas, insights) trabaja contra esta estructura, lo que la
 * hace pura y fácil de testear.
 */
export interface DomainContext {
  today: ISODate;
  settings: Pick<
    ProfileSettingsRow,
    | "weight_unit"
    | "workout_days"
    | "habits_goal_percent"
    | "weight_habits"
    | "weight_workouts"
    | "weight_cardio"
    | "goal"
    | "target_weight"
  >;
  habits: Habit[];
  logs: Map<string, HabitLogRow>;
  weights: WeightEntryRow[];
  weightsByDate: Map<ISODate, WeightEntryRow[]>;
  workoutsByDate: Map<ISODate, WorkoutEntryRow[]>;
  cardioByDate: Map<ISODate, CardioEntryRow[]>;
  goals: WeeklyGoalRow[];
  /** Primer día en el que hay algún hábito activo (inicio del seguimiento). */
  trackingStart: ISODate | null;
  dayCache: Map<ISODate, DayEvaluation>;
}

export interface ContextInput {
  today: ISODate;
  settings: DomainContext["settings"];
  habits: Habit[];
  habitLogs: HabitLogRow[];
  weights: WeightEntryRow[];
  workouts: WorkoutEntryRow[];
  cardio: CardioEntryRow[];
  goals: WeeklyGoalRow[];
}

function groupByDate<T extends { date: string }>(rows: T[]): Map<ISODate, T[]> {
  const map = new Map<ISODate, T[]>();
  for (const row of rows) {
    const list = map.get(row.date);
    if (list) list.push(row);
    else map.set(row.date, [row]);
  }
  return map;
}

export function logKey(habitId: string, date: ISODate): string {
  return `${habitId}|${date}`;
}

export function buildContext(input: ContextInput): DomainContext {
  const logs = new Map<string, HabitLogRow>();
  for (const log of input.habitLogs) logs.set(logKey(log.habit_id, log.date), log);

  const activeHabits = input.habits.filter((h) => h.active);
  const trackingStart = activeHabits.length
    ? activeHabits.map((h) => h.start_date).sort()[0]
    : null;

  const weights = [...input.weights].sort((a, b) =>
    a.date === b.date ? (a.time ?? "").localeCompare(b.time ?? "") : a.date.localeCompare(b.date),
  );

  return {
    today: input.today,
    settings: input.settings,
    habits: [...input.habits].sort((a, b) => a.sort_order - b.sort_order),
    logs,
    weights,
    weightsByDate: groupByDate(weights),
    workoutsByDate: groupByDate(input.workouts),
    cardioByDate: groupByDate(input.cardio),
    goals: [...input.goals].sort((a, b) => a.week_start.localeCompare(b.week_start)),
    trackingStart,
    dayCache: new Map(),
  };
}
