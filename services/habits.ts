import "server-only";
import { db, unwrap } from "@/lib/server/supabase";
import type { HabitKind, HabitLogStatus } from "@/types/db";

export interface HabitInput {
  name: string;
  icon: string;
  kind: HabitKind;
  required: boolean;
  active: boolean;
  weekdays: number[];
  targetValue?: number | null;
  unit?: string | null;
  startDate?: string;
}

async function replaceSchedules(profileId: string, habitId: string, input: HabitInput) {
  unwrap(await db().from("habit_schedules").delete().eq("habit_id", habitId).eq("profile_id", profileId));
  if (!input.weekdays.length) return;
  unwrap(
    await db()
      .from("habit_schedules")
      .insert(
        input.weekdays.map((weekday) => ({
          habit_id: habitId,
          profile_id: profileId,
          weekday,
          target_value: input.targetValue ?? null,
          unit: input.unit || null,
        })),
      ),
  );
}

export async function createHabit(profileId: string, input: HabitInput) {
  const { count } = await db().from("habits").select("id", { count: "exact", head: true }).eq("profile_id", profileId);
  const row = unwrap(
    await db()
      .from("habits")
      .insert({
        profile_id: profileId,
        name: input.name,
        icon: input.icon,
        kind: input.kind,
        required: input.required,
        active: input.active,
        sort_order: count ?? 0,
        ...(input.startDate ? { start_date: input.startDate } : {}),
      })
      .select("id")
      .single(),
  ) as { id: string };
  await replaceSchedules(profileId, row.id, input);
  return row;
}

export async function updateHabit(profileId: string, habitId: string, input: HabitInput) {
  unwrap(
    await db()
      .from("habits")
      .update({
        name: input.name,
        icon: input.icon,
        kind: input.kind,
        required: input.required,
        active: input.active,
      })
      .eq("id", habitId)
      .eq("profile_id", profileId)
      .select("id")
      .single(),
  );
  await replaceSchedules(profileId, habitId, input);
}

export async function setHabitActive(profileId: string, habitId: string, active: boolean) {
  unwrap(await db().from("habits").update({ active }).eq("id", habitId).eq("profile_id", profileId).select("id").single());
}

export async function deleteHabit(profileId: string, habitId: string) {
  unwrap(await db().from("habits").delete().eq("id", habitId).eq("profile_id", profileId));
}

export async function reorderHabits(profileId: string, ids: string[]) {
  await Promise.all(
    ids.map((id, index) =>
      db().from("habits").update({ sort_order: index }).eq("id", id).eq("profile_id", profileId),
    ),
  );
}

/** Mantiene sincronizados los días del hábito de entreno con los ajustes. */
export async function syncWorkoutHabitDays(profileId: string, weekdays: number[]) {
  const habits = unwrap(
    await db().from("habits").select("id").eq("profile_id", profileId).eq("kind", "workout"),
  ) as { id: string }[];
  for (const h of habits) {
    unwrap(await db().from("habit_schedules").delete().eq("habit_id", h.id).eq("profile_id", profileId));
    if (weekdays.length) {
      unwrap(
        await db()
          .from("habit_schedules")
          .insert(weekdays.map((weekday) => ({ habit_id: h.id, profile_id: profileId, weekday }))),
      );
    }
  }
}

export interface HabitLogInput {
  habitId: string;
  date: string;
  value?: number | null;
  status: HabitLogStatus | "clear";
  note?: string | null;
}

export async function upsertHabitLog(profileId: string, input: HabitLogInput) {
  // Comprobar que el hábito pertenece al perfil.
  const habit = unwrap(
    await db().from("habits").select("id").eq("id", input.habitId).eq("profile_id", profileId).maybeSingle(),
  );
  if (!habit) throw new Error("Hábito no encontrado");

  if (input.status === "clear") {
    unwrap(
      await db().from("habit_logs").delete().eq("habit_id", input.habitId).eq("date", input.date).eq("profile_id", profileId),
    );
    return;
  }
  unwrap(
    await db()
      .from("habit_logs")
      .upsert(
        {
          profile_id: profileId,
          habit_id: input.habitId,
          date: input.date,
          value: input.value ?? null,
          status: input.status,
          completed: input.status === "completed",
          note: input.note ?? null,
        },
        { onConflict: "habit_id,date" },
      ),
  );
}
