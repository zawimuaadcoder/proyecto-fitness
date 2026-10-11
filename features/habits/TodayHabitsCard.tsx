"use client";

import { ListChecks, Plus } from "lucide-react";
import { useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { ValuePill } from "@/components/ui/Pills";
import type { HabitDayResult } from "@/types/domain";
import { HabitRow } from "./HabitRow";

type Filter = "all" | "pending" | "done";

export function TodayHabitsCard({ habits, title = "Hábitos de hoy", editable = true }: { habits: HabitDayResult[]; title?: string; editable?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const isDone = (h: HabitDayResult) => h.status === "completed" || h.status === "rest";
  const required = habits.filter((h) => h.habit.required && h.status !== "rest");
  const requiredDone = required.filter((h) => h.status === "completed").length;
  const done = habits.filter(isDone).length;
  const list = habits.filter((h) => (filter === "all" ? true : filter === "done" ? isDone(h) : !isDone(h)));

  return (
    <Card>
      <CardHeader
        icon={<ListChecks />}
        title={title}
        action={
          required.length > 0 && (
            <ValuePill tone={requiredDone === required.length ? "green" : "neutral"}>
              {requiredDone} / {required.length}
            </ValuePill>
          )
        }
      />
      {habits.length === 0 ? (
        <EmptyState
          compact
          icon={<ListChecks />}
          title="No tienes hábitos para hoy"
          description="Crea hábitos diarios para empezar tu racha."
          action={
            <LinkButton href="/habitos?nuevo=1" size="sm" variant="secondary">
              <Plus /> Crear hábito
            </LinkButton>
          }
        />
      ) : (
        <>
          {habits.length > 3 && (
            <FilterChips
              label="Filtrar hábitos"
              value={filter}
              onChange={setFilter}
              className="mb-2"
              options={[
                { value: "all", label: "Todos", count: habits.length },
                { value: "pending", label: "Pendientes", count: habits.length - done },
                { value: "done", label: "Hechos", count: done },
              ]}
            />
          )}
          <ul className="-mx-2 flex flex-col">
            {list.map((h) => (
              <HabitRow key={h.habit.id} result={h} editable={editable} />
            ))}
          </ul>
          {list.length === 0 && (
            <p className="py-4 text-center text-[13px] text-ink-3">{filter === "pending" ? "Todo hecho por hoy 🎉" : "Nada por aquí todavía."}</p>
          )}
        </>
      )}
    </Card>
  );
}
