"use client";

import { Dumbbell, MoonStar, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EntityChip, ValuePill } from "@/components/ui/Pills";
import { ProgressBar } from "@/components/ui/Progress";
import { cn } from "@/lib/cn";
import { isoWeekday, weekDays, weekdayLetter } from "@/lib/dates";
import { useQuickAdd } from "@/features/quick-add/QuickAdd";
import type { WorkoutEntryRow } from "@/types/db";

export function WorkoutCard({
  todayEntries,
  weekEntries,
  weekStart,
  target,
  plannedDays,
  today,
}: {
  todayEntries: WorkoutEntryRow[];
  weekEntries: WorkoutEntryRow[];
  weekStart: string;
  target: number;
  plannedDays: number[];
  today: string;
}) {
  const { open, edit } = useQuickAdd();
  const sessions = weekEntries.filter((e) => !e.is_rest).length;
  const todaySessions = todayEntries.filter((e) => !e.is_rest);
  const todayRest = todayEntries.some((e) => e.is_rest);
  const plannedToday = plannedDays.includes(isoWeekday(today));

  return (
    <Card>
      <CardHeader
        icon={<Dumbbell />}
        title={<Link href="/entrenamiento" className="hover:text-ink">Entrenamiento</Link>}
        action={<ValuePill tone={sessions >= target && target > 0 ? "green" : "neutral"}>{sessions} / {target} sesiones</ValuePill>}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-ink-3">Hoy</p>
          {todaySessions.length ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {todaySessions.map((s) => (
                <button key={s.id} type="button" onClick={() => edit({ kind: "workout", entry: s })} className="text-left">
                  <span className="text-[17px] font-semibold tracking-tight">{s.workout_type}</span>
                  {s.duration_min ? <span className="tabular ml-1.5 text-xs text-ink-3">{s.duration_min} min</span> : null}
                </button>
              ))}
            </div>
          ) : todayRest ? (
            <p className="mt-1 flex items-center gap-1.5 text-[17px] font-semibold text-ink-2">
              <MoonStar className="size-4" /> Descanso
            </p>
          ) : (
            <p className="mt-1 text-[15px] font-medium text-ink-2">{plannedToday ? "Toca entrenar" : "Día libre"}</p>
          )}
        </div>
        {!todaySessions.length && (
          <div className="flex shrink-0 gap-1.5">
            {plannedToday && !todayRest && (
              <Button size="sm" variant="ghost" onClick={() => edit({ kind: "workout", defaultType: "Descanso" })}>
                Descanso
              </Button>
            )}
            <Button size="sm" variant="secondary" icon={<Plus />} onClick={() => open("workout")}>
              Registrar
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-1.5" aria-label="Semana de entrenamiento">
        {weekDays(weekStart).map((d) => {
          const entries = weekEntries.filter((e) => e.date === d);
          const done = entries.some((e) => !e.is_rest);
          const rest = !done && entries.some((e) => e.is_rest);
          const planned = plannedDays.includes(isoWeekday(d));
          const label = `${weekdayLetter(isoWeekday(d))}: ${done ? "entrenado" : rest ? "descanso" : planned ? "planificado" : "libre"}`;
          return (
            <div key={d} className="flex flex-1 flex-col items-center gap-1" role="img" aria-label={label}>
              <span
                className={cn(
                  "h-1.5 w-full rounded-full",
                  done ? "bg-accent" : rest ? "bg-ink-3/40" : planned ? (d < today ? "bg-red/50" : "border border-dashed border-line-strong") : "bg-field",
                )}
              />
              <span className={cn("text-[10px]", d === today ? "font-semibold text-ink" : "text-ink-3")}>{weekdayLetter(isoWeekday(d))}</span>
            </div>
          );
        })}
      </div>
      {target > 0 && <ProgressBar className="sr-only" value={sessions / target} label="Sesiones de la semana" />}
      {weekEntries.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {[...new Set(weekEntries.filter((e) => !e.is_rest).map((e) => e.workout_type))].map((t) => (
            <EntityChip key={t}>{t}</EntityChip>
          ))}
        </div>
      )}
    </Card>
  );
}
