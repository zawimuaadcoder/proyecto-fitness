"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useElementWidth } from "@/hooks/useElementWidth";
import { extent, monotonePath } from "./geometry";

/** Sparkline para cards (sin interacción). */
export function Sparkline({
  values,
  height = 32,
  color = "var(--ink-2)",
  className,
  label,
}: {
  values: number[];
  height?: number;
  color?: string;
  className?: string;
  label?: string;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>(120);
  const [min, max] = extent(values, 0.15);
  const pts = values.map((v, i) => ({
    x: values.length <= 1 ? width / 2 : 2 + (i / (values.length - 1)) * (width - 4),
    y: 2 + (height - 4) - ((v - min) / (max - min)) * (height - 4),
  }));
  const last = pts.at(-1);
  return (
    <div ref={ref} className={cn("w-full", className)} style={{ height }}>
      {values.length > 1 && (
        <svg width={width} height={height} role="img" aria-label={label} aria-hidden={!label} className="block overflow-visible">
          <path d={monotonePath(pts)} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
          {last && <circle cx={last.x} cy={last.y} r={2.5} fill={color} />}
        </svg>
      )}
    </div>
  );
}

/**
 * Mini barras (minutos por día, etc.). Tap/hover muestra el valor: el tooltip
 * aparece encima de la barra activa.
 */
export function MiniBars({
  values,
  labels,
  unit = "",
  height = 64,
  highlight,
  target,
  className,
  ariaLabel,
}: {
  values: number[];
  labels: string[];
  unit?: string;
  height?: number;
  highlight?: number;
  target?: number;
  className?: string;
  ariaLabel: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, target ?? 0, ...values);
  const barArea = height - 16;
  return (
    <div className={cn("relative", className)} role="img" aria-label={ariaLabel}>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {values.map((v, i) => {
          const h = v > 0 ? Math.max(3, (v / max) * barArea) : 2;
          const isActive = active === i;
          return (
            <button
              key={i}
              type="button"
              aria-label={`${labels[i]}: ${v} ${unit}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
              onClick={() => setActive(isActive ? null : i)}
              className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1 outline-none"
            >
              {isActive && (
                <span className="animate-pop-in tabular absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium shadow-overlay [background:var(--tooltip-bg)] [color:var(--tooltip-fg)]">
                  {v} {unit}
                </span>
              )}
              <span
                className={cn(
                  "w-full max-w-6 rounded-[4px] transition-[height,background-color] duration-500 ease-[var(--ease-expo)]",
                  v === 0 ? "bg-field" : i === highlight || isActive ? "bg-accent" : "bg-ink-3/60",
                )}
                style={{ height: h }}
              />
              <span className={cn("text-[10px] leading-none", i === highlight ? "font-semibold text-ink" : "text-ink-3")}>{labels[i]}</span>
            </button>
          );
        })}
      </div>
      {target != null && target > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line-strong"
          style={{ bottom: 16 + (target / max) * barArea + 1 }}
        />
      )}
    </div>
  );
}

/** Comparación A vs B en dos barras horizontales. */
export function CompareBars({
  labels,
  values,
  unit,
  format = (v: number) => String(v),
  className,
}: {
  labels: [string, string];
  values: [number, number];
  unit: string;
  format?: (v: number) => string;
  className?: string;
}) {
  const [lo] = extent(values, 0.6);
  const base = unit === "%" ? 0 : Math.max(0, lo);
  const span = Math.max(...values) - base || 1;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="w-[86px] shrink-0 truncate text-[11px] text-ink-3">{labels[i]}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-field">
            <div
              className={cn("h-full rounded-full", i === 1 ? "bg-accent" : "bg-ink-3/70")}
              style={{ width: `${Math.max(4, ((v - base) / span) * 100)}%`, transition: "width 600ms var(--ease-expo)" }}
            />
          </div>
          <span className="tabular w-16 shrink-0 text-right text-xs font-medium text-ink">
            {format(v)}
            {unit === "%" ? "%" : ` ${unit}`}
          </span>
        </div>
      ))}
    </div>
  );
}
