"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/*
 * Loader 3×3 tipo pixel-grid (patrón de Beautiful UI):
 *   drive — celdas cuadradas con un frente en chevron que avanza a la derecha;
 *           el ciclo (650 ms) es más corto que el barrido, así siempre hay dos frentes
 *   dots  — el mismo frente con celdas redondas
 *   orbit — un cometa recorriendo el perímetro
 * Con prefers-reduced-motion la rejilla queda en su estado tenue.
 */

const chevron = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3);
  const c = i % 3;
  return (c + Math.abs(r - 1)) * 90;
});

const ORBIT_ORDER = [0, 1, 2, 5, 8, 7, 6, 3];
const orbit = Array.from({ length: 9 }, (_, i) => {
  const k = ORBIT_ORDER.indexOf(i);
  return k === -1 ? null : k * 110;
});

const PATTERNS = {
  drive: { delays: chevron as (number | null)[], dur: 650, round: false },
  dots: { delays: chevron as (number | null)[], dur: 650, round: true },
  orbit: { delays: orbit, dur: 950, round: false },
};

type Variant = keyof typeof PATTERNS;

export function LoaderGrid({
  size = 14,
  variant = "drive",
  className,
}: {
  /** lado total en px (3 celdas + 2 huecos) */
  size?: number;
  variant?: Variant;
  className?: string;
}) {
  const { delays, dur, round } = PATTERNS[variant];
  const gap = Math.max(1, size / 9);
  const cell = (size - gap * 2) / 3;
  return (
    <span
      aria-hidden
      className={cn("inline-grid shrink-0 text-current", className)}
      style={{ gridTemplateColumns: `repeat(3, ${cell}px)`, gap }}
    >
      {delays.map((delay, i) => (
        <span
          key={i}
          className={cn("bg-current", round ? "rounded-full" : "rounded-[1px]")}
          style={{
            width: cell,
            height: cell,
            opacity: delay === null ? 0.07 : 0.15,
            animation: delay === null ? "none" : `pixel-on ${dur}ms ease-in-out ${delay}ms infinite`,
          }}
        />
      ))}
    </span>
  );
}

function useElapsed(active: boolean) {
  const [ds, setDs] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setDs((d) => d + 1), 100);
    return () => clearInterval(t);
  }, [active]);
  const total = ds / 10;
  return total < 60 ? `${total.toFixed(1)}s` : `${Math.floor(total / 60)}m ${(total % 60).toFixed(1)}s`;
}

/** Loader + texto shimmer + tiempo transcurrido: "Sincronizando 1.4s" */
export function LoadingLabel({
  label,
  variant = "drive",
  showTime = true,
  className,
}: {
  label: string;
  variant?: Variant;
  showTime?: boolean;
  className?: string;
}) {
  const elapsed = useElapsed(showTime);
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex w-fit items-center gap-2.5 text-ink", className)}>
      <LoaderGrid variant={variant} size={15} />
      {label && <span className="shimmer-text text-[13px] font-medium">{label}</span>}
      {showTime && <span className="font-mono text-[12px] tabular-nums text-ink-3">{elapsed}</span>}
    </span>
  );
}
