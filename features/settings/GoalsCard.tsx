"use client";

import { Check, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { NumberStepper } from "@/components/ui/Inputs";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAction } from "@/features/offline/useMutation";
import type { CardioMode } from "@/types/db";
import type { WeekGoals } from "@/types/domain";
import { saveGoals } from "./actions";

/** Indicador "Editado / Guardado ✓" para settings cards. */
export function EditedBadge({ state }: { state: "idle" | "dirty" | "saved" }) {
  if (state === "idle") return null;
  return (
    <span
      role="status"
      className={`animate-pop-in inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${state === "saved" ? "bg-green-tint text-green" : "bg-orange-tint text-orange"}`}
    >
      {state === "saved" ? (
        <>
          <Check className="size-3" strokeWidth={2.5} /> Guardado
        </>
      ) : (
        "Editado"
      )}
    </span>
  );
}

/** Hook genérico de estado editado/guardado. */
export function useEditState<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(value) !== JSON.stringify(initial);
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2200);
    return () => clearTimeout(t);
  }, [saved]);
  return {
    value,
    setValue: (v: T) => {
      setValue(v);
      setSaved(false);
    },
    dirty,
    state: (dirty ? "dirty" : saved ? "saved" : "idle") as "idle" | "dirty" | "saved",
    markSaved: () => setSaved(true),
    reset: () => setValue(initial),
  };
}

/** Card compacta de metas semanales (entreno + cardio). */
export function GoalsCard({ goals, compact }: { goals: WeekGoals; compact?: "workout" | "cardio" }) {
  const edit = useEditState(goals);
  const { run, pending } = useAction();
  const v = edit.value;
  const set = (patch: Partial<WeekGoals>) => edit.setValue({ ...v, ...patch });

  async function save() {
    const res = await run(() => saveGoals(v), false);
    if (res.ok) edit.markSaved();
  }

  return (
    <Card>
      <CardHeader
        icon={<Target />}
        title={compact === "cardio" ? "Objetivo de cardio" : compact === "workout" ? "Objetivo de entreno" : "Objetivos semanales"}
        subtitle="Se aplica desde esta semana"
        action={<EditedBadge state={edit.state} />}
      />
      <div className="flex flex-col gap-4">
        {compact !== "cardio" && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-ink-2">Sesiones de entreno / semana</span>
            <NumberStepper label="Sesiones por semana" value={v.workoutTarget} onChange={(n) => set({ workoutTarget: n ?? 0 })} min={0} max={14} className="w-36" />
          </div>
        )}
        {compact !== "workout" && (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[13px] text-ink-2">Modo de cardio</span>
              <SegmentedControl<CardioMode>
                label="Modo de cardio"
                size="sm"
                value={v.cardioMode}
                onChange={(m) => set({ cardioMode: m })}
                options={[
                  { value: "days", label: "Días" },
                  { value: "minutes", label: "Minutos" },
                  { value: "both", label: "Ambos" },
                ]}
              />
            </div>
            {v.cardioMode !== "minutes" && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-ink-2">Días de cardio</span>
                <NumberStepper label="Días de cardio" value={v.cardioDaysTarget} onChange={(n) => set({ cardioDaysTarget: n ?? 0 })} min={0} max={7} className="w-36" />
              </div>
            )}
            {v.cardioMode !== "days" && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-ink-2">Minutos de cardio</span>
                <NumberStepper label="Minutos de cardio" value={v.cardioMinutesTarget} onChange={(n) => set({ cardioMinutesTarget: n ?? 0 })} step={10} min={0} max={5000} className="w-36" />
              </div>
            )}
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-ink-2">Periodo</span>
              <span className="text-ink-3">Semanal (lun → dom)</span>
            </div>
          </>
        )}
        {edit.dirty && (
          <div className="animate-fade-up flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={edit.reset}>
              Descartar
            </Button>
            <Button size="sm" variant="primary" loading={pending} onClick={save}>
              Guardar
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
