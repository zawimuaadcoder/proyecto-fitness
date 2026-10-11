"use client";

import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { WeekdayPicker } from "@/components/ui/Inputs";
import { useAction } from "@/features/offline/useMutation";
import { saveSettings } from "./actions";
import { EditedBadge, useEditState } from "./GoalsCard";

/** Días previstos de entrenamiento (el resto: descanso planificado). */
export function TrainingDaysCard({ days }: { days: number[] }) {
  const edit = useEditState(days);
  const { run, pending } = useAction();
  return (
    <Card>
      <CardHeader icon={<CalendarDays />} title="Días de entrenamiento" subtitle="Los demás son descanso: no rompen la racha" action={<EditedBadge state={edit.state} />} />
      <WeekdayPicker value={edit.value} onChange={edit.setValue} label="Días de entrenamiento" />
      {edit.dirty && (
        <div className="animate-fade-up mt-3 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={edit.reset}>
            Descartar
          </Button>
          <Button
            size="sm"
            variant="primary"
            loading={pending}
            onClick={async () => {
              const res = await run(() => saveSettings({ workout_days: edit.value }), false);
              if (res.ok) edit.markSaved();
            }}
          >
            Guardar
          </Button>
        </div>
      )}
    </Card>
  );
}
