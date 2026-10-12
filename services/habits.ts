import "server-only";
import { UserFacingError } from "@/lib/server/action";
import { GROUP_HABIT_WEEKDAYS, GROUP_HABITS } from "@/lib/domain/group-habits";
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

/** Los hábitos de grupo están bloqueados: nadie puede editarlos ni quitarlos. */
async function assertNotGroupHabit(profileId: string, habitId: string) {
  const row = unwrap(
    await db().from("habits").select("group_key").eq("id", habitId).eq("profile_id", profileId).maybeSingle(),
  ) as { group_key: string | null } | null;
  if (row?.group_key) throw new UserFacingError("Los hábitos del grupo no se pueden modificar");
}

/**
 * Da de alta los hábitos de grupo que le falten al perfil (idempotente). Van
 * los primeros, en su orden, y empiezan a contar `startDate` (no rompen rachas
 * pasadas). Si el perfil ya tiene un hábito de entreno propio, se convierte en
 * «Entrenar» en lugar de duplicarlo.
 */
export async function ensureGroupHabits(profileId: string, startDate: string) {
  const existing = unwrap(
    await db().from("habits").select("id, kind, group_key, start_date").eq("profile_id", profileId).order("sort_order"),
  ) as { id: string; kind: string; group_key: string | null; start_date: string }[];
  const missing = GROUP_HABITS.filter((g) => !existing.some((h) => h.group_key === g.key));
  if (!missing.length) return;

  for (const g of missing) {
    const adopt = g.kind === "workout" ? existing.find((h) => h.kind === "workout" && !h.group_key) : undefined;
    // Orden negativo: van los primeros (en el orden de GROUP_HABITS) sin renumerar el resto.
    const sort_order = GROUP_HABITS.indexOf(g) - GROUP_HABITS.length;
    const fields = { name: g.name, icon: g.icon, kind: g.kind, required: true, active: true, group_key: g.key, sort_order };
    let habitId: string;
    if (adopt) {
      // Pasa a ser diario: desde `startDate`, para no reescribir días pasados.
      const start_date = adopt.start_date > startDate ? adopt.start_date : startDate;
      unwrap(await db().from("habits").update({ ...fields, start_date }).eq("id", adopt.id).eq("profile_id", profileId));
      adopt.group_key = g.key;
      habitId = adopt.id;
    } else {
      const row = unwrap(
        await db()
          .from("habits")
          .insert({ profile_id: profileId, ...fields, start_date: startDate })
          .select("id")
          .single(),
      ) as { id: string };
      habitId = row.id;
    }
    await replaceSchedules(profileId, habitId, { ...fields, weekdays: GROUP_HABIT_WEEKDAYS });
  }
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
  await assertNotGroupHabit(profileId, habitId);
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
  await assertNotGroupHabit(profileId, habitId);
  unwrap(await db().from("habits").update({ active }).eq("id", habitId).eq("profile_id", profileId).select("id").single());
}

export async function deleteHabit(profileId: string, habitId: string) {
  await assertNotGroupHabit(profileId, habitId);
  unwrap(await db().from("habits").delete().eq("id", habitId).eq("profile_id", profileId));
}

/** Reordena los hábitos; los de grupo se quedan siempre arriba y en su orden. */
export async function reorderHabits(profileId: string, ids: string[]) {
  const group = unwrap(
    await db().from("habits").select("id, group_key").eq("profile_id", profileId).not("group_key", "is", null),
  ) as { id: string; group_key: string }[];
  const rank = (key: string) => GROUP_HABITS.findIndex((g) => g.key === key);
  const groupIds = group.sort((a, b) => rank(a.group_key) - rank(b.group_key)).map((h) => h.id);
  const ordered = [...groupIds, ...ids.filter((id) => !groupIds.includes(id))];
  await Promise.all(
    ordered.map((id, index) =>
      db().from("habits").update({ sort_order: index }).eq("id", id).eq("profile_id", profileId),
    ),
  );
}

/**
 * Mantiene sincronizados los días del hábito de entreno con los ajustes. El
 * «Entrenar» del grupo es diario y no se toca.
 */
export async function syncWorkoutHabitDays(profileId: string, weekdays: number[]) {
  const habits = unwrap(
    await db().from("habits").select("id").eq("profile_id", profileId).eq("kind", "workout").is("group_key", null),
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
  if (!habit) throw new UserFacingError("Hábito no encontrado");

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
