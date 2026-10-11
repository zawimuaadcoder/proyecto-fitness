import { addDays, diffDays, startOfWeek, weekDays, type ISODate } from "@/lib/dates";
import type { WeeklyGoalRow } from "@/types/db";
import type { AdherenceWeights, WeekGoals, WeekMetrics, WeekObjective } from "@/types/domain";
import type { DomainContext } from "./context";
import { evaluateDay } from "./habits";
import { rangeStats } from "./stats";
import { streakAt, type TimelineDay } from "./streak";

export function defaultGoals(workoutDays: number[]): WeekGoals {
  return {
    workoutTarget: workoutDays.length,
    cardioMode: "both",
    cardioDaysTarget: 3,
    cardioMinutesTarget: 150,
  };
}

export function goalRowToGoals(row: WeeklyGoalRow): WeekGoals {
  return {
    workoutTarget: row.workout_sessions_target,
    cardioMode: row.cardio_mode,
    cardioDaysTarget: row.cardio_days_target,
    cardioMinutesTarget: row.cardio_minutes_target,
  };
}

/** Meta vigente para una semana: la última fila con week_start <= semana. */
export function goalsForWeek(ctx: DomainContext, weekStart: ISODate): WeekGoals {
  let match: WeeklyGoalRow | null = null;
  for (const g of ctx.goals) {
    if (g.week_start <= weekStart) match = g;
  }
  // Si la semana es anterior a cualquier meta, usamos la primera conocida.
  match ??= ctx.goals[0] ?? null;
  return match ? goalRowToGoals(match) : defaultGoals(ctx.settings.workout_days);
}

export function adherenceWeights(ctx: DomainContext): AdherenceWeights {
  return {
    habits: ctx.settings.weight_habits,
    workouts: ctx.settings.weight_workouts,
    cardio: ctx.settings.weight_cardio,
  };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

interface AdherenceInput {
  habitsPercent: number | null;
  workouts: number;
  cardioDays: number;
  cardioMinutes: number;
  goals: WeekGoals;
  weights: AdherenceWeights;
}

/**
 * Cumplimiento semanal (0–100). El peso NO participa: es un resultado, no una
 * acción controlable.
 *
 *   cumplimiento = Σ(ratio_i · peso_i) / Σ(peso_i)
 *
 *   hábitos  → % de hábitos obligatorios cumplidos (sin entreno/cardio vinculados)
 *   entrenos → min(1, sesiones / objetivo)
 *   cardio   → según modo: días, minutos o la media de ambos (cada uno topado a 1)
 *
 * Los componentes sin objetivo (o sin hábitos programados) se excluyen y los
 * pesos se renormalizan. Ningún ratio supera 1, así que el total nunca pasa de 100.
 */
export function computeAdherence(input: AdherenceInput) {
  const { goals, weights } = input;
  const components: WeekMetrics["components"] = [];

  if (input.habitsPercent != null && weights.habits > 0) {
    components.push({ key: "habits", label: "Hábitos", ratio: clamp01(input.habitsPercent / 100), weight: weights.habits });
  }
  if (goals.workoutTarget > 0 && weights.workouts > 0) {
    components.push({
      key: "workouts",
      label: "Entrenos",
      ratio: clamp01(input.workouts / goals.workoutTarget),
      weight: weights.workouts,
    });
  }
  if (weights.cardio > 0) {
    const parts: number[] = [];
    if (goals.cardioMode !== "minutes" && goals.cardioDaysTarget > 0) {
      parts.push(clamp01(input.cardioDays / goals.cardioDaysTarget));
    }
    if (goals.cardioMode !== "days" && goals.cardioMinutesTarget > 0) {
      parts.push(clamp01(input.cardioMinutes / goals.cardioMinutesTarget));
    }
    if (parts.length) {
      components.push({
        key: "cardio",
        label: "Cardio",
        ratio: parts.reduce((a, b) => a + b, 0) / parts.length,
        weight: weights.cardio,
      });
    }
  }

  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const adherence = totalWeight
    ? Math.min(100, Math.round((components.reduce((s, c) => s + c.ratio * c.weight, 0) / totalWeight) * 100))
    : 0;
  return { adherence, components };
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export function computeWeek(ctx: DomainContext, weekStartInput: ISODate, timeline?: TimelineDay[]): WeekMetrics {
  const weekStart = startOfWeek(weekStartInput);
  const weekEnd = addDays(weekStart, 6);
  const isCurrent = weekStart === startOfWeek(ctx.today);
  const isClosed = weekEnd < ctx.today;
  const elapsedDays = isClosed ? 7 : Math.max(0, Math.min(7, diffDays(ctx.today, weekStart) + 1));
  const goals = goalsForWeek(ctx, weekStart);
  const stats = rangeStats(ctx, weekStart, weekEnd);

  const { adherence, components } = computeAdherence({
    habitsPercent: stats.habitsPercent,
    workouts: stats.workouts,
    cardioDays: stats.cardioDays,
    cardioMinutes: stats.cardioMinutes,
    goals,
    weights: adherenceWeights(ctx),
  });

  const verb = isClosed ? "Te faltaron" : "Te faltan";
  const objectives: WeekObjective[] = [];
  if (stats.habitsPercent != null) {
    const goal = ctx.settings.habits_goal_percent;
    const met = Math.round(stats.habitsPercent) >= goal;
    objectives.push({
      key: "habits",
      label: "Hábitos",
      met,
      missing: met ? null : `Hábitos al ${Math.round(stats.habitsPercent)}% (objetivo ${goal}%).`,
    });
  }
  if (goals.workoutTarget > 0) {
    const left = goals.workoutTarget - stats.workouts;
    objectives.push({
      key: "workouts",
      label: "Entrenos",
      met: left <= 0,
      missing: left > 0 ? `${verb} ${plural(left, "entreno", "entrenos")}.` : null,
    });
  }
  if (goals.cardioMode !== "minutes" && goals.cardioDaysTarget > 0) {
    const left = goals.cardioDaysTarget - stats.cardioDays;
    objectives.push({
      key: "cardio_days",
      label: "Días de cardio",
      met: left <= 0,
      missing: left > 0 ? `${verb} ${plural(left, "día", "días")} de cardio.` : null,
    });
  }
  if (goals.cardioMode !== "days" && goals.cardioMinutesTarget > 0) {
    const left = goals.cardioMinutesTarget - stats.cardioMinutes;
    objectives.push({
      key: "cardio_minutes",
      label: "Minutos de cardio",
      met: left <= 0,
      missing: left > 0 ? `${verb} ${plural(left, "minuto", "minutos")} de cardio.` : null,
    });
  }

  const dayStatuses = weekDays(weekStart).map((date) => ({ date, status: evaluateDay(date, ctx).status }));

  return {
    weekStart,
    weekEnd,
    isCurrent,
    isClosed,
    elapsedDays,
    goals,
    habits: { done: stats.habitsDone, total: stats.habitsTotal, percent: stats.habitsPercent },
    workouts: { count: stats.workouts, target: goals.workoutTarget, types: stats.workoutTypes },
    cardio: {
      days: stats.cardioDays,
      daysTarget: goals.cardioDaysTarget,
      minutes: stats.cardioMinutes,
      minutesTarget: goals.cardioMinutesTarget,
      mode: goals.cardioMode,
      dailyMinutes: stats.cardioDaily,
    },
    avgWeight: stats.avgWeight,
    adherence,
    components,
    objectives,
    completedDays: stats.completedDays,
    dayStatuses,
    streakAtEnd: timeline ? streakAt(timeline, weekEnd < ctx.today ? weekEnd : ctx.today) : 0,
  };
}

/** Semanas desde el inicio del seguimiento hasta la actual (más reciente primero). */
export function weekStartsSince(ctx: DomainContext, limit = 52): ISODate[] {
  const first = [
    ctx.trackingStart,
    ctx.weights[0]?.date,
    [...ctx.workoutsByDate.keys()].sort()[0],
    [...ctx.cardioByDate.keys()].sort()[0],
  ]
    .filter((d): d is string => Boolean(d))
    .sort()[0];
  const current = startOfWeek(ctx.today);
  if (!first) return [current];
  const out: ISODate[] = [];
  for (let w = current; w >= startOfWeek(first) && out.length < limit; w = addDays(w, -7)) out.push(w);
  return out;
}
