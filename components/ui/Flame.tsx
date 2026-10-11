"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export type FlameState = "off" | "on" | "igniting";

const OUTER =
  "M12 1C13 7 21 11 21 21C21 27.5 17 31 12 31C7 31 3 27.5 3 21C3 15 6.5 13 8 8.5C9.5 11 10.5 11.5 10.5 11.5C11.5 8 11 4.5 12 1Z";
const MID =
  "M12 10C12.5 14 18 16.5 18 22.5C18 27 15.5 29.5 12 29.5C8.5 29.5 6 27 6 22.5C6 18.5 9.5 17 10 13.5C11 14.5 11.5 12 12 10Z";
const CORE =
  "M12 19C12.8 21.5 15.5 23 15.5 26C15.5 28.2 14 29.5 12 29.5C10 29.5 8.5 28.2 8.5 26C8.5 23.5 11 22 12 19Z";

const SPARKS = [
  { dx: -7, rise: 1.0, delay: 80 },
  { dx: 5, rise: 1.3, delay: 140 },
  { dx: -3, rise: 1.6, delay: 220 },
  { dx: 8, rise: 0.9, delay: 300 },
  { dx: -9, rise: 1.2, delay: 360 },
  { dx: 2, rise: 1.5, delay: 440 },
];

/** Llama de racha: SVG propio con tres capas animadas por CSS (`flame-*` en globals.css). */
export function Flame({ size = 28, state = "on", className }: { size?: number; state?: FlameState; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const g = (n: string) => `${uid}-${n}`;
  return (
    <span
      aria-hidden
      className={cn("flame-root", `flame-${state}`, className)}
      style={{ height: size, width: (size * 24) / 32 }}
    >
      <span className="flame-glow" />
      <span className="flame-ring" />
      {SPARKS.map((p, i) => (
        <span
          key={i}
          className="flame-spark"
          style={{ ["--flame-dx" as string]: `${(p.dx * size) / 28}px`, ["--flame-rise" as string]: p.rise, ["--flame-delay" as string]: `${p.delay}ms` }}
        />
      ))}
      <svg className="flame-svg" viewBox="0 0 24 32" fill="none">
        <defs>
          <linearGradient id={g("o")} x1="12" y1="31" x2="12" y2="1" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="oklch(0.68 0.19 40)" />
            <stop offset="1" stopColor="oklch(0.80 0.16 70)" />
          </linearGradient>
          <linearGradient id={g("m")} x1="12" y1="29.5" x2="12" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="oklch(0.78 0.17 65)" />
            <stop offset="1" stopColor="oklch(0.89 0.15 95)" />
          </linearGradient>
          <linearGradient id={g("c")} x1="12" y1="29.5" x2="12" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="oklch(0.93 0.1 95)" />
            <stop offset="1" stopColor="oklch(0.98 0.03 100)" />
          </linearGradient>
        </defs>
        <g className="flame-grey">
          <path className="flame-layer" d={OUTER} fill="var(--ink-3)" fillOpacity={0.45} />
          <path className="flame-layer" d={MID} fill="var(--ink-3)" fillOpacity={0.6} />
          <path className="flame-layer" d={CORE} fill="var(--ink-3)" fillOpacity={0.8} />
        </g>
        <g className="flame-color">
          <path className="flame-layer flame-outer" d={OUTER} fill={`url(#${g("o")})`} />
          <path className="flame-layer flame-mid" d={MID} fill={`url(#${g("m")})`} />
          <path className="flame-layer flame-core" d={CORE} fill={`url(#${g("c")})`} />
        </g>
      </svg>
    </span>
  );
}
