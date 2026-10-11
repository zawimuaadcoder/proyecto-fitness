"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { saveCardio, saveNote, saveWeight, saveWorkout } from "@/features/entries/actions";
import { logHabit } from "@/features/habits/actions";
import { useAppProfile } from "@/features/app/ProfileContext";
import type { ActionResult } from "@/types/domain";
import { offlineQueue, type QueueKind } from "./queue";

export const queueActions: Record<QueueKind, (payload: unknown) => Promise<ActionResult<unknown>>> = {
  weight: saveWeight,
  workout: saveWorkout,
  cardio: saveCardio,
  note: saveNote,
  habitLog: logHabit,
};

function isNetworkError(error: unknown) {
  return error instanceof TypeError || (error instanceof Error && /fetch|network|load failed/i.test(error.message));
}

/**
 * Ejecuta una acción de registro con feedback. Sin conexión (o si la red
 * falla) la guarda en la cola local para sincronizar después.
 */
export function useRecordMutation() {
  const toast = useToast();
  const { profile } = useAppProfile();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (kind: QueueKind, payload: unknown, options: { success?: string; silent?: boolean } = {}) => {
      const enqueue = () => {
        offlineQueue.add({ profileId: profile.id, kind, payload });
        toast.show("Guardado sin conexión · se sincronizará", "offline");
        return { ok: true, queued: true };
      };
      if (typeof navigator !== "undefined" && !navigator.onLine && !(payload as { id?: string })?.id) return enqueue();
      setPending(true);
      try {
        const result = await queueActions[kind](payload);
        if (!result.ok) {
          toast.error(result.error ?? "No se pudo guardar");
          return { ok: false, error: result.error };
        }
        if (!options.silent) toast.success(options.success ?? "Guardado");
        return { ok: true };
      } catch (error) {
        if (isNetworkError(error) && !(payload as { id?: string })?.id) return enqueue();
        toast.error("No se pudo guardar");
        return { ok: false };
      } finally {
        setPending(false);
      }
    },
    [profile.id, toast],
  );

  return { run, pending };
}

/** Para acciones no encolables (CRUD de ajustes, borrados…). */
export function useAction() {
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const run = useCallback(
    async <T,>(fn: () => Promise<ActionResult<T>>, success: string | false = "Guardado") => {
      setPending(true);
      try {
        const result = await fn();
        if (!result.ok) toast.error(result.error ?? "Algo salió mal");
        else if (success) toast.success(success);
        return result;
      } catch (error) {
        toast.error(isNetworkError(error) ? "Sin conexión" : "Algo salió mal");
        return { ok: false } as ActionResult<T>;
      } finally {
        setPending(false);
      }
    },
    [toast],
  );
  return { run, pending };
}
