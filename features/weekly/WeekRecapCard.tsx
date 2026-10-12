"use client";

import { CircleCheck, Trophy } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Collapse, Chevron } from "@/components/ui/Expandable";
import { MetricChip } from "@/components/ui/Pills";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatWeekRange, isoWeekNumber } from "@/lib/dates";
import { formatPercent, formatWeight } from "@/lib/format";
import type { Comparison } from "@/lib/domain/compare";
import type { WeightUnit } from "@/types/db";
import type { WeekMetrics } from "@/types/domain";
import type { Matchday } from "@/services/league";

/**
 * Card especial de cierre semanal. Los lunes aparece destacada y expandida;
 * el resto de la semana, compacta ("Semana anterior · 92% ✓").
 */
export function WeekRecapCard({
  week,
  comparisons,
  unit,
  defaultExpanded,
  matchday,
}: {
  week: WeekMetrics;
  comparisons: Comparison[];
  unit: WeightUnit;
  defaultExpanded: boolean;
  /** Ganador de la jornada de la liga y tu puesto (los lunes). */
  matchday?: Matchday | null;
}) {
  const [open, setOpen] = useState(defaultExpanded);
  const met = week.objectives.filter((o) => o.met).length;
  const allMet = week.objectives.length > 0 && met === week.objectives.length;
  const missing = week.objectives.filter((o) => !o.met && o.missing);

  return (
    <Card className={cn("overflow-hidden transition-shadow duration-300", open && defaultExpanded && "shadow-raised")} padded={false}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-[10px]", allMet ? "bg-green-tint text-green" : "bg-field text-ink-2")}>
          {allMet ? <Trophy className="size-4" /> : <CircleCheck className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          {open ? (
            <span className="block text-[12px] font-medium text-ink-3">Semana completada</span>
          ) : (
            <span className="block text-[13px] text-ink-2">
              Semana anterior · <span className="tabular font-semibold text-ink">{week.adherence}%</span> {allMet && "✓"}
            </span>
          )}
          <span className="block text-xs text-ink-3">
            Semana {isoWeekNumber(week.weekStart)} · {formatWeekRange(week.weekStart)}
          </span>
        </span>
        <Chevron open={open} />
      </button>

      <Collapse open={open}>
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="tabular text-[44px] font-semibold leading-none tracking-tight">{week.adherence}%</p>
              <p className="mt-1 text-xs text-ink-3">Cumplimiento</p>
            </div>
            <p className={cn("rounded-lg px-2.5 py-1 text-[13px] font-medium", allMet ? "bg-green-tint text-green" : "bg-field text-ink-2")}>
              {allMet ? "✅ Semana completada" : `${met} / ${week.objectives.length} objetivos cumplidos`}
            </p>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            <Stat label="Entrenos" value={`${week.workouts.count} / ${week.workouts.target}`} />
            <Stat
              label="Cardio"
              value={week.cardio.mode === "days" ? `${week.cardio.days} / ${week.cardio.daysTarget} días` : `${week.cardio.minutes} / ${week.cardio.minutesTarget} min`}
            />
            <Stat label="Hábitos" value={formatPercent(week.habits.percent)} />
            <Stat label="Peso medio" value={formatWeight(week.avgWeight, unit)} muted />
          </dl>

          {missing.length > 0 && (
            <ul className="mt-4 flex flex-col gap-1">
              {missing.map((o) => (
                <li key={o.key} className="text-[13px] text-ink-2">
                  {o.missing}
                </li>
              ))}
            </ul>
          )}

          {matchday && (matchday.winners.length > 0 || matchday.me) && (
            <Link
              href="/liga"
              className="mt-4 flex items-center gap-3 rounded-[10px] bg-field px-3 py-2.5 transition-colors hover:bg-hover"
            >
              <span aria-hidden className="text-[20px] leading-none">🏆</span>
              <span className="min-w-0 flex-1 text-[13px]">
                <span className="block truncate text-ink">
                  {matchday.winners.length
                    ? <>Jornada para <span className="font-semibold">{matchday.winners.map((w) => w.profile.name).join(" y ")}</span> · <span className="tabular">{matchday.winners[0].points} pts</span></>
                    : "Nadie puntuó en la jornada"}
                </span>
                {matchday.me && (
                  <span className="block text-xs text-ink-3">
                    Tú: <span className="tabular">{matchday.me.position}.º de {matchday.me.of} · {matchday.me.points} pts</span>
                  </span>
                )}
              </span>
              <span className="text-xs font-medium text-accent">Liga</span>
            </Link>
          )}

          {comparisons.length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <p className="mb-2 text-[12px] font-medium text-ink-3">Vs. semana anterior</p>
              <div className="flex flex-wrap gap-1.5">
                {comparisons.map((c) => (
                  <MetricChip key={c.key} label={c.label} value={c.value} tone={c.tone} />
                ))}
              </div>
            </div>
          )}
          <Link href={`/progreso/semanas/${week.weekStart}`} className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline">
            Ver semana completa
          </Link>
        </div>
      </Collapse>
    </Card>
  );
}

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className={cn("tabular mt-0.5 text-[15px] font-semibold", muted ? "text-ink-2" : "text-ink")}>{value}</dd>
    </div>
  );
}
