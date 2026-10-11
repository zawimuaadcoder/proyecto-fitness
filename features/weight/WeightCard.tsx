"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, Plus, Scale } from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/charts/MiniCharts";
import { Button } from "@/components/ui/Button";
import { BigNumber, Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricChip } from "@/components/ui/Pills";
import { formatRelativeDay } from "@/lib/dates";
import { formatSigned, formatWeight, round } from "@/lib/format";
import { weightChangeTone, type WeightOverview } from "@/lib/domain/weight";
import { useQuickAdd } from "@/features/quick-add/QuickAdd";
import type { Goal, WeightUnit } from "@/types/db";

export function WeightCard({
  overview,
  trend,
  unit,
  goal,
  today,
}: {
  overview: WeightOverview;
  trend: number[];
  unit: WeightUnit;
  goal: Goal | null;
  today: string;
}) {
  const { open } = useQuickAdd();
  const change = overview.weekChange != null ? round(overview.weekChange, 1) : null;
  const tone = weightChangeTone(change, goal);
  const Arrow = change == null || change === 0 ? ArrowRight : change < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <Card>
      <CardHeader
        icon={<Scale />}
        title={<Link href="/progreso?tab=peso" className="hover:text-ink">Peso</Link>}
        action={
          <Button size="sm" variant="ghost" icon={<Plus />} onClick={() => open("weight")} aria-label="Registrar peso">
            <span className="hidden sm:inline">Registrar</span>
          </Button>
        }
      />
      {!overview.latest ? (
        <EmptyState
          compact
          title="Aún no has registrado tu peso"
          action={
            <Button size="sm" variant="secondary" onClick={() => open("weight")}>
              Registrar primer peso
            </Button>
          }
        />
      ) : (
        <div className="flex items-end gap-4">
          <div className="min-w-0 flex-1">
            <BigNumber value={formatWeight(overview.latest.value, unit, false)} unit={unit} />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {change != null && (
                <MetricChip tone={tone} value={<><Arrow className="size-3" />{formatSigned(change, 1)} {unit}</>} />
              )}
              <span className="text-xs text-ink-3">{formatRelativeDay(overview.latest.date, today)}</span>
            </div>
            <dl className="mt-3 flex gap-5 text-xs">
              <div>
                <dt className="text-ink-3">Media semanal</dt>
                <dd className="tabular mt-0.5 text-[13px] font-medium text-ink">{formatWeight(overview.weekAvg, unit)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Semana anterior</dt>
                <dd className="tabular mt-0.5 text-[13px] font-medium text-ink-2">{formatWeight(overview.prevWeekAvg, unit)}</dd>
              </div>
            </dl>
          </div>
          <Sparkline values={trend} className="max-w-[120px] flex-1" height={48} label="Tendencia (media 7 días)" />
        </div>
      )}
    </Card>
  );
}
