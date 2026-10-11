import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { DayStatus, HabitStatus } from "@/types/domain";

/* Chips y pills en el lenguaje de Beautiful UI: píldoras completas, tintes de
 * color semántico con un anillo de 1px al 28 %, y punto inicial en los estados. */

type Tone = "neutral" | "accent" | "green" | "red" | "orange" | "muted";

const tones: Record<Tone, { cls: string; ring: string; dot: string }> = {
  neutral: { cls: "bg-field text-ink-2", ring: "var(--shadow-hairline)", dot: "bg-ink-3" },
  muted: { cls: "bg-transparent text-ink-3", ring: "var(--shadow-hairline)", dot: "bg-ink-3" },
  accent: { cls: "bg-accent-tint text-accent-ink", ring: "0 0 0 1px color-mix(in oklch, var(--accent) 28%, transparent)", dot: "bg-accent" },
  green: { cls: "bg-green-tint text-green", ring: "0 0 0 1px color-mix(in oklch, var(--green) 28%, transparent)", dot: "bg-green" },
  red: { cls: "bg-red-tint text-red", ring: "0 0 0 1px color-mix(in oklch, var(--red) 28%, transparent)", dot: "bg-red" },
  orange: { cls: "bg-orange-tint text-orange", ring: "0 0 0 1px color-mix(in oklch, var(--orange) 28%, transparent)", dot: "bg-orange" },
};

function Base({ tone = "neutral", className, children, title }: { tone?: Tone; className?: string; children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "tabular inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[12px] font-medium leading-none [&_svg]:size-3",
        tones[tone].cls,
        className,
      )}
      style={{ boxShadow: tones[tone].ring }}
    >
      {children}
    </span>
  );
}

/** Valor numérico compacto: "4 / 4", "92%" */
export function ValuePill({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <Base tone={tone} className={className}>
      {children}
    </Base>
  );
}

/** Métrica con signo: "+28 min". Color solo si tiene significado. */
export function MetricChip({
  label,
  value,
  tone = "neutral",
  className,
}: {
  label?: ReactNode;
  value: ReactNode;
  tone?: "positive" | "negative" | "neutral";
  className?: string;
}) {
  return (
    <Base tone={tone === "positive" ? "green" : tone === "negative" ? "red" : "neutral"} className={className}>
      {label && <span className="font-normal opacity-75">{label}</span>}
      {value}
    </Base>
  );
}

/** Entidad (tipo de entreno, perfil…): "Pierna", "🔥 18 días" */
export function EntityChip({ icon, children, color, className }: { icon?: ReactNode; children: ReactNode; color?: string; className?: string }) {
  return (
    <Base tone="neutral" className={className}>
      {color && <span className="size-1.5 rounded-full" style={{ background: color }} aria-hidden />}
      {icon}
      {children}
    </Base>
  );
}

const habitStatusMeta: Record<HabitStatus, { label: string; tone: Tone }> = {
  completed: { label: "Hecho", tone: "green" },
  in_progress: { label: "En curso", tone: "accent" },
  pending: { label: "Pendiente", tone: "muted" },
  skipped: { label: "Saltado", tone: "neutral" },
  rest: { label: "Descanso", tone: "neutral" },
  missed: { label: "Fallado", tone: "red" },
};

const dayStatusMeta: Record<DayStatus, { label: string; tone: Tone }> = {
  completed: habitStatusMeta.completed,
  pending: habitStatusMeta.pending,
  rest: habitStatusMeta.rest,
  failed: { label: "Fallido", tone: "red" },
  none: { label: "Sin datos", tone: "muted" },
};

/** Estado con punto + texto (nunca solo color). */
export function StatusPill({ status, kind = "habit", className }: { status: HabitStatus | DayStatus; kind?: "habit" | "day"; className?: string }) {
  const meta =
    kind === "day" ? dayStatusMeta[status as DayStatus] : habitStatusMeta[status as HabitStatus] ?? dayStatusMeta[status as DayStatus];
  return (
    <Base tone={meta.tone} className={cn("gap-1.5 pl-1.5", className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", tones[meta.tone].dot, meta.tone === "muted" && "bg-transparent ring-1 ring-ink-3")} />
      {meta.label}
    </Base>
  );
}

export { habitStatusMeta, dayStatusMeta };
