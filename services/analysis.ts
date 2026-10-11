import "server-only";
import { after } from "next/server";
import { cache } from "react";
import { addDays, startOfWeek } from "@/lib/dates";
import { round } from "@/lib/format";
import { buildContext, type DomainContext } from "@/lib/domain/context";
import { evaluateDay } from "@/lib/domain/habits";
import { buildInsights } from "@/lib/domain/insights";
import { computeStreak, computeTimeline, type TimelineDay } from "@/lib/domain/streak";
import { computeWeek, weekStartsSince } from "@/lib/domain/week";
import { weightOverview, weightSeries } from "@/lib/domain/weight";
import { db } from "@/lib/server/supabase";
import type { ProfileSnapshot, WeekMetrics } from "@/types/domain";
import { loadSnapshot } from "./snapshot";

export function contextFromSnapshot(s: ProfileSnapshot): DomainContext {
  return buildContext({
    today: s.today,
    settings: s.settings,
    habits: s.habits,
    habitLogs: s.habitLogs,
    weights: s.weights,
    workouts: s.workouts,
    cardio: s.cardio,
    goals: s.goals,
  });
}

/**
 * Análisis completo de un perfil para una petición: racha, semana actual y
 * anterior, insights y peso. Todo se deriva del historial.
 */
export const analyzeProfile = cache(async (profileId: string) => {
  const snapshot = await loadSnapshot(profileId);
  if (!snapshot) return null;
  const ctx = contextFromSnapshot(snapshot);
  const timeline = computeTimeline(ctx);
  const streak = computeStreak(ctx, timeline);
  const thisWeekStart = startOfWeek(ctx.today);
  const currentWeek = computeWeek(ctx, thisWeekStart, timeline);
  const lastWeek = computeWeek(ctx, addDays(thisWeekStart, -7), timeline);
  const weekBefore = computeWeek(ctx, addDays(thisWeekStart, -14), timeline);
  const series = weightSeries(snapshot.weights, snapshot.settings.weight_unit);
  const weight = weightOverview(series, ctx.today);
  const today = evaluateDay(ctx.today, ctx);
  const insights = buildInsights(ctx, streak);

  scheduleBookkeeping(snapshot, ctx, timeline, streak.current, streak.longest);

  return { snapshot, ctx, timeline, streak, currentWeek, lastWeek, weekBefore, series, weight, today, insights };
});

export type ProfileAnalysis = NonNullable<Awaited<ReturnType<typeof analyzeProfile>>>;

export function allWeeks(analysis: ProfileAnalysis, limit = 52): WeekMetrics[] {
  return weekStartsSince(analysis.ctx, limit).map((w) => computeWeek(analysis.ctx, w, analysis.timeline));
}

/**
 * Tras responder, persiste lo derivado: caché de racha en profile_settings,
 * cierres semanales en weekly_summaries e hitos en streak_events.
 * La fuente de verdad sigue siendo el historial; esto es auditoría/consulta.
 */
function scheduleBookkeeping(
  snapshot: ProfileSnapshot,
  ctx: DomainContext,
  timeline: TimelineDay[],
  current: number,
  longest: number,
) {
  try {
    after(async () => {
      const profileId = snapshot.profile.id;
      const client = db();
      try {
        const s = snapshot.settings;
        if (s.current_streak !== current || s.longest_streak !== longest || s.streak_updated_on !== ctx.today) {
          await client
            .from("profile_settings")
            .update({ current_streak: current, longest_streak: longest, streak_updated_on: ctx.today })
            .eq("profile_id", profileId);
        }

        const stored = new Map(snapshot.storedSummaries.map((r) => [r.week_start, r]));
        const closed = weekStartsSince(ctx, 12)
          .map((w) => computeWeek(ctx, w, timeline))
          .filter((w) => w.isClosed);
        const rows = closed
          .map((w) => ({
            profile_id: profileId,
            week_start: w.weekStart,
            adherence_percent: w.adherence,
            habits_percent: w.habits.percent != null ? Math.round(w.habits.percent) : null,
            workout_count: w.workouts.count,
            workout_target: w.workouts.target,
            cardio_days: w.cardio.days,
            cardio_days_target: w.cardio.daysTarget,
            cardio_minutes: w.cardio.minutes,
            cardio_minutes_target: w.cardio.minutesTarget,
            avg_weight: w.avgWeight != null ? round(w.avgWeight, 2) : null,
            weight_unit: s.weight_unit,
            completed_days: w.completedDays,
            streak_at_end: w.streakAtEnd,
          }))
          .filter((row) => {
            const prev = stored.get(row.week_start);
            return (
              !prev ||
              prev.adherence_percent !== row.adherence_percent ||
              prev.workout_count !== row.workout_count ||
              prev.cardio_minutes !== row.cardio_minutes ||
              prev.streak_at_end !== row.streak_at_end
            );
          });
        if (rows.length) await client.from("weekly_summaries").upsert(rows, { onConflict: "profile_id,week_start" });

        const events: { profile_id: string; date: string; kind: string; value: number }[] = [];
        const todayEntry = timeline.at(-1);
        if (todayEntry?.status === "completed") {
          events.push({ profile_id: profileId, date: ctx.today, kind: "perfect_day", value: 0 });
          if ([7, 14, 30, 60, 100, 150, 200, 365].includes(current)) {
            events.push({ profile_id: profileId, date: ctx.today, kind: "milestone", value: current });
          }
        }
        if (events.length) {
          await client
            .from("streak_events")
            .upsert(events, { onConflict: "profile_id,kind,date,value", ignoreDuplicates: true });
        }
      } catch (error) {
        console.error("[bookkeeping]", error);
      }
    });
  } catch {
    // `after` no disponible fuera de una petición (p. ej. tests): se omite.
  }
}
