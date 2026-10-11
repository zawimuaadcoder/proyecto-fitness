"use client";

import { Check, MoonStar, X } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Flame } from "@/components/ui/Flame";
import { ProgressBar } from "@/components/ui/Progress";
import { cn } from "@/lib/cn";
import { isoWeekday, weekdayLetter, weekdayLong } from "@/lib/dates";
import type { DayStatus, StreakSummary } from "@/types/domain";
import { Celebration, type CelebrationData } from "./Celebration";

const TODAY_COPY: Record<DayStatus, string> = {
  completed: "Hoy completado",
  pending: "Hoy pendiente",
  rest: "Hoy es descanso",
  failed: "Hoy fallado",
  none: "Sin hábitos hoy",
};

export function DayDot({ status, date, isToday, size = "md" }: { status: DayStatus; date: string; isToday: boolean; size?: "sm" | "md" }) {
  const wd = isoWeekday(date);
  const future = status === "none" && !isToday;
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5" aria-label={`${weekdayLong(wd)}: ${TODAY_COPY[status].replace("Hoy ", "")}`} role="img">
      <span className={cn("text-[10.5px] font-medium", isToday ? "text-ink" : "text-ink-3")}>{weekdayLetter(wd)}</span>
      <span
        className={cn(
          "flex items-center justify-center rounded-full transition-colors [&_svg]:size-3",
          size === "md" ? "size-7" : "size-6",
          status === "completed" && "bg-orange text-canvas",
          status === "failed" && "bg-red-tint text-red",
          status === "rest" && "bg-field text-ink-3",
          status === "pending" && "border border-dashed border-orange/70 text-orange",
          future && "border border-line text-transparent",
          status === "none" && isToday && "border border-line-strong",
        )}
      >
        {status === "completed" && <Check strokeWidth={3} />}
        {status === "failed" && <X strokeWidth={3} />}
        {status === "rest" && <MoonStar strokeWidth={2.2} />}
      </span>
    </div>
  );
}

/** Card de racha diaria: elemento central del producto. */
export function StreakCard({
  streak,
  today,
  celebration,
  compact,
}: {
  streak: StreakSummary;
  today: string;
  celebration?: CelebrationData | null;
  compact?: boolean;
}) {
  const milestone = streak.milestone;
  const hot = streak.current >= 7;
  const toNext = streak.nextMilestone ? streak.nextMilestone - streak.current : null;
  const prevMilestone = [0, 7, 14, 30, 60, 100, 150, 200, 365].filter((m) => m <= streak.current).at(-1) ?? 0;

  return (
    <Card className={cn("overflow-hidden", milestone && "border-orange/40")}>
      {milestone && (
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]">
          <span className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-orange/10 to-transparent [animation:glow-sweep_2.4s_var(--ease-out)_2]" />
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink-2">
            <Flame size={milestone ? 22 : 18} state={streak.current > 0 ? "on" : "off"} />
            Racha actual
          </p>
          <p className="tabular mt-2 flex items-baseline gap-1.5 leading-none">
            <span className={cn("font-semibold tracking-tight", milestone ? "text-[44px] text-orange" : "text-[36px]")}>{streak.current}</span>
            <span className="text-sm text-ink-3">{streak.current === 1 ? "día" : "días"}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className={cn("rounded-full px-2 py-0.5 text-[12px] font-medium", streak.today === "completed" ? "bg-green-tint text-green" : streak.today === "pending" ? "bg-orange-tint text-orange" : "bg-field text-ink-3")}>
            {TODAY_COPY[streak.today]}
          </span>
          <Link href="/racha" className="tabular text-xs text-ink-3 hover:text-ink-2">
            Mejor: {streak.longest} {streak.longest === 1 ? "día" : "días"}
          </Link>
        </div>
      </div>

      {!compact && (
        <>
          <div className="mt-4 flex gap-1">
            {streak.last7.map((d) => (
              <DayDot key={d.date} status={d.status} date={d.date} isToday={d.date === today} />
            ))}
          </div>
          {streak.nextMilestone && (
            <div className="mt-4 flex items-center gap-3">
              <ProgressBar
                value={(streak.current - prevMilestone) / (streak.nextMilestone - prevMilestone)}
                tone="orange"
                height={4}
                label={`Progreso hacia ${streak.nextMilestone} días`}
              />
              <span className="tabular shrink-0 text-xs text-ink-3">
                {toNext === 1 ? "1 día" : `${toNext} días`} para {streak.nextMilestone}
              </span>
            </div>
          )}
        </>
      )}
      {celebration && <Celebration data={celebration} />}
    </Card>
  );
}
