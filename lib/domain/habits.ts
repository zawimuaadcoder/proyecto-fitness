import { isoWeekday, type ISODate } from "@/lib/dates";
import { convertWeight, formatNumber, formatWeight } from "@/lib/format";
import type { HabitKind } from "@/types/db";
import type { DayEvaluation, DayStatus, Habit, HabitDayResult, HabitDetail, HabitStatus } from "@/types/domain";
import { logKey, type DomainContext } from "./context";

export const DEFAULT_TARGETS: Record<HabitKind, { value: number | null; unit: string | null }> = {
  check: { value: null, unit: null },
  quantity: { value: 1, unit: null },
  weight: { value: null, unit: null },
  workout: { value: null, unit: null },
  cardio: { value: 30, unit: "min" },
};

/** Hábitos que alimentan el componente de entreno/cardio del cumplimiento semanal. */
export const ACTIVITY_LINKED_KINDS: HabitKind[] = ["workout", "cardio"];

export function scheduleFor(habit: Habit, date: ISODate) {
  const weekday = isoWeekday(date);
  return habit.schedules.find((s) => s.weekday === weekday) ?? null;
}

export function isScheduled(habit: Habit, date: ISODate): boolean {
  return habit.active && date >= habit.start_date && scheduleFor(habit, date) !== null;
}

function fmtQty(value: number): string {
  return formatNumber(value, 2);
}

export function evaluateHabit(habit: Habit, date: ISODate, ctx: DomainContext): HabitDayResult {
  const schedule = scheduleFor(habit, date);
  const scheduled = isScheduled(habit, date);
  const defaults = DEFAULT_TARGETS[habit.kind];
  const target = schedule?.target_value ?? defaults.value;
  const unit = schedule?.unit ?? defaults.unit;
  const log = ctx.logs.get(logKey(habit.id, date)) ?? null;
  const details: HabitDetail[] = [];

  let status: HabitStatus = "pending";
  let value: number | null = null;
  let display: string | null = null;
  let progress = 0;

  switch (habit.kind) {
    case "weight": {
      const entries = ctx.weightsByDate.get(date) ?? [];
      if (entries.length) {
        const last = entries[entries.length - 1];
        value = convertWeight(Number(last.weight), last.unit, ctx.settings.weight_unit);
        display = formatWeight(value, ctx.settings.weight_unit);
        status = "completed";
        progress = 1;
        for (const e of entries) {
          details.push({
            label: e.time ? e.time.slice(0, 5) : "Registro",
            value: formatWeight(convertWeight(Number(e.weight), e.unit, ctx.settings.weight_unit), ctx.settings.weight_unit),
          });
        }
      }
      break;
    }
    case "workout": {
      const entries = ctx.workoutsByDate.get(date) ?? [];
      const sessions = entries.filter((e) => !e.is_rest);
      for (const e of entries) {
        details.push({ label: e.workout_type, value: e.duration_min ? `${e.duration_min} min` : e.is_rest ? "Planificado" : "Hecho" });
      }
      if (sessions.length) {
        status = "completed";
        progress = 1;
        value = sessions.length;
        display = sessions.map((s) => s.workout_type).join(" + ");
      } else if (entries.some((e) => e.is_rest)) {
        status = "rest";
        progress = 1;
        display = "Descanso";
      }
      break;
    }
    case "cardio": {
      const entries = ctx.cardioByDate.get(date) ?? [];
      const minutes = entries.reduce((sum, e) => sum + e.minutes, 0);
      const goal = target ?? 30;
      value = minutes;
      progress = goal > 0 ? Math.min(1, minutes / goal) : minutes > 0 ? 1 : 0;
      display = `${minutes} / ${goal} min`;
      for (const e of entries) details.push({ label: e.cardio_type, value: `${e.minutes} min` });
      if (minutes > 0 && minutes < goal) details.push({ label: "Restante", value: `${goal - minutes} min` });
      if (minutes >= goal && (minutes > 0 || goal === 0)) status = "completed";
      else if (minutes > 0) status = "in_progress";
      break;
    }
    case "quantity": {
      const goal = target ?? 1;
      const v = log?.value != null ? Number(log.value) : 0;
      value = v;
      progress = goal > 0 ? Math.min(1, v / goal) : 0;
      display = `${fmtQty(v)} / ${fmtQty(goal)}${unit ? ` ${unit}` : ""}`;
      if (log?.completed || (goal > 0 && v >= goal)) {
        status = "completed";
        progress = 1;
      } else if (v > 0) status = "in_progress";
      break;
    }
    case "check": {
      if (log?.completed) {
        status = "completed";
        progress = 1;
      }
      break;
    }
  }

  if (status !== "completed" && status !== "rest" && log?.status === "skipped") status = "skipped";
  if (log?.note) details.push({ label: "Nota", value: log.note });

  if (scheduled && date < ctx.today && (status === "pending" || status === "in_progress")) {
    status = "missed";
  }

  return { habit, date, scheduled, status, value, target, unit, display, progress, details, log };
}

/** ¿Este resultado cuenta como obligatorio para la racha de ese día? */
export function countsForStreak(result: HabitDayResult): boolean {
  return result.scheduled && result.habit.required && result.status !== "rest";
}

export function evaluateDay(date: ISODate, ctx: DomainContext): DayEvaluation {
  const cached = ctx.dayCache.get(date);
  if (cached) return cached;

  const habits = ctx.habits
    .filter((h) => h.active)
    .map((h) => evaluateHabit(h, date, ctx))
    .filter((r) => r.scheduled);

  const required = habits.filter(countsForStreak);
  const requiredDone = required.filter((r) => r.status === "completed").length;

  let status: DayStatus;
  if (!ctx.trackingStart || date < ctx.trackingStart || date > ctx.today) status = "none";
  else if (required.length === 0) status = "rest";
  else if (requiredDone === required.length) status = "completed";
  else status = date < ctx.today ? "failed" : "pending";

  const evaluation: DayEvaluation = {
    date,
    status,
    requiredTotal: required.length,
    requiredDone,
    habits,
  };
  ctx.dayCache.set(date, evaluation);
  return evaluation;
}
