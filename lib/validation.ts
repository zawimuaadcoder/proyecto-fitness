import { z } from "zod";
import { isISODate } from "./dates";

export const isoDate = z.string().refine(isISODate, "Fecha no válida");
export const uuid = z.string().uuid("Identificador no válido");
const note = z.string().trim().max(500, "Nota demasiado larga").optional().nullable();
const typeName = z.string().trim().min(1, "Elige un tipo").max(40, "Nombre demasiado largo");

export const weightSchema = z.object({
  id: uuid.optional(),
  date: isoDate,
  time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Hora no válida")
    .optional()
    .nullable()
    .or(z.literal("")),
  weight: z.number({ error: "Introduce un peso" }).positive("Peso no válido").max(999, "Peso no válido"),
  unit: z.enum(["kg", "lb"]),
  note,
});

export const workoutSchema = z.object({
  id: uuid.optional(),
  date: isoDate,
  workoutType: typeName,
  durationMin: z.number().int().min(0).max(1440).optional().nullable(),
  note,
});

export const cardioSchema = z.object({
  id: uuid.optional(),
  date: isoDate,
  cardioType: typeName,
  minutes: z.number({ error: "Introduce los minutos" }).int().min(1, "Mínimo 1 minuto").max(1440),
  distanceKm: z.number().min(0).max(1000).optional().nullable(),
  note,
});

export const noteSchema = z.object({
  id: uuid.optional(),
  date: isoDate,
  body: z.string().trim().min(1, "Escribe algo").max(2000),
});

export const habitSchema = z.object({
  id: uuid.optional(),
  name: z.string().trim().min(1, "Ponle nombre").max(40),
  icon: z.string().max(30),
  kind: z.enum(["check", "quantity", "weight", "workout", "cardio"]),
  required: z.boolean(),
  active: z.boolean(),
  weekdays: z.array(z.number().int().min(1).max(7)).max(7),
  targetValue: z.number().min(0).max(100000).optional().nullable(),
  unit: z.string().trim().max(12).optional().nullable(),
});

export const habitLogSchema = z.object({
  habitId: uuid,
  date: isoDate,
  value: z.number().min(0).max(100000).optional().nullable(),
  status: z.enum(["completed", "in_progress", "skipped", "clear"]),
  note: z.string().max(300).optional().nullable(),
});

export const goalsSchema = z.object({
  workoutTarget: z.number().int().min(0).max(14),
  cardioMode: z.enum(["days", "minutes", "both"]),
  cardioDaysTarget: z.number().int().min(0).max(7),
  cardioMinutesTarget: z.number().int().min(0).max(5000),
});

export const settingsSchema = z.object({
  weight_unit: z.enum(["kg", "lb"]).optional(),
  timezone: z.string().max(64).optional(),
  goal: z.enum(["lose_fat", "gain_muscle", "maintain", "habits", "other"]).nullable().optional(),
  target_weight: z.number().positive().max(999).nullable().optional(),
  workout_days: z.array(z.number().int().min(1).max(7)).max(7).optional(),
  habits_goal_percent: z.number().int().min(0).max(100).optional(),
  weight_habits: z.number().int().min(0).max(100).optional(),
  weight_workouts: z.number().int().min(0).max(100).optional(),
  weight_cardio: z.number().int().min(0).max(100).optional(),
});

export const pinSchema = z.string().regex(/^\d{4}$/, "El PIN debe tener 4 dígitos");
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color no válido");

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Escribe un nombre").max(24, "Máximo 24 caracteres"),
  color,
  avatarEmoji: z.string().max(8).optional().nullable(),
  avatarUrl: z.string().url("URL no válida").max(500).optional().nullable().or(z.literal("")),
  pin: pinSchema.optional().nullable().or(z.literal("")),
  timezone: z.string().max(64).optional(),
});

export const profileUpdateSchema = profileSchema.partial().extend({
  removePin: z.boolean().optional(),
});
