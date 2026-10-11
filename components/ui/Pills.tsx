import type { ReactNode } from "react";
import { Check, Circle, CircleDashed, Minus, MoonStar, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { DayStatus, HabitStatus } from "@/types/domain";

type Tone = "neutral" | "accent" | "green" | "red" | "orange" | "muted";

const tones: Record<Tone, string> = {
  neutral: "bg-field text-ink-2 border-line",
  muted: "bg-transparent text-ink-3 border-line",
  accent: "bg-accent-tint text-accent border-transparent",
  green: "bg-green-tint text-green border-transparent",
  red: "bg-red-tint text-red border-transparent",
  orange: "bg-orange-tint text-orange border-transparent",
};

function Base({ tone = "neutral", className, children, title }: { tone?: Tone; className?: string; children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "tabular inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-1.5 text-[11.5px] font-medium leading-none [&_svg]:size-3",
        tones[tone],
        className,
      )}
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

const habitStatusMeta: Record<HabitStatus, { label: string; tone: Tone; icon: ReactNode }> = {
  completed: { label: "Hecho", tone: "green", icon: <Check strokeWidth={2.5} /> },
  in_progress: { label: "En curso", tone: "accent", icon: <CircleDashed strokeWidth={2.5} /> },
  pending: { label: "Pendiente", tone: "muted", icon: <Circle strokeWidth={2.5} /> },
  skipped: { label: "Saltado", tone: "neutral", icon: <Minus strokeWidth={2.5} /> },
  rest: { label: "Descanso", tone: "neutral", icon: <MoonStar strokeWidth={2.2} /> },
  missed: { label: "Fallado", tone: "red", icon: <X strokeWidth={2.5} /> },
};

const dayStatusMeta: Record<DayStatus, { label: string; tone: Tone; icon: ReactNode }> = {
  completed: habitStatusMeta.completed,
  pending: habitStatusMeta.pending,
  rest: habitStatusMeta.rest,
  failed: { label: "Fallido", tone: "red", icon: <X strokeWidth={2.5} /> },
  none: { label: "Sin datos", tone: "muted", icon: <Circle strokeWidth={2.5} /> },
};

/** Estado con icono + texto (nunca solo color). */
export function StatusPill({ status, kind = "habit", className }: { status: HabitStatus | DayStatus; kind?: "habit" | "day"; className?: string }) {
  const meta =
    kind === "day" ? dayStatusMeta[status as DayStatus] : habitStatusMeta[status as HabitStatus] ?? dayStatusMeta[status as DayStatus];
  return (
    <Base tone={meta.tone} className={className}>
      {meta.icon}
      {meta.label}
    </Base>
  );
}

export { habitStatusMeta, dayStatusMeta };
