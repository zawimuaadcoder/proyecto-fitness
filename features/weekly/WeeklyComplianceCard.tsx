"use client";

import { CalendarCheck2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Odometer } from "@/components/ui/Odometer";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { formatPercent } from "@/lib/format";
import type { WeekMetrics } from "@/types/domain";

export function adherenceTone(p: number): "green" | "accent" | "orange" {
  return p >= 90 ? "green" : p >= 60 ? "accent" : "orange";
}

/** Cumplimiento de la semana en curso: % + desglose por componente. */
export function WeeklyComplianceCard({ week }: { week: WeekMetrics }) {
  const tone = adherenceTone(week.adherence);
  return (
    <Card>
      <CardHeader
        icon={<CalendarCheck2 />}
        title="Cumplimiento semanal"
        subtitle={week.isCurrent ? `Día ${week.elapsedDays} de 7` : undefined}
        action={
          <Link href="/cumplimiento" aria-label="Ver cumplimiento semanal" className="flex size-7 items-center justify-center rounded-[8px] text-ink-3 hover:bg-hover hover:text-ink">
            <ChevronRight className="size-4" />
          </Link>
        }
      />
      <div className="flex items-center gap-4">
        <ProgressRing value={week.adherence / 100} size={64} stroke={5} tone={tone} label={`${week.adherence}% de cumplimiento`}>
          <span className="tabular text-[15px] font-semibold">
            <Odometer value={week.adherence} />
            <span className="text-[10px] text-ink-3">%</span>
          </span>
        </ProgressRing>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {week.components.map((c) => (
            <div key={c.key} className="flex items-center gap-2 text-xs">
              <span className="w-16 shrink-0 text-ink-3">{c.label}</span>
              <ProgressBar value={c.ratio} height={4} tone={c.ratio >= 1 ? "green" : "accent"} label={`${c.label} ${Math.round(c.ratio * 100)}%`} />
              <span className="tabular w-9 shrink-0 text-right text-ink-2">{formatPercent(c.ratio * 100)}</span>
            </div>
          ))}
          {week.components.length === 0 && <p className="text-xs text-ink-3">Configura objetivos para calcular el cumplimiento.</p>}
        </div>
      </div>
      <p className="mt-3 text-[11px] text-ink-3">El peso no cuenta: el cumplimiento mide acciones que controlas.</p>
    </Card>
  );
}
