"use client";

import { Plus, Target } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { Switch } from "@/components/ui/Inputs";
import { EntityChip } from "@/components/ui/Pills";
import { Highlight, SearchList } from "@/components/ui/SearchList";
import { cn } from "@/lib/cn";
import { HABIT_KIND_LABELS } from "@/lib/constants";
import { weekdayLetter } from "@/lib/dates";
import { GROUP_HABIT_POINTS, isGroupHabit } from "@/lib/domain/group-habits";
import { formatNumber } from "@/lib/format";
import { useAction } from "@/features/offline/useMutation";
import type { Habit } from "@/types/domain";
import { toggleHabitActive } from "./actions";
import { HabitEditor } from "./HabitEditor";

function scheduleLabel(h: Habit) {
  const days = h.schedules.map((s) => s.weekday).sort();
  if (days.length === 7) return "Todos los días";
  if (days.join() === "1,2,3,4,5") return "Lunes a viernes";
  return days.map(weekdayLetter).join(" · ");
}

/** Gestión de hábitos con búsqueda rápida y editor en hoja. */
export function HabitManager({ habits, workoutDays }: { habits: Habit[]; workoutDays: number[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [editing, setEditing] = useState<Habit | null>(null);
  const [open, setOpen] = useState(params.get("nuevo") === "1");
  const { run } = useAction();

  function openEditor(h: Habit | null) {
    setEditing(h);
    setOpen(true);
  }

  return (
    <Card>
      <CardHeader
        icon={<Target />}
        title="Todos los hábitos"
        subtitle={`${habits.filter((h) => h.active).length} activos`}
        action={
          <Button size="sm" variant="secondary" icon={<Plus />} onClick={() => openEditor(null)}>
            Crear hábito
          </Button>
        }
      />
      {habits.length === 0 ? (
        <EmptyState
          icon={<Target />}
          title="No tienes hábitos configurados"
          description="Los hábitos obligatorios definen cuándo un día suma a tu racha."
          action={
            <Button size="sm" variant="secondary" icon={<Plus />} onClick={() => openEditor(null)}>
              Crear hábito
            </Button>
          }
        />
      ) : (
        <SearchList
          items={habits}
          label="Buscar hábito"
          placeholder="Buscar hábito…"
          getKey={(h) => h.id}
          getText={(h) => `${h.name} ${HABIT_KIND_LABELS[h.kind]}`}
          // Los hábitos del grupo están bloqueados: no se abren en el editor.
          onSelect={(h) => !isGroupHabit(h) && openEditor(h)}
          emptyText="Ningún hábito coincide"
          renderItem={(h, { query }) => {
            const target = h.schedules[0]?.target_value;
            const group = isGroupHabit(h);
            return (
              <div className={cn("flex min-h-14 items-center gap-3 px-2 py-2", !h.active && "opacity-55")}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-field text-ink-2">
                  <HabitIcon name={h.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    <Highlight text={h.name} query={query} />
                  </span>
                  <span className="block truncate text-xs text-ink-3">
                    {scheduleLabel(h)}
                    {target != null && ` · ${formatNumber(target, 2)} ${h.schedules[0]?.unit ?? ""}`}
                    {group && ` · ${GROUP_HABIT_POINTS} pts en la liga`}
                  </span>
                </span>
                <span className="hidden gap-1 sm:flex">
                  <EntityChip>{HABIT_KIND_LABELS[h.kind]}</EntityChip>
                  {h.required && !group && <EntityChip color="var(--orange)">Obligatorio</EntityChip>}
                </span>
                {group ? (
                  <EntityChip color="var(--orange)">Grupo</EntityChip>
                ) : (
                  <span onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={h.active}
                      label={`${h.active ? "Desactivar" : "Activar"} ${h.name}`}
                      onChange={async (v) => {
                        await run(() => toggleHabitActive({ id: h.id, active: v }), v ? "Hábito activado" : "Hábito desactivado");
                        router.refresh();
                      }}
                    />
                  </span>
                )}
              </div>
            );
          }}
        />
      )}
      <HabitEditor habit={editing} open={open} onClose={() => setOpen(false)} workoutDays={workoutDays} />
    </Card>
  );
}
