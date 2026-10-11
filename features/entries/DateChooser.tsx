"use client";

import { addDays, type ISODate } from "@/lib/dates";
import { cn } from "@/lib/cn";

/** Hoy / Ayer / fecha concreta en una sola fila compacta. */
export function DateChooser({
  value,
  onChange,
  today,
  id,
}: {
  value: ISODate;
  onChange: (d: ISODate) => void;
  today: ISODate;
  id?: string;
}) {
  const yesterday = addDays(today, -1);
  const chip = (d: ISODate, label: string) => (
    <button
      type="button"
      aria-pressed={value === d}
      onClick={() => onChange(d)}
      className={cn(
        "h-11 rounded-[10px] border px-3 text-[13px] font-medium transition-colors md:h-10",
        value === d ? "border-line-strong bg-surface text-ink shadow-card" : "border-line bg-field text-ink-3 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
  return (
    <div className="flex gap-1.5">
      {chip(today, "Hoy")}
      {chip(yesterday, "Ayer")}
      <input
        id={id}
        type="date"
        aria-label="Fecha"
        value={value}
        max={today}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className={cn(
          "tabular h-11 min-w-0 flex-1 rounded-[10px] border bg-field px-3 text-[13px] outline-none md:h-10",
          value !== today && value !== yesterday ? "border-line-strong text-ink" : "border-line text-ink-3",
        )}
      />
    </div>
  );
}
