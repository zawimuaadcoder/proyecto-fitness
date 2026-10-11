"use client";

import { LineChart as LineIcon } from "lucide-react";
import { useState } from "react";
import { LineChart } from "@/components/charts/LineChart";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricChip } from "@/components/ui/Pills";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { formatShortDate } from "@/lib/dates";
import { formatNumber, formatSigned, round } from "@/lib/format";
import { WEIGHT_RANGES, filterRange, weightChangeTone, type WeightPoint, type WeightRange } from "@/lib/domain/weight";
import type { Goal, WeightUnit } from "@/types/db";

/** Gráfico de peso: puntos diarios + media móvil 7 días como tendencia. */
export function WeightChartCard({
  series,
  unit,
  today,
  goal,
  targetWeight,
}: {
  series: WeightPoint[];
  unit: WeightUnit;
  today: string;
  goal: Goal | null;
  targetWeight: number | null;
}) {
  const [range, setRange] = useState<WeightRange>("30d");
  const data = filterRange(series, range, today);
  const first = data[0];
  const last = data.at(-1);
  const change = first && last && data.length > 1 ? round(last.avg7 - first.avg7, 1) : null;

  return (
    <Card>
      <CardHeader icon={<LineIcon />} title="Tendencia de peso" subtitle="Puntos: registros · Línea: media móvil 7 días" />
      <SegmentedControl
        label="Rango"
        size="sm"
        value={range}
        onChange={setRange}
        options={WEIGHT_RANGES.map((r) => ({ value: r.value, label: r.label }))}
        className="mb-4"
      />
      {data.length === 0 ? (
        <EmptyState compact title="Sin registros en este rango" />
      ) : (
        <>
          <div className="mb-3 flex items-baseline gap-2">
            <span className="tabular text-2xl font-semibold tracking-tight">{formatNumber(last!.avg7, 1, 1)}</span>
            <span className="text-sm text-ink-3">{unit} · media 7d</span>
            {change != null && (
              <MetricChip className="ml-auto" tone={weightChangeTone(change, goal)} label="Periodo" value={`${formatSigned(change, 1)} ${unit}`} />
            )}
          </div>
          <LineChart
            ariaLabel={`Peso en ${WEIGHT_RANGES.find((r) => r.value === range)?.label}`}
            height={180}
            primaryStyle="dots"
            color="var(--accent)"
            secondaryColor="var(--accent)"
            formatValue={(v) => `${formatNumber(v, 1, 1)} ${unit}`}
            primaryLabel="registro"
            secondaryLabel="media 7d"
            reference={targetWeight ? { value: targetWeight, label: `Objetivo ${formatNumber(targetWeight, 1)}` } : undefined}
            data={data.map((p) => ({ key: p.date, label: formatShortDate(p.date), value: round(p.value, 1), secondary: round(p.avg7, 2) }))}
          />
          <p className="mt-3 text-xs text-ink-3">Las fluctuaciones diarias (agua, sal, sueño) no son tendencia. Fíjate en la línea.</p>
        </>
      )}
    </Card>
  );
}
