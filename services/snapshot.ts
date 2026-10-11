import "server-only";
import { cache } from "react";
import { todayInTimeZone } from "@/lib/dates";
import { db, fetchAll, unwrap } from "@/lib/server/supabase";
import type {
  CardioEntryRow,
  EntryTypeRow,
  HabitLogRow,
  HabitRow,
  HabitScheduleRow,
  NoteRow,
  StreakEventRow,
  WeeklyGoalRow,
  WeeklySummaryRow,
  WeightEntryRow,
  WorkoutEntryRow,
} from "@/types/db";
import type { Habit, ProfileSnapshot } from "@/types/domain";
import { getProfile, getSettings } from "./profiles";

const num = (v: unknown) => (v == null ? null : Number(v));

/**
 * Carga todo el historial de un perfil (paginado). Para un grupo pequeño es
 * ligero y permite calcular rachas y semanas desde la fuente de verdad.
 * `cache` lo deduplica dentro de una misma petición.
 */
export const loadSnapshot = cache(async (profileId: string): Promise<ProfileSnapshot | null> => {
  const profile = await getProfile(profileId);
  if (!profile) return null;
  const settings = await getSettings(profileId);
  const client = db();
  const byProfile = <T,>(table: string, order = "date") =>
    fetchAll<T>((from, to) =>
      client.from(table).select("*").eq("profile_id", profileId).order(order, { ascending: true }).range(from, to),
    );

  const [habitsRaw, schedules, habitLogs, weights, workouts, cardio, notes, goals, entryTypes, streakEvents, summaries] =
    await Promise.all([
      byProfile<HabitRow>("habits", "sort_order"),
      byProfile<HabitScheduleRow>("habit_schedules", "weekday"),
      byProfile<HabitLogRow>("habit_logs"),
      byProfile<WeightEntryRow>("weight_entries"),
      byProfile<WorkoutEntryRow>("workout_entries"),
      byProfile<CardioEntryRow>("cardio_entries"),
      byProfile<NoteRow>("notes"),
      byProfile<WeeklyGoalRow>("weekly_goals", "week_start"),
      byProfile<EntryTypeRow>("entry_types", "name"),
      byProfile<StreakEventRow>("streak_events"),
      byProfile<WeeklySummaryRow>("weekly_summaries", "week_start"),
    ]);

  const habits: Habit[] = habitsRaw.map((h) => ({
    ...h,
    schedules: schedules
      .filter((s) => s.habit_id === h.id)
      .map((s) => ({ ...s, target_value: num(s.target_value) })),
  }));

  return {
    profile,
    settings,
    habits,
    habitLogs: habitLogs.map((l) => ({ ...l, value: num(l.value) })),
    weights: weights.map((w) => ({ ...w, weight: Number(w.weight) })),
    workouts,
    cardio: cardio.map((c) => ({ ...c, distance_km: num(c.distance_km) })),
    notes: notes.reverse(),
    goals,
    entryTypes,
    streakEvents,
    storedSummaries: summaries,
    today: todayInTimeZone(settings.timezone),
  };
});

export async function countProfileData(profileId: string): Promise<number> {
  const tables = ["habits", "weight_entries", "workout_entries", "cardio_entries"];
  const counts = await Promise.all(
    tables.map(async (t) => {
      const res = await db().from(t).select("id", { count: "exact", head: true }).eq("profile_id", profileId);
      unwrap(res);
      return res.count ?? 0;
    }),
  );
  return counts.reduce((a, b) => a + b, 0);
}
