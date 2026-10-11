"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatShortDate, isoWeekday, weekdayLetter } from "@/lib/dates";
import type { DayStatus } from "@/types/domain";

const LABEL: Record<DayStatus, string> = {
  completed: "Completado",
  pending: "Pendiente",
  rest: "Descanso",
  failed: "Fallido",
  none: "Sin seguimiento",
};

/** Calendario tipo heatmap (columnas = semanas). Tap muestra el día. */
export function StreakHeatmap({ days }: { days: { date: string; status: DayStatus; run: number }[] }) {
  const [active, setActive] = useState<(typeof days)[number] | null>(null);
  // Rellenar para empezar en lunes
  const pad = days.length ? isoWeekday(days[0].date) - 1 : 0;
  const cells: (typeof days[number] | null)[] = [...Array(pad).fill(null), ...days];
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-col gap-[3px] pt-px text-[9px] leading-[14px] text-ink-3" aria-hidden>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <span key={d} className="h-3.5">
              {d % 2 === 1 ? weekdayLetter(d) : ""}
            </span>
          ))}
        </div>
        <div className="no-scrollbar flex flex-1 gap-[3px] overflow-x-auto" role="grid" aria-label="Historial de días">
          {weeks.map((w, i) => (
            <div key={i} className="flex flex-col gap-[3px]" role="row">
              {w.map((d, j) =>
                d ? (
                  <button
                    key={d.date}
                    type="button"
                    role="gridcell"
                    aria-label={`${formatShortDate(d.date)}: ${LABEL[d.status]}`}
                    onClick={() => setActive(active?.date === d.date ? null : d)}
                    className={cn(
                      "size-3.5 rounded-[3px] transition-transform hover:scale-125",
                      d.status === "completed" && "bg-orange",
                      d.status === "failed" && "bg-red/45",
                      d.status === "rest" && "bg-ink-3/30",
                      d.status === "pending" && "border border-orange/60",
                      d.status === "none" && "bg-field",
                      active?.date === d.date && "ring-2 ring-ink ring-offset-1 ring-offset-surface",
                    )}
                  />
                ) : (
                  <span key={`p${j}`} className="size-3.5" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-3">
        {active ? (
          <span className="animate-fade-in text-xs text-ink-2">
            {formatShortDate(active.date)} · {LABEL[active.status]} · racha {active.run}
          </span>
        ) : (
          (["completed", "rest", "failed"] as DayStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className={cn("size-2.5 rounded-[2px]", s === "completed" ? "bg-orange" : s === "failed" ? "bg-red/45" : "bg-ink-3/30")} />
              {LABEL[s]}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
