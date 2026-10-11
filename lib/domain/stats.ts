import { dateRange, minDate, type ISODate } from "@/lib/dates";
import { convertWeight } from "@/lib/format";
import type { DomainContext } from "./context";
import { ACTIVITY_LINKED_KINDS, evaluateDay } from "./habits";

export interface RangeStats {
  from: ISODate;
  to: ISODate;
  workouts: number;
  workoutTypes: string[];
  cardioMinutes: number;
  cardioDays: number;
  cardioDaily: number[];
  habitsDone: number;
  habitsTotal: number;
  habitsPercent: number | null;
  avgWeight: number | null;
  weightCount: number;
  completedDays: number;
}

/**
 * Estadísticas de acciones controlables en un rango [from, to] (incluido).
 * Los días futuros se ignoran. Para "hoy", un hábito solo cuenta en el
 * denominador si ya está completado (el día aún no ha terminado).
 */
export function rangeStats(ctx: DomainContext, from: ISODate, to: ISODate): RangeStats {
  const days = dateRange(from, to);
  const effectiveTo = minDate(to, ctx.today);
  let workouts = 0;
  const workoutTypes: string[] = [];
  let cardioMinutes = 0;
  let cardioDays = 0;
  let habitsDone = 0;
  let habitsTotal = 0;
  let completedDays = 0;
  const weightValues: number[] = [];
  const cardioDaily: number[] = [];

  for (const date of days) {
    const inPast = date <= effectiveTo;

    const sessions = (ctx.workoutsByDate.get(date) ?? []).filter((w) => !w.is_rest);
    if (inPast) {
      workouts += sessions.length;
      for (const s of sessions) workoutTypes.push(s.workout_type);
    }

    const minutes = inPast ? (ctx.cardioByDate.get(date) ?? []).reduce((s, c) => s + c.minutes, 0) : 0;
    cardioDaily.push(minutes);
    cardioMinutes += minutes;
    if (minutes > 0) cardioDays += 1;

    if (inPast) {
      for (const w of ctx.weightsByDate.get(date) ?? []) {
        weightValues.push(convertWeight(Number(w.weight), w.unit, ctx.settings.weight_unit));
      }
    }

    if (!inPast) continue;
    const day = evaluateDay(date, ctx);
    if (day.status === "completed") completedDays += 1;
    if (day.status === "none") continue;
    for (const r of day.habits) {
      if (!r.habit.required || r.status === "rest") continue;
      if (ACTIVITY_LINKED_KINDS.includes(r.habit.kind)) continue;
      const done = r.status === "completed";
      if (date === ctx.today && !done) continue;
      habitsTotal += 1;
      if (done) habitsDone += 1;
    }
  }

  return {
    from,
    to,
    workouts,
    workoutTypes,
    cardioMinutes,
    cardioDays,
    cardioDaily,
    habitsDone,
    habitsTotal,
    habitsPercent: habitsTotal ? (habitsDone / habitsTotal) * 100 : null,
    avgWeight: weightValues.length ? weightValues.reduce((a, b) => a + b, 0) / weightValues.length : null,
    weightCount: weightValues.length,
    completedDays,
  };
}
