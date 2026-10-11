"use client";

import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { CompareBars, MiniBars } from "@/components/charts/MiniCharts";
import { IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { useQuickAdd } from "@/features/quick-add/QuickAdd";
import type { Insight } from "@/types/domain";

function InsightCard({ insight }: { insight: Insight }) {
  const { open } = useQuickAdd();
  const c = insight.chart;
  return (
    <article className="flex h-full flex-col" aria-roledescription="insight">
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-3">
        <span
          className={cn(
            "size-1.5 rounded-full",
            insight.tone === "positive" ? "bg-green" : insight.tone === "negative" ? "bg-red" : "bg-ink-3",
          )}
          aria-hidden
        />
        {insight.title}
      </p>
      <p className="mt-1.5 min-h-10 text-[15px] font-medium leading-snug text-ink">{insight.message}</p>
      <div className="mt-auto pt-4">
        {c.type === "compare" && (
          <CompareBars labels={c.labels} values={c.values} unit={c.unit} format={(v) => formatNumber(v, c.unit === "%" ? 0 : 1)} />
        )}
        {c.type === "bars" && <MiniBars values={c.values} labels={c.labels} unit={c.unit} height={52} highlight={c.highlight} ariaLabel={insight.message} />}
        {c.type === "progress" && (
          <div className="flex items-center gap-3">
            <ProgressBar value={c.max ? c.value / c.max : 0} tone={c.value >= c.max ? "green" : "accent"} label={insight.message} />
            <span className="tabular shrink-0 text-xs text-ink-2">
              {c.value} / {c.max} {c.unit}
            </span>
          </div>
        )}
      </div>
      {insight.action && (
        <div className="mt-3">
          {insight.action.href ? (
            <Link href={insight.action.href} className="text-[13px] font-medium text-accent hover:underline">
              {insight.action.label}
            </Link>
          ) : (
            <button type="button" onClick={() => insight.action?.quickAdd && open(insight.action.quickAdd)} className="text-[13px] font-medium text-accent hover:underline">
              {insight.action.label}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

/** Carrusel de insights con altura estable (sin layout shift) y swipe nativo. */
export function InsightCarousel({ insights }: { insights: Insight[] }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(insights.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  }

  if (!insights.length) return null;

  return (
    <Card aria-roledescription="carrusel" aria-label="Insights">
      <header className="mb-3 flex items-center gap-2">
        <Lightbulb className="size-4 text-ink-3" aria-hidden />
        <h2 className="text-[13px] font-medium text-ink-2">Insights</h2>
        <span className="tabular text-xs text-ink-3">{insights.length}</span>
        <div className="ml-auto flex items-center">
          <IconButton label="Insight anterior" size="sm" onClick={() => go(index - 1)} disabled={index === 0}>
            <ChevronLeft />
          </IconButton>
          <span className="tabular w-9 text-center text-xs text-ink-3" aria-live="polite">
            {index + 1}/{insights.length}
          </span>
          <IconButton label="Insight siguiente" size="sm" onClick={() => go(index + 1)} disabled={index === insights.length - 1}>
            <ChevronRight />
          </IconButton>
        </div>
      </header>
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== index) setIndex(i);
        }}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto"
      >
        {insights.map((insight, i) => (
          <div
            key={insight.id}
            className="h-[196px] w-full shrink-0 snap-start px-4"
            aria-hidden={i !== index}
            role="group"
            aria-label={`${i + 1} de ${insights.length}`}
          >
            <InsightCard insight={insight} />
          </div>
        ))}
      </div>
    </Card>
  );
}
