import "server-only";
import { DEFAULT_CARDIO_TYPES, DEFAULT_WORKOUT_TYPES } from "@/lib/constants";
import { convertWeight } from "@/lib/format";
import type { AppProfile } from "@/features/app/ProfileContext";
import type { ProfileAnalysis } from "./analysis";
import type { PublicProfile } from "@/types/db";

/** Datos mínimos que necesita el cliente en todas las pantallas. */
export function buildAppProfile(analysis: ProfileAnalysis, profiles: PublicProfile[]): AppProfile {
  const s = analysis.snapshot;
  const custom = s.entryTypes;
  const used = <T extends { date: string }>(rows: T[], pick: (r: T) => string) =>
    [...rows].sort((a, b) => b.date.localeCompare(a.date)).map(pick);

  const workoutUsed = used(s.workouts.filter((w) => !w.is_rest), (w) => w.workout_type);
  const cardioUsed = used(s.cardio, (c) => c.cardio_type);
  const unique = (list: string[]) => [...new Set(list)];

  const lastWeightRow = s.weights.at(-1);
  return {
    profile: s.profile,
    profiles,
    today: s.today,
    timezone: s.settings.timezone,
    weightUnit: s.settings.weight_unit,
    workoutTypes: unique([...DEFAULT_WORKOUT_TYPES, ...custom.filter((t) => t.category === "workout").map((t) => t.name), ...workoutUsed]),
    cardioTypes: unique([...DEFAULT_CARDIO_TYPES, ...custom.filter((t) => t.category === "cardio").map((t) => t.name), ...cardioUsed]),
    customTypes: custom.map((t) => ({ id: t.id, category: t.category, name: t.name })),
    habits: analysis.snapshot.habits
      .filter((h) => h.active)
      .map((h) => {
        const r = analysis.today.habits.find((x) => x.habit.id === h.id);
        return {
          id: h.id,
          name: h.name,
          icon: h.icon,
          kind: h.kind,
          target: r?.target ?? null,
          unit: r?.unit ?? null,
          value: r?.value ?? null,
          done: r?.status === "completed",
          scheduledToday: Boolean(r),
        };
      }),
    lastWeight: lastWeightRow
      ? Math.round(convertWeight(Number(lastWeightRow.weight), lastWeightRow.unit, s.settings.weight_unit) * 10) / 10
      : null,
    lastWorkoutType: workoutUsed[0] ?? null,
    lastCardioType: cardioUsed[0] ?? null,
  };
}
