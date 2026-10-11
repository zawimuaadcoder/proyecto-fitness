"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterChips } from "@/components/ui/FilterChips";
import { StatusPill } from "@/components/ui/Pills";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { formatDateWithYear, formatShortDate } from "@/lib/dates";
import { formatNumber, formatPercent, formatSigned, formatWeight } from "@/lib/format";
import { useAction } from "@/features/offline/useMutation";
import { useQuickAdd } from "@/features/quick-add/QuickAdd";
import { deleteEntries } from "@/features/entries/actions";
import type { CardioEntryRow, NoteRow, WeightEntryRow, WeightUnit, WorkoutEntryRow } from "@/types/db";
import type { DayStatus } from "@/types/domain";
import { DataTable } from "./DataTable";

export interface WeightHistoryRow extends WeightEntryRow {
  display: number;
  avg7: number | null;
  change: number | null;
}

export interface HabitDayRow {
  date: string;
  status: DayStatus;
  done: number;
  total: number;
  pending: string[];
}

type Tab = "peso" | "cardio" | "entreno" | "habitos" | "notas";

export function HistoryTables({
  weights,
  cardio,
  workouts,
  habitDays,
  notes,
  unit,
  initialTab = "peso",
  only,
}: {
  weights: WeightHistoryRow[];
  cardio: CardioEntryRow[];
  workouts: WorkoutEntryRow[];
  habitDays: HabitDayRow[];
  notes: NoteRow[];
  unit: WeightUnit;
  initialTab?: Tab;
  /** Muestra solo una pestaña, sin selector */
  only?: Tab;
}) {
  const [selectedTab, setTab] = useState<Tab>(initialTab);
  const tab = only ?? selectedTab;
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "failed">("all");
  const { edit, open } = useQuickAdd();
  const { run } = useAction();

  const del = (table: "weight_entries" | "workout_entries" | "cardio_entries" | "notes") => async (ids: string[]) => {
    await run(() => deleteEntries({ table, ids }), `${ids.length} eliminado${ids.length === 1 ? "" : "s"}`);
  };

  const workoutTypes = useMemo(() => [...new Set(workouts.map((w) => w.workout_type))], [workouts]);
  const cardioTypes = useMemo(() => [...new Set(cardio.map((c) => c.cardio_type))], [cardio]);

  const typeChips = (types: string[], rows: { type: string }[]) => [
    { value: "all", label: "Todos", count: rows.length },
    ...types.map((t) => ({ value: t, label: t, count: rows.filter((r) => r.type === t).length })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className={only ? "hidden" : "no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0"}>
        <SegmentedControl
          label="Tipo de registro"
          value={tab}
          onChange={(t) => {
            setTab(t);
            setTypeFilter("all");
          }}
          options={[
            { value: "peso", label: "Peso" },
            { value: "cardio", label: "Cardio" },
            { value: "entreno", label: "Entreno" },
            { value: "habitos", label: "Hábitos" },
            { value: "notas", label: "Notas" },
          ]}
        />
      </div>

      {tab === "peso" && (
        <DataTable
          id="peso"
          rows={weights}
          getKey={(r) => r.id}
          onRowClick={(r) => edit({ kind: "weight", entry: r })}
          onDelete={del("weight_entries")}
          emptyTitle="Aún no has registrado tu peso"
          emptyAction={<Button size="sm" variant="secondary" icon={<Plus />} onClick={() => open("weight")}>Registrar primer peso</Button>}
          initialSort={{ key: "date", dir: "desc" }}
          columns={[
            { key: "date", label: "Fecha", mobile: "title", render: (r) => formatDateWithYear(r.date), sortValue: (r) => r.date + (r.time ?? "") },
            { key: "weight", label: "Peso", align: "right", mobile: "value", render: (r) => formatWeight(r.display, unit), sortValue: (r) => r.display },
            { key: "avg7", label: "Media 7d", align: "right", optional: true, mobile: "meta", render: (r) => (r.avg7 != null ? `Media ${formatWeight(r.avg7, unit)}` : "—"), sortValue: (r) => r.avg7 },
            { key: "change", label: "Cambio", align: "right", optional: true, render: (r) => (r.change != null ? formatSigned(r.change, 1) : "—"), sortValue: (r) => r.change },
            { key: "note", label: "Nota", optional: true, mobile: "meta", render: (r) => r.note ?? "" },
          ]}
        />
      )}

      {tab === "cardio" && (
        <>
          {cardioTypes.length > 1 && (
            <FilterChips label="Filtrar por tipo" value={typeFilter} onChange={setTypeFilter} options={typeChips(cardioTypes, cardio.map((c) => ({ type: c.cardio_type })))} />
          )}
          <DataTable
            id="cardio"
            rows={cardio.filter((c) => typeFilter === "all" || c.cardio_type === typeFilter)}
            getKey={(r) => r.id}
            onRowClick={(r) => edit({ kind: "cardio", entry: r })}
            onDelete={del("cardio_entries")}
            emptyTitle="No hay sesiones de cardio"
            emptyAction={<Button size="sm" variant="secondary" icon={<Plus />} onClick={() => open("cardio")}>Añadir cardio</Button>}
            initialSort={{ key: "date", dir: "desc" }}
            columns={[
              { key: "date", label: "Fecha", mobile: "meta", render: (r) => formatShortDate(r.date), sortValue: (r) => r.date },
              { key: "type", label: "Tipo", mobile: "title", render: (r) => r.cardio_type, sortValue: (r) => r.cardio_type },
              { key: "minutes", label: "Minutos", align: "right", mobile: "value", render: (r) => `${r.minutes} min`, sortValue: (r) => r.minutes },
              { key: "distance", label: "Distancia", align: "right", optional: true, mobile: "meta", render: (r) => (r.distance_km ? `${formatNumber(r.distance_km, 2)} km` : "—"), sortValue: (r) => r.distance_km },
              { key: "note", label: "Nota", optional: true, render: (r) => r.note ?? "" },
            ]}
          />
        </>
      )}

      {tab === "entreno" && (
        <>
          {workoutTypes.length > 1 && (
            <FilterChips label="Filtrar por tipo" value={typeFilter} onChange={setTypeFilter} options={typeChips(workoutTypes, workouts.map((w) => ({ type: w.workout_type })))} />
          )}
          <DataTable
            id="entreno"
            rows={workouts.filter((w) => typeFilter === "all" || w.workout_type === typeFilter)}
            getKey={(r) => r.id}
            onRowClick={(r) => edit({ kind: "workout", entry: r })}
            onDelete={del("workout_entries")}
            emptyTitle="No hay entrenamientos registrados"
            emptyAction={<Button size="sm" variant="secondary" icon={<Plus />} onClick={() => open("workout")}>Registrar entreno</Button>}
            initialSort={{ key: "date", dir: "desc" }}
            columns={[
              { key: "date", label: "Fecha", mobile: "meta", render: (r) => formatShortDate(r.date), sortValue: (r) => r.date },
              { key: "type", label: "Tipo", mobile: "title", render: (r) => r.workout_type, sortValue: (r) => r.workout_type },
              { key: "duration", label: "Duración", align: "right", mobile: "value", render: (r) => (r.duration_min ? `${r.duration_min} min` : "—"), sortValue: (r) => r.duration_min },
              { key: "status", label: "Estado", optional: true, render: (r) => <StatusPill status={r.is_rest ? "rest" : "completed"} /> },
              { key: "note", label: "Nota", optional: true, mobile: "meta", render: (r) => r.note ?? "" },
            ]}
          />
        </>
      )}

      {tab === "habitos" && (
        <>
          <FilterChips
            label="Filtrar días"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Todos", count: habitDays.length },
              { value: "completed", label: "Completados", count: habitDays.filter((d) => d.status === "completed").length },
              { value: "failed", label: "Fallidos", count: habitDays.filter((d) => d.status === "failed").length },
            ]}
          />
          <DataTable
            id="habitos"
            rows={habitDays.filter((d) => statusFilter === "all" || d.status === statusFilter)}
            getKey={(r) => r.date}
            emptyTitle="Sin días registrados"
            initialSort={{ key: "date", dir: "desc" }}
            columns={[
              { key: "date", label: "Fecha", mobile: "title", render: (r) => formatDateWithYear(r.date), sortValue: (r) => r.date },
              { key: "pct", label: "Cumplimiento", align: "right", mobile: "value", render: (r) => (r.total ? formatPercent((r.done / r.total) * 100) : "—"), sortValue: (r) => (r.total ? r.done / r.total : null) },
              { key: "done", label: "Completados", align: "right", render: (r) => `${r.done} / ${r.total}` },
              { key: "pending", label: "Pendientes", optional: true, mobile: "meta", render: (r) => (r.pending.length ? r.pending.join(", ") : "—") },
              { key: "status", label: "Día", render: (r) => <StatusPill status={r.status} kind="day" /> },
            ]}
          />
        </>
      )}

      {tab === "notas" && (
        <DataTable
          id="notas"
          rows={notes}
          getKey={(r) => r.id}
          onRowClick={(r) => edit({ kind: "note", entry: r })}
          onDelete={del("notes")}
          emptyTitle="Sin notas"
          emptyAction={<Button size="sm" variant="secondary" icon={<Plus />} onClick={() => open("note")}>Nueva nota</Button>}
          initialSort={{ key: "date", dir: "desc" }}
          columns={[
            { key: "date", label: "Fecha", mobile: "meta", render: (r) => formatShortDate(r.date), sortValue: (r) => r.date },
            { key: "body", label: "Nota", mobile: "title", render: (r) => <span className="line-clamp-2 whitespace-pre-line">{r.body}</span> },
          ]}
        />
      )}
    </div>
  );
}
