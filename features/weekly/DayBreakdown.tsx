"use client";

import { Expandable } from "@/components/ui/Expandable";
import { StatusPill } from "@/components/ui/Pills";
import { formatRelativeDay } from "@/lib/dates";
import { HabitRow } from "@/features/habits/HabitRow";
import type { CardioEntryRow, WorkoutEntryRow } from "@/types/db";
import type { DayEvaluation } from "@/types/domain";

/** Lista de días expandibles con hábitos (editables), entrenos y cardio. */
export function DayBreakdown({
  days,
  workouts,
  cardio,
  today,
}: {
  days: DayEvaluation[];
  workouts: WorkoutEntryRow[];
  cardio: CardioEntryRow[];
  today: string;
}) {
  return (
    <ul className="flex flex-col divide-y divide-line">
      {days.map((d) => {
        const w = workouts.filter((x) => x.date === d.date);
        const c = cardio.filter((x) => x.date === d.date);
        const future = d.date > today;
        return (
          <li key={d.date}>
            <Expandable
              disabled={future}
              defaultOpen={d.date === today}
              headerClassName="min-h-12 py-2"
              header={
                <span className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm font-medium capitalize text-ink">{formatRelativeDay(d.date, today)}</span>
                  <span className="tabular flex-1 truncate text-xs text-ink-3">
                    {d.requiredTotal ? `${d.requiredDone}/${d.requiredTotal} obligatorios` : "Sin obligatorios"}
                    {w.filter((x) => !x.is_rest).length > 0 && ` · ${w.filter((x) => !x.is_rest).map((x) => x.workout_type).join(", ")}`}
                    {c.length > 0 && ` · ${c.reduce((s, x) => s + x.minutes, 0)} min cardio`}
                  </span>
                  {!future && <StatusPill status={d.status} kind="day" />}
                </span>
              }
            >
              <ul className="-mx-2 mb-2 flex flex-col">
                {d.habits.map((h) => (
                  <HabitRow key={h.habit.id} result={h} />
                ))}
                {d.habits.length === 0 && <li className="px-2 py-2 text-[13px] text-ink-3">No había hábitos programados.</li>}
              </ul>
            </Expandable>
          </li>
        );
      })}
    </ul>
  );
}
