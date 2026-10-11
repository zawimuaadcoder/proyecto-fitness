"use server";

import { z } from "zod";
import { profileAction } from "@/lib/server/action";
import { cardioSchema, noteSchema, uuid, weightSchema, workoutSchema } from "@/lib/validation";
import {
  addEntryType,
  createCardio,
  createNote,
  createWeight,
  createWorkout,
  deleteEntryType,
  deleteRows,
  updateCardio,
  updateNote,
  updateWeight,
  updateWorkout,
} from "@/services/entries";

export async function saveWeight(input: unknown) {
  return profileAction(weightSchema, input, async (pid, v) => {
    if (v.id) await updateWeight(pid, v.id, v);
    else await createWeight(pid, v);
  });
}

export async function saveWorkout(input: unknown) {
  return profileAction(workoutSchema, input, async (pid, v) => {
    if (v.id) await updateWorkout(pid, v.id, v);
    else await createWorkout(pid, v);
  });
}

export async function saveCardio(input: unknown) {
  return profileAction(cardioSchema, input, async (pid, v) => {
    if (v.id) await updateCardio(pid, v.id, v);
    else await createCardio(pid, v);
  });
}

export async function saveNote(input: unknown) {
  return profileAction(noteSchema, input, async (pid, v) => {
    if (v.id) await updateNote(pid, v.id, v);
    else await createNote(pid, v);
  });
}

const deleteSchema = z.object({
  table: z.enum(["weight_entries", "workout_entries", "cardio_entries", "notes"]),
  ids: z.array(uuid).min(1).max(500),
});

export async function deleteEntries(input: unknown) {
  return profileAction(deleteSchema, input, (pid, v) => deleteRows(v.table, pid, v.ids));
}

const typeSchema = z.object({
  category: z.enum(["workout", "cardio"]),
  name: z.string().trim().min(1, "Escribe un nombre").max(40),
});

export async function addCustomType(input: unknown) {
  return profileAction(typeSchema, input, (pid, v) => addEntryType(pid, v.category, v.name));
}

export async function removeCustomType(input: unknown) {
  return profileAction(z.object({ id: uuid }), input, (pid, v) => deleteEntryType(pid, v.id));
}
