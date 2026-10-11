"use client";

import { useId, useRef, useState, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { useElementWidth } from "@/hooks/useElementWidth";
import { extent, monotonePath } from "./geometry";

export interface LinePoint {
  key: string;
  label: string;
  value: number;
  /** Serie secundaria (p. ej. media móvil 7d) */
  secondary?: number;
}

/**
 * Gráfico de línea minimalista: curva suave, área tenue, sin grid, etiquetas
 * mínimas y tooltip al tocar/arrastrar (touch-action: pan-y para no bloquear
 * el scroll vertical en móvil).
 */
export function LineChart({
  data,
  height = 140,
  color = "var(--accent)",
  secondaryColor = "var(--ink-2)",
  primaryStyle = "dots",
  formatValue = (v) => String(v),
  primaryLabel = "Valor",
  secondaryLabel = "Media 7d",
  reference,
  className,
  ariaLabel,
}: {
  data: LinePoint[];
  height?: number;
  color?: string;
  secondaryColor?: string;
  primaryStyle?: "line" | "dots";
  formatValue?: (v: number) => string;
  primaryLabel?: string;
  secondaryLabel?: string;
  reference?: { value: number; label: string };
  className?: string;
  ariaLabel: string;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gradientId = useId();

  const padX = 6;
  const padTop = 10;
  const padBottom = 20;
  const values = data.flatMap((d) => [d.value, ...(d.secondary != null ? [d.secondary] : [])]);
  if (reference) values.push(reference.value);
  const [min, max] = extent(values);
  const innerW = Math.max(1, width - padX * 2);
  const innerH = height - padTop - padBottom;
  const x = (i: number) => padX + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => padTop + innerH - ((v - min) / (max - min)) * innerH;

  const primary = data.map((d, i) => ({ x: x(i), y: y(d.value) }));
  const secondary = data.filter((d) => d.secondary != null).map((d) => ({ x: x(data.indexOf(d)), y: y(d.secondary!) }));
  const mainLine = secondary.length ? secondary : primary;
  const areaPath = mainLine.length > 1
    ? `${monotonePath(mainLine)}L${mainLine.at(-1)!.x},${padTop + innerH}L${mainLine[0].x},${padTop + innerH}Z`
    : "";

  function pick(e: PointerEvent<SVGRectElement>) {
    if (!data.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - padX) / innerW) * (data.length - 1));
    setActive(Math.max(0, Math.min(data.length - 1, i)));
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }

  function release(e: PointerEvent<SVGRectElement>) {
    if (e.pointerType === "mouse") setActive(null);
    else hideTimer.current = setTimeout(() => setActive(null), 1800);
  }

  const activePoint = active != null ? data[active] : null;
  const labelIdx = data.length > 1 ? [0, Math.floor((data.length - 1) / 2), data.length - 1] : [0];

  return (
    <div ref={ref} className={cn("relative w-full select-none", className)} style={{ height }}>
      <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={secondary.length ? secondaryColor : color} stopOpacity={0.16} />
            <stop offset="100%" stopColor={secondary.length ? secondaryColor : color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {reference && (
          <g>
            <line x1={padX} x2={width - padX} y1={y(reference.value)} y2={y(reference.value)} stroke="var(--line-strong)" strokeDasharray="3 4" />
            <text x={width - padX} y={y(reference.value) - 4} textAnchor="end" className="fill-ink-3 text-[10px]">
              {reference.label}
            </text>
          </g>
        )}

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

        {primaryStyle === "line" || !secondary.length ? (
          <path d={monotonePath(primary)} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          primary.map((p, i) => <circle key={data[i].key} cx={p.x} cy={p.y} r={2} fill={color} opacity={0.55} />)
        )}

        {secondary.length > 1 && (
          <path d={monotonePath(secondary)} fill="none" stroke={secondaryColor} strokeWidth={1.75} strokeLinecap="round" />
        )}

        {labelIdx.map((i, n) =>
          data[i] ? (
            <text
              key={`l${i}`}
              x={x(i)}
              y={height - 4}
              textAnchor={n === 0 ? "start" : n === labelIdx.length - 1 ? "end" : "middle"}
              className="tabular fill-ink-3 text-[10px]"
            >
              {data[i].label}
            </text>
          ) : null,
        )}

        {activePoint && active != null && (
          <g>
            <line x1={x(active)} x2={x(active)} y1={padTop} y2={padTop + innerH} stroke="var(--line-strong)" />
            <circle cx={x(active)} cy={y(activePoint.value)} r={4} fill="var(--surface)" stroke={color} strokeWidth={2} />
            {activePoint.secondary != null && (
              <circle cx={x(active)} cy={y(activePoint.secondary)} r={3} fill={secondaryColor} />
            )}
          </g>
        )}

        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          style={{ touchAction: "pan-y" }}
          onPointerDown={pick}
          onPointerMove={(e) => (e.pointerType === "mouse" || e.buttons ? pick(e) : undefined)}
          onPointerUp={release}
          onPointerLeave={release}
        />
      </svg>

      {activePoint && active != null && (
        <div
          role="status"
          className="animate-fade-in pointer-events-none absolute top-0 z-10 rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 text-xs shadow-float"
          style={{
            left: Math.min(Math.max(x(active) - 60, 0), Math.max(0, width - 120)),
            width: 120,
          }}
        >
          <p className="text-ink-3">{activePoint.label}</p>
          <p className="tabular font-semibold text-ink">
            {formatValue(activePoint.value)} <span className="font-normal text-ink-3">{primaryLabel}</span>
          </p>
          {activePoint.secondary != null && (
            <p className="tabular text-ink-2">
              {formatValue(activePoint.secondary)} <span className="text-ink-3">{secondaryLabel}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
