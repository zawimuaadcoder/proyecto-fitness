"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Expandable } from "@/components/ui/Expandable";
import { Field, NumberStepper, TextArea, TextInput } from "@/components/ui/Inputs";
import { useAppProfile } from "@/features/app/ProfileContext";
import { useAction, useRecordMutation } from "@/features/offline/useMutation";
import type { CardioEntryRow, NoteRow, WeightEntryRow, WorkoutEntryRow } from "@/types/db";
import { deleteEntries } from "./actions";
import { DateChooser } from "./DateChooser";
import { TypePicker } from "./TypePicker";

type Table = "weight_entries" | "workout_entries" | "cardio_entries" | "notes";

function FormShell({
  onSubmit,
  children,
  pending,
  editing,
  onDelete,
  deleting,
  submitLabel = "Guardar",
}: {
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  pending: boolean;
  editing: boolean;
  onDelete?: () => void;
  deleting?: boolean;
  submitLabel?: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {children}
      <div className="flex items-center gap-2 pt-1">
        {editing && onDelete && <ConfirmButton onConfirm={onDelete} loading={deleting} />}
        <Button type="submit" variant="primary" size="lg" loading={pending} className="ml-auto min-w-32 flex-1 md:flex-none">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function useDelete(table: Table, id: string | undefined, onDone: () => void) {
  const { run, pending } = useAction();
  return {
    deleting: pending,
    onDelete: id
      ? async () => {
          const res = await run(() => deleteEntries({ table, ids: [id] }), "Eliminado");
          if (res.ok) onDone();
        }
      : undefined,
  };
}

function MoreOptions({ children, defaultOpen }: { children: ReactNode; defaultOpen?: boolean }) {
  return (
    <Expandable
      defaultOpen={defaultOpen}
      chevron="left"
      headerClassName="h-8 text-[13px] text-ink-3 hover:text-ink-2"
      header={<span>Más opciones</span>}
    >
      <div className="flex flex-col gap-4 pt-3">{children}</div>
    </Expandable>
  );
}

// ---------------------------------------------------------------------------

export function WeightForm({ initial, onDone }: { initial?: WeightEntryRow; onDone: () => void }) {
  const app = useAppProfile();
  const [weight, setWeight] = useState<number | null>(initial ? Number(initial.weight) : app.lastWeight);
  const [date, setDate] = useState(initial?.date ?? app.today);
  const [time, setTime] = useState(initial?.time?.slice(0, 5) ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const { run, pending } = useRecordMutation();
  const del = useDelete("weight_entries", initial?.id, onDone);
  const unit = initial?.unit ?? app.weightUnit;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!weight || weight <= 0) return setError("Introduce un peso");
    const res = await run("weight", { id: initial?.id, date, time: time || null, weight, unit, note: note || null });
    if (res.ok) onDone();
  }

  return (
    <FormShell onSubmit={submit} pending={pending} editing={Boolean(initial)} {...del}>
      <Field label={`Peso (${unit})`} error={error}>
        <NumberStepper label="Peso" value={weight} onChange={(v) => { setWeight(v); setError(null); }} step={0.1} decimals={1} min={20} max={400} suffix={unit} className="h-14 text-lg md:h-12" />
      </Field>
      <Field label="Fecha">
        <DateChooser value={date} onChange={setDate} today={app.today} />
      </Field>
      <MoreOptions defaultOpen={Boolean(initial?.time || initial?.note)}>
        <Field label="Hora (opcional)" htmlFor="w-time">
          <TextInput id="w-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <Field label="Nota (opcional)" htmlFor="w-note">
          <TextInput id="w-note" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="En ayunas, después de viaje…" />
        </Field>
      </MoreOptions>
    </FormShell>
  );
}

export function WorkoutForm({ initial, onDone, defaultType }: { initial?: WorkoutEntryRow; onDone: () => void; defaultType?: string }) {
  const app = useAppProfile();
  const [type, setType] = useState(initial?.workout_type ?? defaultType ?? app.lastWorkoutType ?? app.workoutTypes[0]);
  const [date, setDate] = useState(initial?.date ?? app.today);
  const [duration, setDuration] = useState<number | null>(initial?.duration_min ?? null);
  const [note, setNote] = useState(initial?.note ?? "");
  const { run, pending } = useRecordMutation();
  const del = useDelete("workout_entries", initial?.id, onDone);
  const isRest = type === "Descanso";

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await run(
      "workout",
      { id: initial?.id, date, workoutType: type, durationMin: isRest ? null : duration, note: note || null },
      { success: isRest ? "Descanso registrado" : "Entreno guardado" },
    );
    if (res.ok) onDone();
  }

  return (
    <FormShell onSubmit={submit} pending={pending} editing={Boolean(initial)} {...del}>
      <Field label="Tipo">
        <TypePicker types={app.workoutTypes} value={type} onChange={setType} category="workout" label="Tipo de entrenamiento" />
      </Field>
      {isRest && <p className="-mt-2 text-xs text-ink-3">Un descanso planificado no rompe tu racha.</p>}
      <Field label="Fecha">
        <DateChooser value={date} onChange={setDate} today={app.today} />
      </Field>
      <MoreOptions defaultOpen={Boolean(initial?.duration_min || initial?.note)}>
        {!isRest && (
          <Field label="Duración (min, opcional)">
            <NumberStepper label="Duración" value={duration} onChange={setDuration} step={5} max={600} suffix="min" />
          </Field>
        )}
        <Field label="Nota (opcional)" htmlFor="wo-note">
          <TextInput id="wo-note" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Sentadilla 5×5…" />
        </Field>
      </MoreOptions>
    </FormShell>
  );
}

export function CardioForm({ initial, onDone }: { initial?: CardioEntryRow; onDone: () => void }) {
  const app = useAppProfile();
  const [type, setType] = useState(initial?.cardio_type ?? app.lastCardioType ?? app.cardioTypes[0]);
  const [minutes, setMinutes] = useState<number | null>(initial?.minutes ?? 30);
  const [date, setDate] = useState(initial?.date ?? app.today);
  const [distance, setDistance] = useState<number | null>(initial?.distance_km != null ? Number(initial.distance_km) : null);
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const { run, pending } = useRecordMutation();
  const del = useDelete("cardio_entries", initial?.id, onDone);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!minutes || minutes < 1) return setError("Introduce los minutos");
    const res = await run(
      "cardio",
      { id: initial?.id, date, cardioType: type, minutes: Math.round(minutes), distanceKm: distance, note: note || null },
      { success: "Cardio guardado" },
    );
    if (res.ok) onDone();
  }

  return (
    <FormShell onSubmit={submit} pending={pending} editing={Boolean(initial)} {...del}>
      <Field label="Tipo">
        <TypePicker types={app.cardioTypes} value={type} onChange={setType} category="cardio" label="Tipo de cardio" />
      </Field>
      <Field label="Minutos" error={error}>
        <NumberStepper label="Minutos" value={minutes} onChange={(v) => { setMinutes(v); setError(null); }} step={5} min={0} max={1440} suffix="min" className="h-14 text-lg md:h-12" />
      </Field>
      <Field label="Fecha">
        <DateChooser value={date} onChange={setDate} today={app.today} />
      </Field>
      <MoreOptions defaultOpen={Boolean(initial?.distance_km || initial?.note)}>
        <Field label="Distancia (km, opcional)">
          <NumberStepper label="Distancia" value={distance} onChange={setDistance} step={0.5} decimals={2} max={500} suffix="km" />
        </Field>
        <Field label="Nota (opcional)" htmlFor="c-note">
          <TextInput id="c-note" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </MoreOptions>
    </FormShell>
  );
}

export function NoteForm({ initial, onDone }: { initial?: NoteRow; onDone: () => void }) {
  const app = useAppProfile();
  const [body, setBody] = useState(initial?.body ?? "");
  const [date, setDate] = useState(initial?.date ?? app.today);
  const { run, pending } = useRecordMutation();
  const del = useDelete("notes", initial?.id, onDone);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const res = await run("note", { id: initial?.id, date, body }, { success: "Nota guardada" });
    if (res.ok) onDone();
  }

  return (
    <FormShell onSubmit={submit} pending={pending} editing={Boolean(initial)} {...del}>
      <Field label="Nota" htmlFor="n-body">
        <TextArea id="n-body" data-autofocus value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} placeholder="¿Cómo ha ido el día?" />
      </Field>
      <Field label="Fecha">
        <DateChooser value={date} onChange={setDate} today={app.today} />
      </Field>
    </FormShell>
  );
}
