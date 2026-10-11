"use server";

import { z } from "zod";
import { todayInTimeZone } from "@/lib/dates";
import { profileAction } from "@/lib/server/action";
import { habitLogSchema, habitSchema, uuid } from "@/lib/validation";
import {
  createHabit,
  deleteHabit,
  reorderHabits,
  setHabitActive,
  updateHabit,
  upsertHabitLog,
} from "@/services/habits";
import { getSettings } from "@/services/profiles";

export async function saveHabit(input: unknown) {
  return profileAction(habitSchema, input, async (pid, v) => {
    if (v.id) {
      await updateHabit(pid, v.id, v);
      return;
    }
    const settings = await getSettings(pid);
    // Un hábito nuevo empieza a contar hoy: no rompe rachas pasadas.
    await createHabit(pid, { ...v, startDate: todayInTimeZone(settings.timezone) });
  });
}

export async function toggleHabitActive(input: unknown) {
  return profileAction(z.object({ id: uuid, active: z.boolean() }), input, (pid, v) => setHabitActive(pid, v.id, v.active));
}

export async function removeHabit(input: unknown) {
  return profileAction(z.object({ id: uuid }), input, (pid, v) => deleteHabit(pid, v.id));
}

export async function reorderHabitsAction(input: unknown) {
  return profileAction(z.object({ ids: z.array(uuid).max(100) }), input, (pid, v) => reorderHabits(pid, v.ids));
}

export async function logHabit(input: unknown) {
  return profileAction(habitLogSchema, input, (pid, v) => upsertHabitLog(pid, v));
}
