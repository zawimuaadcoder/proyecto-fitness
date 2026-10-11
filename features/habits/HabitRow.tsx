"use client";

import { Check, Minus, MoonStar, Plus, X } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Chevron, Collapse, DetailRail } from "@/components/ui/Expandable";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { NumberStepper } from "@/components/ui/Inputs";
import { StatusPill } from "@/components/ui/Pills";
import { ProgressRing } from "@/components/ui/Progress";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { useRecordMutation } from "@/features/offline/useMutation";
import { useQuickAdd } from "@/features/quick-add/QuickAdd";
import type { HabitDayResult, HabitStatus } from "@/types/domain";

/** Icono/estado pulsable de la fila. */
function StatusButton({
  status,
  progress,
  icon,
  label,
  onClick,
  disabled,
}: {
  status: HabitStatus;
  progress: number;
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-[10px] transition-[background-color,transform] duration-200 active:scale-90 disabled:active:scale-100",
        status === "completed" && "bg-green text-canvas",
        status === "missed" && "bg-red-tint text-red",
        status === "rest" && "bg-field text-ink-3",
        status === "skipped" && "bg-field text-ink-3",
        (status === "pending" || status === "in_progress") && "bg-field text-ink-3 hover:bg-hover hover:text-ink",
      )}
    >
      {status === "completed" ? (
        <svg viewBox="0 0 24 24" className="check-draw size-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      ) : status === "in_progress" ? (
        <ProgressRing value={progress} size={22} stroke={2.5} tone="accent" />
      ) : status === "missed" ? (
        <X className="size-4" strokeWidth={2.5} />
      ) : status === "rest" ? (
        <MoonStar className="size-4" />
      ) : status === "skipped" ? (
        <Minus className="size-4" />
      ) : (
        <HabitIcon name={icon} />
      )}
    </button>
  );
}

/**
 * Fila interactiva de hábito: icono/estado (toque rápido), nombre, valor,
 * pill de estado y detalle expandible.
 */
export function HabitRow({ result, editable = true }: { result: HabitDayResult; editable?: boolean }) {
  const { habit, date } = result;
  const [open, setOpen] = useState(false);
  const [optimistic, setOptimistic] = useOptimistic<HabitStatus, HabitStatus>(result.status, (_, next) => next);
  const [, startTransition] = useTransition();
  const { run, pending } = useRecordMutation();
  const { open: openQuick } = useQuickAdd();
  const [amount, setAmount] = useState<number | null>(result.value);
  const target = result.target ?? 1;
  const linked = habit.kind === "weight" || habit.kind === "workout" || habit.kind === "cardio";

  function log(status: "completed" | "in_progress" | "skipped" | "clear", value?: number | null, message?: string) {
    startTransition(async () => {
      setOptimistic(status === "clear" ? "pending" : status);
      await run("habitLog", { habitId: habit.id, date, status, value: value ?? null }, { success: message, silent: !message });
    });
  }

  function primaryAction() {
    if (!editable) return;
    if (linked) {
      if (habit.kind === "cardio" && result.status !== "completed") return openQuick("cardio");
      if (result.status !== "completed" && result.status !== "rest") return openQuick(habit.kind === "weight" ? "weight" : "workout");
      setOpen((o) => !o);
      return;
    }
    if (optimistic === "completed") log("clear", null);
    else if (habit.kind === "quantity") log("completed", target, "¡Hecho!");
    else log("completed", null, "¡Hecho!");
  }

  const actionLabel =
    optimistic === "completed" ? `Desmarcar ${habit.name}` : linked ? `Registrar ${habit.name}` : `Marcar ${habit.name} como hecho`;

  return (
    <li className="group">
      <div
        className={cn(
          "flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150",
          open ? "bg-hover" : "hover:bg-hover",
        )}
      >
        <StatusButton status={optimistic} progress={result.progress} icon={habit.icon} label={actionLabel} onClick={primaryAction} disabled={!editable || pending} />
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate text-[14px] font-medium", optimistic === "completed" ? "text-ink-2" : "text-ink")}>
              {habit.name}
              {!habit.required && <span className="ml-1.5 text-[11px] font-normal text-ink-3">opcional</span>}
            </span>
            {result.display && <span className="tabular block truncate text-xs text-ink-3 sm:hidden">{result.display}</span>}
          </span>
          {result.display && <span className="tabular hidden shrink-0 text-[13px] text-ink-2 sm:block">{result.display}</span>}
          <StatusPill status={optimistic} className="hidden min-[400px]:inline-flex" />
          <Chevron open={open} />
        </button>
      </div>

      <Collapse open={open}>
        <DetailRail className="mb-2 ml-[26px] mt-1 flex flex-col gap-2 py-1">
          {result.details.length > 0 && (
            <dl className="flex flex-col gap-1">
              {result.details.map((d, i) => (
                <div key={i} className="flex justify-between gap-4 text-[13px]">
                  <dt className="text-ink-3">{d.label}</dt>
                  <dd className="tabular text-ink-2">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {result.details.length === 0 && linked && <p className="text-[13px] text-ink-3">Se completa automáticamente al registrar.</p>}

          {editable && habit.kind === "quantity" && (
            <div className="flex items-center gap-2">
              <NumberStepper
                label={habit.name}
                value={amount}
                onChange={setAmount}
                step={result.unit === "L" ? 0.25 : 1}
                decimals={2}
                suffix={result.unit ?? ""}
                className="max-w-48 flex-1"
              />
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  const v = amount ?? 0;
                  log(v >= target ? "completed" : v > 0 ? "in_progress" : "clear", v, "Guardado");
                }}
              >
                Guardar
              </Button>
              <span className="tabular text-xs text-ink-3">
                / {formatNumber(target, 2)} {result.unit}
              </span>
            </div>
          )}

          {editable && (
            <div className="flex flex-wrap gap-1.5">
              {linked && (
                <Button size="sm" variant="secondary" icon={<Plus />} onClick={() => openQuick(habit.kind === "weight" ? "weight" : habit.kind === "workout" ? "workout" : "cardio")}>
                  Registrar {habit.kind === "weight" ? "peso" : habit.kind === "workout" ? "entreno" : "cardio"}
                </Button>
              )}
              {!linked && optimistic !== "completed" && (
                <Button size="sm" variant="secondary" icon={<Check />} onClick={() => log("completed", habit.kind === "quantity" ? target : null, "¡Hecho!")}>
                  Hecho
                </Button>
              )}
              {optimistic !== "skipped" && optimistic !== "completed" && !linked && (
                <Button size="sm" variant="ghost" onClick={() => log("skipped", null, "Marcado como saltado")}>
                  Saltar hoy
                </Button>
              )}
              {(optimistic === "skipped" || (optimistic === "completed" && !linked)) && (
                <Button size="sm" variant="ghost" onClick={() => log("clear", null, "Deshecho")}>
                  Deshacer
                </Button>
              )}
            </div>
          )}
        </DetailRail>
      </Collapse>
    </li>
  );
}
