"use client";

import { Activity, Plus } from "lucide-react";
import Link from "next/link";
import { MiniBars } from "@/components/charts/MiniCharts";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressRow } from "@/components/ui/Progress";
import { diffDays, weekdayLetter } from "@/lib/dates";
import { useQuickAdd } from "@/features/quick-add/QuickAdd";
import type { WeekMetrics } from "@/types/domain";

export function CardioCard({ week, today }: { week: WeekMetrics; today: string }) {
  const { open } = useQuickAdd();
  const c = week.cardio;
  return (
    <Card>
      <CardHeader
        icon={<Activity />}
        title={<Link href="/cardio" className="hover:text-ink">Cardio</Link>}
        action={
          <Button size="sm" variant="ghost" icon={<Plus />} onClick={() => open("cardio")} aria-label="Añadir cardio">
            <span className="hidden sm:inline">Añadir</span>
          </Button>
        }
      />
      <div className="flex flex-col gap-3">
        {c.mode !== "days" && c.minutesTarget > 0 && <ProgressRow label="Minutos" value={c.minutes} max={c.minutesTarget} unit="min" />}
        {c.mode !== "minutes" && c.daysTarget > 0 && <ProgressRow label="Días" value={c.days} max={c.daysTarget} />}
      </div>
      {c.minutes === 0 ? (
        <p className="mt-4 text-[13px] text-ink-3">
          No hay sesiones esta semana.{" "}
          <button type="button" onClick={() => open("cardio")} className="font-medium text-accent hover:underline">
            Añadir cardio
          </button>
        </p>
      ) : (
        <MiniBars
          className="mt-4"
          values={c.dailyMinutes}
          labels={[1, 2, 3, 4, 5, 6, 7].map(weekdayLetter)}
          unit="min"
          height={56}
          highlight={week.isCurrent ? diffDays(today, week.weekStart) : undefined}
          ariaLabel="Minutos de cardio por día"
        />
      )}
    </Card>
  );
}
