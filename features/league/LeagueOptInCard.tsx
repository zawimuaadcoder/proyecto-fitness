"use client";

import { Trophy } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Inputs";
import { useAction } from "@/features/offline/useMutation";
import { saveSettings } from "@/features/settings/actions";

/** Ajuste "Participar en la liga". */
export function LeagueOptInCard({ optIn }: { optIn: boolean }) {
  const [checked, setChecked] = useState(optIn);
  const { run, pending } = useAction();
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-ink-3 [&_svg]:size-4">
            <Trophy />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-medium text-ink-2">Participar en la liga</span>
            <span className="block text-xs text-ink-3">Tus puntos y tu racha aparecen en la clasificación. El peso nunca se muestra.</span>
          </span>
        </span>
        <Switch
          checked={checked}
          disabled={pending}
          label="Participar en la liga"
          onChange={async (v) => {
            setChecked(v);
            const res = await run(() => saveSettings({ league_opt_in: v }), v ? "Vuelves a la liga" : "Has salido de la liga");
            if (!res.ok) setChecked(!v);
          }}
        />
      </div>
    </Card>
  );
}
