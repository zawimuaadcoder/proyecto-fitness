import "server-only";
import { db, unwrap } from "@/lib/server/supabase";
import type { CardioMode } from "@/types/db";

export interface GoalsInput {
  weekStart: string;
  workoutTarget: number;
  cardioMode: CardioMode;
  cardioDaysTarget: number;
  cardioMinutesTarget: number;
}

/**
 * Las metas se versionan por semana: editar hoy crea/actualiza la fila de la
 * semana actual, sin reescribir el cumplimiento de semanas pasadas.
 */
export async function upsertGoals(profileId: string, input: GoalsInput) {
  unwrap(
    await db()
      .from("weekly_goals")
      .upsert(
        {
          profile_id: profileId,
          week_start: input.weekStart,
          workout_sessions_target: input.workoutTarget,
          cardio_mode: input.cardioMode,
          cardio_days_target: input.cardioDaysTarget,
          cardio_minutes_target: input.cardioMinutesTarget,
        },
        { onConflict: "profile_id,week_start" },
      ),
  );
}
