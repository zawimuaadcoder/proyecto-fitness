"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Variant = "wave" | "dots" | "orbit";

/**
 * Loader 3×3 inspirado en pixel-grid. Variantes:
 *  - wave:  onda diagonal de cuadrados
 *  - dots:  puntos redondos
 *  - orbit: celdas exteriores en rotación
 */
export function LoaderGrid({
  size = 14,
  variant = "wave",
  className,
}: {
  size?: number;
  variant?: Variant;
  className?: string;
}) {
  const gap = Math.max(1, Math.round(size / 10));
  const cell = (size - gap * 2) / 3;
  return (
    <span
      role="presentation"
      className={cn("inline-grid shrink-0 grid-cols-3 text-current", variant === "orbit" && "animate-[orbit_1.4s_linear_infinite]", className)}
      style={{ width: size, height: size, gap }}
    >
      {Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const delay = variant === "orbit" ? 0 : (row + col) * 90;
        const hidden = variant === "orbit" && i === 4;
        return (
          <span
            key={i}
            className={cn("bg-current", variant === "dots" ? "rounded-full" : "rounded-[1px]")}
            style={{
              width: cell,
              height: cell,
              opacity: hidden ? 0 : undefined,
              animation: variant === "orbit" ? undefined : `pixel 1.1s ${delay}ms var(--ease-out) infinite`,
            }}
          />
        );
      })}
    </span>
  );
}

/** Loader + texto shimmer + contador de tiempo: "Sincronizando 1.4s" */
export function LoadingLabel({
  label,
  variant = "wave",
  showTime = true,
  className,
}: {
  label: string;
  variant?: Variant;
  showTime?: boolean;
  className?: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!showTime) return;
    const start = performance.now();
    const id = setInterval(() => setElapsed((performance.now() - start) / 1000), 100);
    return () => clearInterval(id);
  }, [showTime]);

  return (
    <span role="status" aria-live="polite" className={cn("inline-flex items-center gap-2 text-[13px] text-ink-3", className)}>
      <LoaderGrid variant={variant} size={12} />
      <span className="shimmer-text font-medium">{label}</span>
      {showTime && <span className="tabular text-xs text-ink-3">{elapsed.toFixed(1)}s</span>}
    </span>
  );
}
