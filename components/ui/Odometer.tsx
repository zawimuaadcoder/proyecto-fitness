"use client";

import { cn } from "@/lib/cn";

/**
 * Contador tipo odómetro: cada dígito es una columna 0–9 que se desplaza.
 * Respeta prefers-reduced-motion vía CSS global.
 */
export function Odometer({ value, className }: { value: number | string; className?: string }) {
  const chars = String(value).split("");
  return (
    <span className={cn("tabular inline-flex overflow-hidden leading-none", className)} aria-label={String(value)} role="text">
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={`${chars.length - i}`} aria-hidden className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
            <span
              className="absolute left-0 top-0 flex flex-col"
              style={{
                transform: `translateY(-${Number(ch) * 10}%)`,
                transition: "transform 520ms var(--ease-expo)",
              }}
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className="block h-[1em] text-center leading-none">
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={`s${i}`} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
