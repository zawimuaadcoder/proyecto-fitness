"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { NumberStepper } from "@/components/ui/Inputs";
import { Expandable } from "@/components/ui/Expandable";
import { useAction } from "@/features/offline/useMutation";
import { saveSettings } from "./actions";
import { EditedBadge, useEditState } from "./GoalsCard";

/** Pesos configurables de la fórmula de cumplimiento (ajuste avanzado). */
export function AdherenceWeightsCard({
  weights,
  habitsGoal,
}: {
  weights: { habits: number; workouts: number; cardio: number };
  habitsGoal: number;
}) {
  const edit = useEditState({ ...weights, habitsGoal });
  const { run, pending } = useAction();
  const v = edit.value;
  const total = v.habits + v.workouts + v.cardio;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  const row = (label: string, key: "habits" | "workouts" | "cardio") => (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-ink-2">
        {label} <span className="tabular text-xs text-ink-3">· {pct(v[key])}%</span>
      </span>
      <NumberStepper label={`Peso de ${label}`} value={v[key]} onChange={(n) => edit.setValue({ ...v, [key]: n ?? 0 })} step={5} min={0} max={100} className="w-36" />
    </div>
  );

  return (
    <Card>
      <Expandable
        header={
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-ink-3" />
            <span className="text-[13px] font-medium text-ink-2">Cálculo del cumplimiento</span>
            <EditedBadge state={edit.state} />
          </span>
        }
      >
        <div className="flex flex-col gap-3 pt-4">
          <CardHeader title="Peso de cada componente" subtitle="Se normalizan automáticamente" className="mb-0" />
          {row("Hábitos", "habits")}
          {row("Entrenos", "workouts")}
          {row("Cardio", "cardio")}
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-[13px] text-ink-2">Objetivo de hábitos</span>
            <NumberStepper label="Objetivo de hábitos" value={v.habitsGoal} onChange={(n) => edit.setValue({ ...v, habitsGoal: n ?? 0 })} step={5} min={0} max={100} suffix="%" className="w-36" />
          </div>
          {total === 0 && <p className="text-xs text-red">Al menos un componente debe tener peso.</p>}
          {edit.dirty && (
            <div className="animate-fade-up flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={edit.reset}>
                Descartar
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={total === 0}
                loading={pending}
                onClick={async () => {
                  const res = await run(
                    () =>
                      saveSettings({
                        weight_habits: v.habits,
                        weight_workouts: v.workouts,
                        weight_cardio: v.cardio,
                        habits_goal_percent: v.habitsGoal,
                      }),
                    false,
                  );
                  if (res.ok) edit.markSaved();
                }}
              >
                Guardar
              </Button>
            </div>
          )}
        </div>
      </Expandable>
    </Card>
  );
}
