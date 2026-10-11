"use client";

import { ChevronRight, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { Highlight, SearchList } from "@/components/ui/SearchList";
import { ValuePill } from "@/components/ui/Pills";
import { cn } from "@/lib/cn";
import { formatWeekRange, isoWeekNumber } from "@/lib/dates";
import { formatPercent, formatWeight } from "@/lib/format";
import type { WeightUnit } from "@/types/db";
import type { WeekMetrics } from "@/types/domain";
import { adherenceTone } from "./WeeklyComplianceCard";

/** Historial de semanas con búsqueda ("semana 14", "oct"…). */
export function WeekList({ weeks, unit }: { weeks: WeekMetrics[]; unit: WeightUnit }) {
  const router = useRouter();
  const text = (w: WeekMetrics) => `Semana ${isoWeekNumber(w.weekStart)} ${formatWeekRange(w.weekStart)} ${w.adherence}%`;

  return (
    <SearchList
      items={weeks}
      label="Buscar semana"
      placeholder="Buscar semana (p. ej. 14, oct)…"
      emptyText="Ninguna semana coincide"
      getKey={(w) => w.weekStart}
      getText={text}
      onSelect={(w) => router.push(`/progreso/semanas/${w.weekStart}`)}
      renderItem={(w, { query }) => {
        const tone = adherenceTone(w.adherence);
        return (
          <div className="flex items-center gap-3 border-b border-line px-2 py-3 last:border-0">
            <div className="flex w-14 shrink-0 flex-col">
              <span className={cn("tabular text-lg font-semibold leading-tight", tone === "green" ? "text-green" : tone === "orange" ? "text-orange" : "text-ink")}>
                {w.adherence}%
              </span>
              {w.isCurrent && <span className="text-[10px] font-medium uppercase tracking-wider text-accent">En curso</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">
                <Highlight text={`Semana ${isoWeekNumber(w.weekStart)}`} query={query} />
                <span className="ml-2 text-xs font-normal text-ink-3">
                  <Highlight text={formatWeekRange(w.weekStart)} query={query} />
                </span>
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <ValuePill>
                  {w.workouts.count}/{w.workouts.target} entrenos
                </ValuePill>
                <ValuePill>{w.cardio.minutes} min cardio</ValuePill>
                <ValuePill>Hábitos {formatPercent(w.habits.percent)}</ValuePill>
                {w.avgWeight != null && <ValuePill tone="muted">{formatWeight(w.avgWeight, unit)}</ValuePill>}
                {w.streakAtEnd > 0 && (
                  <ValuePill tone="orange">
                    <Flame /> {w.streakAtEnd}
                  </ValuePill>
                )}
              </div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-ink-3" />
          </div>
        );
      }}
    />
  );
}
