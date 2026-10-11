"use client";

import { useEffect, useMemo, useState } from "react";
import { markCelebrationSeen } from "@/features/settings/actions";

export interface CelebrationData {
  kind: "milestone" | "record" | "perfect_day" | "perfect_week";
  value: number;
  date: string;
}

const COPY: Record<CelebrationData["kind"], (v: number) => string> = {
  milestone: (v) => `${v} días seguidos`,
  record: (v) => `Nuevo récord: ${v} días`,
  perfect_day: () => "Día completado",
  perfect_week: () => "Semana al 100%",
};

const COLORS = ["var(--orange)", "var(--accent)", "var(--green)", "var(--ink-2)"];

/**
 * Celebración contenida: microconfeti de 14 piezas + mensaje discreto.
 * Se muestra una sola vez (se marca como vista en streak_events).
 */
export function Celebration({ data }: { data: CelebrationData }) {
  const [visible, setVisible] = useState(true);
  const big = data.kind !== "perfect_day";

  const pieces = useMemo(
    () =>
      Array.from({ length: big ? 18 : 10 }, (_, i) => {
        const angle = (i / (big ? 18 : 10)) * Math.PI * 2 + (i % 3) * 0.3;
        const dist = 40 + ((i * 37) % 50);
        return {
          dx: `${Math.cos(angle) * dist}px`,
          dy: `${Math.sin(angle) * dist - 20}px`,
          rot: `${(i * 67) % 360}deg`,
          color: COLORS[i % COLORS.length],
          delay: (i % 5) * 30,
        };
      }),
    [big],
  );

  useEffect(() => {
    void markCelebrationSeen({ date: data.date, kind: data.kind, value: data.value }).catch(() => undefined);
    const t = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(t);
  }, [data]);

  if (!visible) return null;

  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-0 flex items-start justify-end p-3">
      <span className="absolute right-12 top-10">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute block size-1.5 rounded-[1px] opacity-0"
            style={
              {
                background: p.color,
                "--dx": p.dx,
                "--dy": p.dy,
                "--rot": p.rot,
                animation: `confetti 1100ms ${p.delay}ms var(--ease-out) both`,
              } as React.CSSProperties
            }
          />
        ))}
      </span>
      <span className="animate-pop-in mt-12 rounded-full bg-orange-tint shadow-[0_0_0_1px_color-mix(in_oklch,var(--orange)_28%,transparent)] px-2.5 py-1 text-xs font-medium text-orange">
        {COPY[data.kind](data.value)}
      </span>
    </div>
  );
}
