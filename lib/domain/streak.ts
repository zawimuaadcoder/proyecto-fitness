import { STREAK_MILESTONES } from "@/lib/constants";
import { addDays, dateRange, startOfWeek, weekDays, type ISODate } from "@/lib/dates";
import type { DayStatus, StreakSummary } from "@/types/domain";
import type { DomainContext } from "./context";
import { evaluateDay } from "./habits";

export interface TimelineDay {
  date: ISODate;
  status: DayStatus;
  /** Racha acumulada al final de ese día. */
  run: number;
}

/**
 * Reconstruye la racha a partir del historial completo (fuente de verdad).
 * - completed → suma 1
 * - rest      → no rompe ni suma (descanso planificado / nada obligatorio)
 * - failed    → reinicia a 0
 * - pending   → (solo hoy) no rompe todavía
 */
export function computeTimeline(ctx: DomainContext): TimelineDay[] {
  if (!ctx.trackingStart || ctx.trackingStart > ctx.today) return [];
  let run = 0;
  return dateRange(ctx.trackingStart, ctx.today).map((date) => {
    const { status } = evaluateDay(date, ctx);
    if (status === "completed") run += 1;
    else if (status === "failed") run = 0;
    return { date, status, run };
  });
}

export function nextMilestone(value: number): number | null {
  return STREAK_MILESTONES.find((m) => m > value) ?? null;
}

export function computeStreak(ctx: DomainContext, timeline = computeTimeline(ctx)): StreakSummary {
  const todayEntry = timeline.at(-1);
  const today = todayEntry && todayEntry.date === ctx.today ? todayEntry : null;
  const beforeToday = timeline.length >= 2 ? timeline[timeline.length - 2].run : 0;

  let longestBeforeToday = 0;
  for (const day of timeline.slice(0, -1)) longestBeforeToday = Math.max(longestBeforeToday, day.run);

  // Mejor racha de las rachas anteriores a la actual (hasta el último fallo).
  let lastFailed = -1;
  timeline.forEach((d, i) => {
    if (d.status === "failed") lastFailed = i;
  });
  let previousBest = 0;
  for (const day of timeline.slice(0, lastFailed + 1)) previousBest = Math.max(previousBest, day.run);

  const current = today ? today.run : 0;
  const longest = Math.max(longestBeforeToday, current);
  const todayStatus: DayStatus = today?.status ?? "none";
  const completedToday = todayStatus === "completed";

  const byDate = new Map(timeline.map((d) => [d.date, d.status]));
  const last7 = weekDays(startOfWeek(ctx.today)).map((date) => ({
    date,
    status: byDate.get(date) ?? ("none" as DayStatus),
  }));

  return {
    current,
    longest,
    today: todayStatus,
    beforeToday,
    last7,
    nextMilestone: nextMilestone(current),
    milestone: completedToday && (STREAK_MILESTONES as readonly number[]).includes(current) ? current : null,
    // Solo el día exacto en el que se supera la mejor racha anterior.
    isRecord: completedToday && previousBest > 0 && current === previousBest + 1,
  };
}

/** Racha vigente al final de una fecha concreta (para cierres semanales). */
export function streakAt(timeline: TimelineDay[], date: ISODate): number {
  let value = 0;
  for (const day of timeline) {
    if (day.date > date) break;
    value = day.run;
  }
  return value;
}

/** Últimos N días (incluye hoy) con su estado; útil para heatmaps. */
export function recentDays(timeline: TimelineDay[], today: ISODate, n: number) {
  const byDate = new Map(timeline.map((d) => [d.date, d]));
  return dateRange(addDays(today, -(n - 1)), today).map(
    (date) => byDate.get(date) ?? { date, status: "none" as DayStatus, run: 0 },
  );
}
