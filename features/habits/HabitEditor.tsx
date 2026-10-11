"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { Field, NumberStepper, Select, Switch, TextInput, WeekdayPicker } from "@/components/ui/Inputs";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { HABIT_ICONS, HABIT_KIND_HINTS, HABIT_KIND_LABELS } from "@/lib/constants";
import { useAction } from "@/features/offline/useMutation";
import type { HabitKind } from "@/types/db";
import type { Habit } from "@/types/domain";
import { removeHabit, saveHabit } from "./actions";

const KINDS = Object.keys(HABIT_KIND_LABELS) as HabitKind[];

export function HabitEditor({ habit, open, onClose, workoutDays }: { habit: Habit | null; open: boolean; onClose: () => void; workoutDays: number[] }) {
  return (
    <Sheet open={open} onClose={onClose} title={habit ? "Editar hábito" : "Nuevo hábito"}>
      {open && <HabitForm key={habit?.id ?? "new"} habit={habit} onDone={onClose} workoutDays={workoutDays} />}
    </Sheet>
  );
}

function HabitForm({ habit, onDone, workoutDays }: { habit: Habit | null; onDone: () => void; workoutDays: number[] }) {
  const firstSchedule = habit?.schedules[0];
  const [name, setName] = useState(habit?.name ?? "");
  const [icon, setIcon] = useState(habit?.icon ?? "check");
  const [kind, setKind] = useState<HabitKind>(habit?.kind ?? "check");
  const [weekdays, setWeekdays] = useState<number[]>(habit ? habit.schedules.map((s) => s.weekday).sort() : [1, 2, 3, 4, 5, 6, 7]);
  const [target, setTarget] = useState<number | null>(firstSchedule?.target_value ?? (kind === "cardio" ? 30 : 1));
  const [unit, setUnit] = useState(firstSchedule?.unit ?? "");
  const [required, setRequired] = useState(habit?.required ?? true);
  const [active, setActive] = useState(habit?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const save = useAction();
  const del = useAction();
  const needsTarget = kind === "quantity" || kind === "cardio";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Ponle un nombre");
    const days = kind === "workout" ? workoutDays : weekdays;
    if (!days.length) return setError("Elige al menos un día");
    const res = await save.run(() =>
      saveHabit({
        id: habit?.id,
        name: name.trim(),
        icon,
        kind,
        required,
        active,
        weekdays: days,
        targetValue: needsTarget ? target : null,
        unit: kind === "cardio" ? "min" : needsTarget ? unit || null : null,
      }),
    );
    if (res.ok) onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="flex gap-3">
        <Field label="Nombre" htmlFor="h-name" className="flex-1">
          <TextInput id="h-name" data-autofocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Agua, leer, estiramientos…" />
        </Field>
      </div>

      <Field label="Icono">
        <div role="radiogroup" aria-label="Icono" className="flex flex-wrap gap-1.5">
          {HABIT_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={icon === i}
              aria-label={i}
              onClick={() => setIcon(i)}
              className={cn(
                "flex size-9 items-center justify-center rounded-[8px] transition-colors",
                icon === i ? "bg-surface text-ink shadow-card" : "bg-field shadow-hairline text-ink-3 hover:text-ink",
              )}
            >
              <HabitIcon name={i} />
            </button>
          ))}
        </div>
      </Field>

      <Field label="Tipo" htmlFor="h-kind" hint={HABIT_KIND_HINTS[kind]}>
        <Select id="h-kind" value={kind} onChange={(e) => setKind(e.target.value as HabitKind)}>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {HABIT_KIND_LABELS[k]}
            </option>
          ))}
        </Select>
      </Field>

      {needsTarget && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Objetivo diario">
            <NumberStepper label="Objetivo" value={target} onChange={setTarget} step={kind === "cardio" ? 5 : unit === "L" ? 0.25 : 1} decimals={2} min={0} />
          </Field>
          {kind === "quantity" ? (
            <Field label="Unidad" htmlFor="h-unit">
              <TextInput id="h-unit" value={unit} maxLength={12} onChange={(e) => setUnit(e.target.value)} placeholder="L, páginas…" />
            </Field>
          ) : (
            <Field label="Unidad">
              <p className="flex h-11 items-center text-sm text-ink-3 md:h-10">minutos</p>
            </Field>
          )}
        </div>
      )}

      {kind === "workout" ? (
        <p className="rounded-lg bg-field px-3 py-2 text-xs text-ink-3">Usa tus días de entrenamiento (se cambian en Entrenamiento → Días).</p>
      ) : (
        <Field label="Días">
          <WeekdayPicker value={weekdays} onChange={setWeekdays} />
        </Field>
      )}

      <div className="flex flex-col divide-y divide-line rounded-[10px] bg-inset shadow-hairline">
        <label className="flex items-center justify-between gap-3 px-3.5 py-3">
          <span>
            <span className="block text-sm">Obligatorio</span>
            <span className="block text-xs text-ink-3">Cuenta para la racha y el cumplimiento</span>
          </span>
          <Switch checked={required} onChange={setRequired} label="Obligatorio" />
        </label>
        <label className="flex items-center justify-between gap-3 px-3.5 py-3">
          <span>
            <span className="block text-sm">Activo</span>
            <span className="block text-xs text-ink-3">Los inactivos no se muestran ni cuentan</span>
          </span>
          <Switch checked={active} onChange={setActive} label="Activo" />
        </label>
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-red">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        {habit && (
          <ConfirmButton
            loading={del.pending}
            confirmLabel="¿Eliminar con historial?"
            onConfirm={async () => {
              const res = await del.run(() => removeHabit({ id: habit.id }), "Hábito eliminado");
              if (res.ok) onDone();
            }}
          />
        )}
        <Button type="submit" variant="primary" size="lg" loading={save.pending} className="ml-auto min-w-32 flex-1 md:flex-none">
          Guardar
        </Button>
      </div>
    </form>
  );
}
