"use server";

import { z } from "zod";
import { isValidTimeZone, startOfWeek, todayInTimeZone } from "@/lib/dates";
import { profileAction } from "@/lib/server/action";
import { db } from "@/lib/server/supabase";
import { goalsSchema, settingsSchema } from "@/lib/validation";
import { upsertGoals } from "@/services/goals";
import { createHabit, syncWorkoutHabitDays } from "@/services/habits";
import { getSettings, updateSettings } from "@/services/profiles";

export async function saveGoals(input: unknown) {
  return profileAction(goalsSchema, input, async (pid, v) => {
    const settings = await getSettings(pid);
    await upsertGoals(pid, { ...v, weekStart: startOfWeek(todayInTimeZone(settings.timezone)) });
  });
}

export async function saveSettings(input: unknown) {
  return profileAction(settingsSchema, input, async (pid, v) => {
    if (v.timezone && !isValidTimeZone(v.timezone)) throw new Error("Zona horaria no válida");
    await updateSettings(pid, v);
    if (v.workout_days) await syncWorkoutHabitDays(pid, v.workout_days);
  });
}

const onboardingSchema = z.object({
  weightUnit: z.enum(["kg", "lb"]),
  goal: z.enum(["lose_fat", "gain_muscle", "maintain", "habits", "other"]).nullable(),
  targetWeight: z.number().positive().max(999).nullable(),
  workoutDays: z.array(z.number().int().min(1).max(7)).max(7),
  cardioMode: z.enum(["days", "minutes", "both"]),
  cardioDaysTarget: z.number().int().min(0).max(7),
  cardioMinutesTarget: z.number().int().min(0).max(5000),
  habits: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        icon: z.string().max(30),
        kind: z.enum(["check", "quantity", "weight", "workout", "cardio"]),
        weekdays: z.array(z.number().int().min(1).max(7)),
        targetValue: z.number().min(0).nullable().optional(),
        unit: z.string().max(12).nullable().optional(),
        required: z.boolean(),
      }),
    )
    .max(12),
  timezone: z.string().max(64),
});

export async function completeOnboarding(input: unknown) {
  return profileAction(onboardingSchema, input, async (pid, v) => {
    const timezone = isValidTimeZone(v.timezone) ? v.timezone : undefined;
    await updateSettings(pid, {
      weight_unit: v.weightUnit,
      goal: v.goal,
      target_weight: v.targetWeight,
      workout_days: v.workoutDays,
      onboarded: true,
      ...(timezone ? { timezone } : {}),
    });
    const settings = await getSettings(pid);
    const today = todayInTimeZone(settings.timezone);
    await upsertGoals(pid, {
      weekStart: startOfWeek(today),
      workoutTarget: v.workoutDays.length,
      cardioMode: v.cardioMode,
      cardioDaysTarget: v.cardioDaysTarget,
      cardioMinutesTarget: v.cardioMinutesTarget,
    });
    const { count } = await db().from("habits").select("id", { count: "exact", head: true }).eq("profile_id", pid);
    if (!count) {
      for (const h of v.habits) {
        await createHabit(pid, {
          ...h,
          weekdays: h.kind === "workout" ? v.workoutDays : h.weekdays,
          active: true,
          startDate: today,
        });
      }
    }
  });
}

export async function markCelebrationSeen(input: unknown) {
  return profileAction(
    z.object({ date: z.string(), kind: z.enum(["milestone", "record", "perfect_day", "perfect_week"]), value: z.number().int() }),
    input,
    async (pid, v) => {
      await db()
        .from("streak_events")
        .upsert(
          { profile_id: pid, date: v.date, kind: v.kind, value: v.value, seen_at: new Date().toISOString() },
          { onConflict: "profile_id,kind,date,value" },
        );
    },
  );
}
