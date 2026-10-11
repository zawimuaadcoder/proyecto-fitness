import { cn } from "@/lib/cn";

type Tone = "accent" | "green" | "orange" | "red" | "ink";

const strokeColor: Record<Tone, string> = {
  accent: "var(--accent)",
  green: "var(--green)",
  orange: "var(--orange)",
  red: "var(--red)",
  ink: "var(--ink)",
};

/** Anillo de progreso pequeño (0–1). */
export function ProgressRing({
  value,
  size = 20,
  stroke = 2.5,
  tone = "accent",
  label,
  className,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-strong)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={strokeColor[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset 600ms var(--ease-expo)" }}
        />
      </svg>
      {children && <span className="absolute inset-0 flex items-center justify-center">{children}</span>}
    </span>
  );
}

/** Barra de progreso fina. Admite exceso (>1) marcando el tope. */
export function ProgressBar({
  value,
  tone = "accent",
  label,
  className,
  height = 6,
}: {
  value: number;
  tone?: Tone;
  label?: string;
  className?: string;
  height?: number;
}) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={cn("w-full overflow-hidden rounded-full bg-field", className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${v * 100}%`,
          background: strokeColor[tone],
          transition: "width 600ms var(--ease-expo)",
        }}
      />
    </div>
  );
}

/** Fila de progreso: etiqueta, valor y barra. */
export function ProgressRow({
  label,
  value,
  max,
  unit,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  unit?: string;
  tone?: Tone;
}) {
  const ratio = max > 0 ? value / max : 0;
  const done = max > 0 && value >= max;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-[13px]">
        <span className="text-ink-2">{label}</span>
        <span className="tabular font-medium text-ink">
          {value}
          <span className="text-ink-3">
            {" "}
            / {max}
            {unit ? ` ${unit}` : ""}
          </span>
        </span>
      </div>
      <ProgressBar value={ratio} tone={tone ?? (done ? "green" : "accent")} label={`${label}: ${value} de ${max}`} />
    </div>
  );
}
