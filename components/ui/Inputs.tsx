"use client";

import { ChevronDown, Minus, Plus } from "lucide-react";
import { forwardRef, useId, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-[8px] bg-field px-3 text-ink shadow-hairline placeholder:text-ink-3 outline-none transition-shadow duration-150 focus:shadow-[0_0_0_1px_var(--accent),0_0_0_4px_var(--accent-tint)] disabled:opacity-60";

export function Field({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-ink-2">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-red">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-3">{hint}</p>
      )}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(function TextInput(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(fieldBase, "h-11 md:h-10", className)} {...props} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<"textarea">>(function TextArea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(fieldBase, "min-h-20 resize-y py-2.5", className)} {...props} />;
});

/** Select nativo con estilo: en móvil abre el selector del sistema (mejor UX táctil). */
export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<"select">>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(fieldBase, "h-11 appearance-none pr-9 md:h-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
    </div>
  );
});

/** Input numérico pequeño con +/- (decimales con coma o punto). */
export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 99999,
  decimals = 0,
  label,
  suffix,
  className,
  id,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
  label: string;
  suffix?: string;
  className?: string;
  id?: string;
}) {
  const autoId = useId();
  const clamp = (v: number) => Math.min(max, Math.max(min, Number(v.toFixed(decimals))));
  // Texto local para poder escribir "76," antes de completar el decimal.
  const [text, setText] = useState(value == null ? "" : String(value).replace(".", ","));
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    const parsed = Number(text.replace(",", "."));
    if (text === "" ? value != null : parsed !== value) setText(value == null ? "" : String(value).replace(".", ","));
  }
  return (
    <div className={cn("flex h-11 items-center rounded-[8px] bg-field shadow-hairline focus-within:shadow-[0_0_0_1px_var(--accent),0_0_0_4px_var(--accent-tint)] md:h-10", className)}>
      <button
        type="button"
        aria-label={`Restar ${label}`}
        className="flex h-full w-10 shrink-0 items-center justify-center text-ink-3 hover:text-ink disabled:opacity-40"
        disabled={value != null && value <= min}
        onClick={() => onChange(clamp((value ?? min) - step))}
      >
        <Minus className="size-4" />
      </button>
      <input
        id={id ?? autoId}
        inputMode={decimals ? "decimal" : "numeric"}
        aria-label={label}
        className="tabular h-full min-w-0 flex-1 bg-transparent text-center font-medium outline-none"
        value={text}
        onChange={(e) => {
          const input = e.target.value;
          if (!/^\d*([.,]\d*)?$/.test(input)) return;
          setText(input);
          const raw = input.replace(",", ".");
          if (raw === "" || raw === ".") return onChange(null);
          const v = Number(raw);
          if (!Number.isNaN(v)) onChange(v);
        }}
        onBlur={() => value != null && onChange(clamp(value))}
      />
      {suffix && <span className="pr-1 text-xs text-ink-3">{suffix}</span>}
      <button
        type="button"
        aria-label={`Sumar ${label}`}
        className="flex h-full w-10 shrink-0 items-center justify-center text-ink-3 hover:text-ink disabled:opacity-40"
        disabled={value != null && value >= max}
        onClick={() => onChange(clamp((value ?? min) + step))}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50",
        checked ? "bg-ink" : "bg-line-strong",
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 size-5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-[var(--ease-out)]",
          checked ? "translate-x-4 bg-canvas" : "bg-white",
        )}
      />
    </button>
  );
}

/** Selector de días de la semana L M X J V S D (aria-pressed). */
export function WeekdayPicker({
  value,
  onChange,
  label = "Días de la semana",
}: {
  value: number[];
  onChange: (v: number[]) => void;
  label?: string;
}) {
  const letters = ["L", "M", "X", "J", "V", "S", "D"];
  const names = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
  return (
    <div role="group" aria-label={label} className="flex gap-1.5">
      {letters.map((l, i) => {
        const day = i + 1;
        const on = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            aria-pressed={on}
            aria-label={names[i]}
            onClick={() => onChange(on ? value.filter((d) => d !== day) : [...value, day].sort())}
            className={cn(
              "flex size-10 flex-1 items-center justify-center rounded-full text-[13px] font-medium transition-[background-color,color,transform] duration-150 active:scale-95 md:size-9",
              on ? "bg-ink text-canvas" : "bg-field text-ink-3 shadow-hairline hover:text-ink",
            )}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
