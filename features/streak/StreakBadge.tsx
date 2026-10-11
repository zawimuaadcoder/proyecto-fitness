"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame, type FlameState } from "@/components/ui/Flame";
import { Odometer } from "@/components/ui/Odometer";
import { cn } from "@/lib/cn";

/** Pastilla de racha para la esquina superior. Enciende la llama una vez por día al primer registro. */
export function StreakBadge({
  streak,
  activeToday,
  profileId,
  today,
}: {
  streak: number;
  activeToday: boolean;
  profileId: string;
  today: string;
}) {
  const [igniting, setIgniting] = useState(false);
  const state: FlameState = !activeToday ? "off" : igniting ? "igniting" : "on";

  useEffect(() => {
    if (!activeToday) return;
    const key = `fs.flameLit.${profileId}`;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(key);
    } catch {}
    if (stored === today) return;
    try {
      window.localStorage.setItem(key, today);
    } catch {}
    const start = window.setTimeout(() => setIgniting(true), 0);
    const end = window.setTimeout(() => setIgniting(false), 1200);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(end);
    };
  }, [activeToday, profileId, today]);

  return (
    <Link
      href="/racha"
      aria-label={`Racha de ${streak} ${streak === 1 ? "día" : "días"}. ${activeToday ? "Hoy encendida" : "Hoy aún sin actividad"}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface py-1.5 pl-2.5 pr-3 shadow-card transition-colors hover:bg-hover"
    >
      <Flame size={22} state={state} />
      <Odometer value={streak} className={cn("text-[15px] font-semibold", activeToday ? "text-ink" : "text-ink-3")} />
    </Link>
  );
}
