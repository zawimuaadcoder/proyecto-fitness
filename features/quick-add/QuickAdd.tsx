"use client";

import { Activity, Check, ChevronLeft, Dumbbell, NotebookPen, Plus, Scale, Target } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { IconButton } from "@/components/ui/Button";
import { NumberStepper } from "@/components/ui/Inputs";
import { SearchList, Highlight } from "@/components/ui/SearchList";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { useAppProfile, type QuickHabit } from "@/features/app/ProfileContext";
import { CardioForm, NoteForm, WeightForm, WorkoutForm } from "@/features/entries/forms";
import { useRecordMutation } from "@/features/offline/useMutation";
import type { CardioEntryRow, NoteRow, WeightEntryRow, WorkoutEntryRow } from "@/types/db";
import type { QuickAddKind } from "@/types/domain";

type EditTarget =
  | { kind: "weight"; entry?: WeightEntryRow }
  | { kind: "workout"; entry?: WorkoutEntryRow; defaultType?: string }
  | { kind: "cardio"; entry?: CardioEntryRow }
  | { kind: "note"; entry?: NoteRow }
  | { kind: "habit" };

interface QuickAddApi {
  open: (kind?: QuickAddKind) => void;
  edit: (target: EditTarget) => void;
}

const QuickAddContext = createContext<QuickAddApi | null>(null);

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error("useQuickAdd fuera de QuickAddProvider");
  return ctx;
}

const OPTIONS: { kind: QuickAddKind; label: string; icon: ReactNode; hint: string }[] = [
  { kind: "weight", label: "Peso", icon: <Scale />, hint: "Registro diario" },
  { kind: "workout", label: "Entreno", icon: <Dumbbell />, hint: "Sesión o descanso" },
  { kind: "cardio", label: "Cardio", icon: <Activity />, hint: "Minutos y tipo" },
  { kind: "habit", label: "Hábito", icon: <Target />, hint: "Marcar progreso" },
  { kind: "note", label: "Nota", icon: <NotebookPen />, hint: "Cómo ha ido" },
];

const TITLES: Record<QuickAddKind, string> = {
  weight: "Registrar peso",
  workout: "Registrar entreno",
  cardio: "Registrar cardio",
  habit: "Hábitos de hoy",
  note: "Nueva nota",
};

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [openSheet, setOpenSheet] = useState(false);
  const [target, setTarget] = useState<EditTarget | null>(null);

  const api = useMemo<QuickAddApi>(
    () => ({
      open: (kind) => {
        setTarget(kind ? ({ kind } as EditTarget) : null);
        setOpenSheet(true);
      },
      edit: (t) => {
        setTarget(t);
        setOpenSheet(true);
      },
    }),
    [],
  );

  const close = useCallback(() => setOpenSheet(false), []);
  const editing = target && "entry" in target && target.entry;
  const title = target
    ? editing
      ? TITLES[target.kind].replace("Registrar", "Editar").replace("Nueva", "Editar")
      : TITLES[target.kind]
    : "Registro rápido";

  return (
    <QuickAddContext.Provider value={api}>
      {children}
      <Sheet
        open={openSheet}
        onClose={close}
        title={
          <span className="flex items-center gap-1">
            {target && !editing && (
              <IconButton label="Volver" size="sm" className="-ml-2" onClick={() => setTarget(null)}>
                <ChevronLeft />
              </IconButton>
            )}
            {title}
          </span>
        }
      >
        {!target && (
          <div className="grid grid-cols-2 gap-2 pb-2 sm:grid-cols-3">
            {OPTIONS.map((o, i) => (
              <button
                key={o.kind}
                type="button"
                onClick={() => setTarget({ kind: o.kind } as EditTarget)}
                style={{ animationDelay: `${i * 30}ms` }}
                className="animate-fade-up flex flex-col items-start gap-3 rounded-xl border border-line bg-field p-3.5 text-left transition-colors hover:border-line-strong hover:bg-hover [&_svg]:size-[18px]"
              >
                <span className="text-ink-2">{o.icon}</span>
                <span>
                  <span className="block text-sm font-medium text-ink">{o.label}</span>
                  <span className="block text-xs text-ink-3">{o.hint}</span>
                </span>
              </button>
            ))}
          </div>
        )}
        {target?.kind === "weight" && <WeightForm key={target.entry?.id ?? "new"} initial={target.entry} onDone={close} />}
        {target?.kind === "workout" && (
          <WorkoutForm key={target.entry?.id ?? "new"} initial={target.entry} defaultType={target.defaultType} onDone={close} />
        )}
        {target?.kind === "cardio" && <CardioForm key={target.entry?.id ?? "new"} initial={target.entry} onDone={close} />}
        {target?.kind === "note" && <NoteForm key={target.entry?.id ?? "new"} initial={target.entry} onDone={close} />}
        {target?.kind === "habit" && <HabitQuickList onJump={(kind) => setTarget({ kind } as EditTarget)} />}
      </Sheet>
    </QuickAddContext.Provider>
  );
}

function HabitQuickList({ onJump }: { onJump: (kind: "weight" | "workout" | "cardio") => void }) {
  const { habits, today } = useAppProfile();
  const { run } = useRecordMutation();
  const [selected, setSelected] = useState<QuickHabit | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const list = habits.filter((h) => h.scheduledToday);

  async function select(h: QuickHabit) {
    if (h.kind === "weight" || h.kind === "workout" || h.kind === "cardio") return onJump(h.kind);
    if (h.kind === "quantity") {
      setSelected(h);
      setAmount(h.value ?? 0);
      return;
    }
    await run("habitLog", { habitId: h.id, date: today, status: h.done ? "clear" : "completed" }, { success: h.done ? "Desmarcado" : "Hecho ✓" });
  }

  if (selected) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-2">
          {selected.name} · objetivo {formatNumber(selected.target ?? 1, 2)} {selected.unit}
        </p>
        <NumberStepper label={selected.name} value={amount} onChange={setAmount} step={selected.unit === "L" ? 0.25 : 1} decimals={2} suffix={selected.unit ?? ""} className="h-14 text-lg" />
        <button
          type="button"
          onClick={async () => {
            const v = amount ?? 0;
            await run("habitLog", {
              habitId: selected.id,
              date: today,
              value: v,
              status: v >= (selected.target ?? 1) ? "completed" : v > 0 ? "in_progress" : "clear",
            });
            setSelected(null);
          }}
          className="h-12 rounded-xl bg-ink text-[15px] font-medium text-canvas"
        >
          Guardar
        </button>
      </div>
    );
  }

  return (
    <SearchList
      items={list}
      label="Buscar hábito"
      placeholder="Buscar hábito…"
      emptyText="No hay hábitos programados hoy"
      getKey={(h) => h.id}
      getText={(h) => h.name}
      onSelect={(h) => void select(h)}
      renderItem={(h, { query }) => (
        <div className="flex h-12 items-center gap-3 px-2.5">
          <span className={cn("flex size-7 items-center justify-center rounded-lg", h.done ? "bg-green-tint text-green" : "bg-field text-ink-3")}>
            {h.done ? <Check className="size-4" strokeWidth={2.5} /> : <HabitIcon name={h.icon} />}
          </span>
          <span className="flex-1 text-sm text-ink">
            <Highlight text={h.name} query={query} />
          </span>
          <span className="text-xs text-ink-3">{h.done ? "Hecho" : h.kind === "check" ? "Marcar" : "Registrar"}</span>
        </div>
      )}
    />
  );
}

/** Botón flotante "+" (móvil) */
export function QuickAddFab() {
  const { open } = useQuickAdd();
  return (
    <button
      type="button"
      aria-label="Registro rápido"
      onClick={() => open()}
      className="flex size-12 items-center justify-center rounded-2xl bg-ink text-canvas shadow-float transition-transform active:scale-95"
    >
      <Plus className="size-5" strokeWidth={2.4} />
    </button>
  );
}
