"use client";

import { Activity, Dumbbell, MoonStar, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { EntityChip } from "@/components/ui/Pills";
import { cn } from "@/lib/cn";
import { formatRelativeDay, formatWeekRange, startOfWeek } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { useQuickAdd } from "@/features/quick-add/QuickAdd";
import type { CardioEntryRow, WorkoutEntryRow } from "@/types/db";

type Entry = { kind: "workout"; row: WorkoutEntryRow } | { kind: "cardio"; row: CardioEntryRow };

/** Lista de sesiones agrupadas por semana con chips de filtro por tipo. */
export function SessionList({
  workouts = [],
  cardio = [],
  today,
  kind,
}: {
  workouts?: WorkoutEntryRow[];
  cardio?: CardioEntryRow[];
  today: string;
  kind: "workout" | "cardio";
}) {
  const { edit, open } = useQuickAdd();
  const [filter, setFilter] = useState("all");
  const entries: Entry[] = useMemo(
    () =>
      kind === "workout"
        ? workouts.map((row) => ({ kind: "workout" as const, row }))
        : cardio.map((row) => ({ kind: "cardio" as const, row })),
    [kind, workouts, cardio],
  );
  const typeOf = (e: Entry) => (e.kind === "workout" ? e.row.workout_type : e.row.cardio_type);
  const types = [...new Set(entries.map(typeOf))];
  const filtered = entries.filter((e) => filter === "all" || typeOf(e) === filter).sort((a, b) => b.row.date.localeCompare(a.row.date));

  const groups = new Map<string, Entry[]>();
  for (const e of filtered.slice(0, 120)) {
    const w = startOfWeek(e.row.date);
    groups.set(w, [...(groups.get(w) ?? []), e]);
  }

  if (!entries.length) {
    return (
      <EmptyState
        icon={kind === "workout" ? <Dumbbell /> : <Activity />}
        title={kind === "workout" ? "Aún no hay entrenamientos" : "No hay sesiones de cardio"}
        description={kind === "workout" ? "Registra tu primera sesión o un descanso planificado." : "Caminar también cuenta."}
        action={
          <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => open(kind)}>
            {kind === "workout" ? "Registrar entreno" : "Añadir cardio"}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {types.length > 1 && (
        <FilterChips
          label="Filtrar por tipo"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Todos", count: entries.length },
            ...types.map((t) => ({ value: t, label: t, count: entries.filter((e) => typeOf(e) === t).length })),
          ]}
        />
      )}
      {[...groups.entries()].map(([week, list]) => {
        const minutes = list.reduce((s, e) => s + (e.kind === "cardio" ? e.row.minutes : e.row.duration_min ?? 0), 0);
        return (
          <section key={week}>
            <h3 className="mb-1.5 flex items-baseline justify-between px-1 text-xs text-ink-3">
              <span className="font-medium">{formatWeekRange(week)}</span>
              <span className="tabular">
                {kind === "workout" ? `${list.filter((e) => e.kind === "workout" && !e.row.is_rest).length} sesiones` : `${minutes} min`}
              </span>
            </h3>
            <ul className="overflow-hidden rounded-xl border border-line bg-surface">
              {list.map((e) => {
                const rest = e.kind === "workout" && e.row.is_rest;
                return (
                  <li key={e.row.id} className="border-b border-line last:border-0">
                    <button
                      type="button"
                      onClick={() => (e.kind === "workout" ? edit({ kind: "workout", entry: e.row }) : edit({ kind: "cardio", entry: e.row }))}
                      className="flex min-h-14 w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-hover"
                    >
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", rest ? "bg-field text-ink-3" : "bg-accent-tint text-accent")}>
                        {rest ? <MoonStar className="size-4" /> : kind === "workout" ? <Dumbbell className="size-4" /> : <Activity className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{typeOf(e)}</span>
                        <span className="block truncate text-xs text-ink-3">
                          {formatRelativeDay(e.row.date, today)}
                          {e.row.note ? ` · ${e.row.note}` : ""}
                        </span>
                      </span>
                      <span className="tabular shrink-0 text-right text-sm text-ink-2">
                        {e.kind === "cardio" ? (
                          <>
                            {e.row.minutes} min
                            {e.row.distance_km ? <span className="block text-xs text-ink-3">{formatNumber(e.row.distance_km, 2)} km</span> : null}
                          </>
                        ) : rest ? (
                          <EntityChip>Descanso</EntityChip>
                        ) : e.row.duration_min ? (
                          `${e.row.duration_min} min`
                        ) : (
                          ""
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
