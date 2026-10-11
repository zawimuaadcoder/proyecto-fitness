import "server-only";
import { db } from "./supabase";

export interface ThrottleRule {
  /** Intentos permitidos antes de bloquear */
  max: number;
  /** Duración del bloqueo en segundos */
  lockSeconds: number;
}

export const PIN_THROTTLE: ThrottleRule = { max: 5, lockSeconds: 15 * 60 };
export const PASSWORD_THROTTLE: ThrottleRule = { max: 8, lockSeconds: 5 * 60 };

/**
 * Registra un intento ANTES de verificar el secreto (atómico en Postgres).
 * Devuelve los intentos restantes, o -1 si está bloqueado.
 */
export async function registerAttempt(key: string, rule: ThrottleRule): Promise<number> {
  const { data, error } = await db().rpc("auth_throttle_attempt", {
    p_key: key,
    p_max: rule.max,
    p_lock_seconds: rule.lockSeconds,
  });
  if (error) throw error;
  return Number(data);
}

/** Tras un acierto, se limpia el contador. */
export async function resetAttempts(key: string): Promise<void> {
  const { error } = await db().rpc("auth_throttle_reset", { p_key: key });
  if (error) throw error;
}

export function lockMessage(rule: ThrottleRule): string {
  return `Demasiados intentos. Prueba de nuevo en ${Math.ceil(rule.lockSeconds / 60)} min.`;
}
