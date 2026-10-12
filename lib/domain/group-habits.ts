import type { HabitKind } from "@/types/db";

/**
 * Hábitos de grupo: obligatorios para todos los perfiles, todos los días, en
 * este orden y bloqueados (nadie puede editarlos, desactivarlos ni borrarlos).
 * Son difíciles, así que en la liga valen más que el resto y van fuera del
 * tope diario (ver lib/domain/points.ts).
 *
 * `key` se guarda en habits.group_key. Si cambias la lista, actualiza también
 * la migración 20261012010000_group_habits.sql (alta de perfiles existentes).
 */
export interface GroupHabitDef {
  key: string;
  name: string;
  icon: string;
  kind: HabitKind;
}

export const GROUP_HABITS: readonly GroupHabitDef[] = [
  { key: "fajr", name: "Fajr", icon: "sunrise", kind: "check" },
  // Ligado al registro de entrenos: se completa al registrar una sesión.
  { key: "workout", name: "Entrenar", icon: "dumbbell", kind: "workout" },
  { key: "quran", name: "Leer Corán", icon: "book-open", kind: "check" },
];

export const GROUP_HABIT_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

/** Puntos de liga por cada hábito de grupo cumplido en el día. */
export const GROUP_HABIT_POINTS = 3;

const GROUP_KEYS = new Set(GROUP_HABITS.map((g) => g.key));

/** Hábito de grupo (Fajr, Entrenar, Leer Corán): 3 pts en la liga. */
export function isGroupHabit(habit: { group_key?: string | null }): boolean {
  return Boolean(habit.group_key && GROUP_KEYS.has(habit.group_key));
}

/**
 * Bloqueado (nadie puede editarlo, desactivarlo ni borrarlo): hábitos de grupo
 * y hábitos de evento de los torneos (group_key «evento:…»).
 */
export function isLockedHabit(habit: { group_key?: string | null }): boolean {
  return Boolean(habit.group_key);
}
