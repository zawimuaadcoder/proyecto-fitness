import "server-only";
import { addDays, dateRange, maxDate } from "@/lib/dates";
import { convertWeight, round } from "@/lib/format";
import { evaluateDay } from "@/lib/domain/habits";
import type { HabitDayRow, WeightHistoryRow } from "@/features/history/HistoryTables";
import type { ProfileAnalysis } from "./analysis";

export function buildWeightHistory(a: ProfileAnalysis): WeightHistoryRow[] {
  const unit = a.snapshot.settings.weight_unit;
  const avgByDate = new Map(a.series.map((p) => [p.date, p.avg7]));
  const rows = [...a.snapshot.weights].sort((x, y) => (x.date + (x.time ?? "")).localeCompare(y.date + (y.time ?? "")));
  let prev: number | null = null;
  return rows
    .map((w) => {
      const display = convertWeight(Number(w.weight), w.unit, unit);
      const change: number | null = prev != null ? round(display - prev, 1) : null;
      prev = display;
      return { ...w, display, avg7: avgByDate.get(w.date) ?? null, change };
    })
    .reverse();
}

export function buildHabitDays(a: ProfileAnalysis, days = 120): HabitDayRow[] {
  const start = a.ctx.trackingStart;
  if (!start) return [];
  const from = maxDate(start, addDays(a.ctx.today, -(days - 1)));
  return dateRange(from, a.ctx.today)
    .map((date) => {
      const day = evaluateDay(date, a.ctx);
      const req = day.habits.filter((h) => h.habit.required && h.status !== "rest");
      return {
        date,
        status: day.status,
        done: req.filter((h) => h.status === "completed").length,
        total: req.length,
        pending: req.filter((h) => h.status !== "completed").map((h) => h.habit.name),
      };
    })
    .reverse();
}
