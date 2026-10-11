import "server-only";
import { REST_WORKOUT_TYPE } from "@/lib/constants";
import { db, unwrap } from "@/lib/server/supabase";
import type { EntryCategory, WeightUnit } from "@/types/db";

/**
 * CRUD de registros. TODAS las operaciones filtran por profile_id: aunque
 * alguien manipule un id, nunca puede tocar datos de otro perfil.
 */

type Table = "weight_entries" | "workout_entries" | "cardio_entries" | "notes";

async function insertRow(table: Table, profileId: string, values: Record<string, unknown>) {
  return unwrap(await db().from(table).insert({ ...values, profile_id: profileId }).select("id").single()) as { id: string };
}

async function updateRow(table: Table, profileId: string, id: string, values: Record<string, unknown>) {
  unwrap(await db().from(table).update(values).eq("id", id).eq("profile_id", profileId).select("id").single());
}

export async function deleteRows(table: Table, profileId: string, ids: string[]) {
  if (!ids.length) return;
  unwrap(await db().from(table).delete().in("id", ids).eq("profile_id", profileId));
}

// Peso ----------------------------------------------------------------------

export interface WeightInput {
  date: string;
  time?: string | null;
  weight: number;
  unit: WeightUnit;
  note?: string | null;
}

export const createWeight = (profileId: string, v: WeightInput) =>
  insertRow("weight_entries", profileId, { date: v.date, time: v.time || null, weight: v.weight, unit: v.unit, note: v.note || null });

export const updateWeight = (profileId: string, id: string, v: WeightInput) =>
  updateRow("weight_entries", profileId, id, { date: v.date, time: v.time || null, weight: v.weight, unit: v.unit, note: v.note || null });

// Entrenamiento --------------------------------------------------------------

export interface WorkoutInput {
  date: string;
  workoutType: string;
  durationMin?: number | null;
  note?: string | null;
}

const workoutValues = (v: WorkoutInput) => ({
  date: v.date,
  workout_type: v.workoutType,
  is_rest: v.workoutType === REST_WORKOUT_TYPE,
  duration_min: v.durationMin ?? null,
  note: v.note || null,
});

export const createWorkout = (profileId: string, v: WorkoutInput) => insertRow("workout_entries", profileId, workoutValues(v));
export const updateWorkout = (profileId: string, id: string, v: WorkoutInput) =>
  updateRow("workout_entries", profileId, id, workoutValues(v));

// Cardio --------------------------------------------------------------------

export interface CardioInput {
  date: string;
  cardioType: string;
  minutes: number;
  distanceKm?: number | null;
  note?: string | null;
}

const cardioValues = (v: CardioInput) => ({
  date: v.date,
  cardio_type: v.cardioType,
  minutes: v.minutes,
  distance_km: v.distanceKm ?? null,
  note: v.note || null,
});

export const createCardio = (profileId: string, v: CardioInput) => insertRow("cardio_entries", profileId, cardioValues(v));
export const updateCardio = (profileId: string, id: string, v: CardioInput) =>
  updateRow("cardio_entries", profileId, id, cardioValues(v));

// Notas ---------------------------------------------------------------------

export const createNote = (profileId: string, v: { date: string; body: string }) => insertRow("notes", profileId, v);
export const updateNote = (profileId: string, id: string, v: { date: string; body: string }) =>
  updateRow("notes", profileId, id, v);

// Tipos personalizados -------------------------------------------------------

export async function addEntryType(profileId: string, category: EntryCategory, name: string) {
  unwrap(
    await db()
      .from("entry_types")
      .upsert({ profile_id: profileId, category, name }, { onConflict: "profile_id,category,name", ignoreDuplicates: true }),
  );
}

export async function deleteEntryType(profileId: string, id: string) {
  unwrap(await db().from("entry_types").delete().eq("id", id).eq("profile_id", profileId));
}
