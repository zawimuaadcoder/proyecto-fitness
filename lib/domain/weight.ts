import { addDays, diffDays, type ISODate } from "@/lib/dates";
import { convertWeight } from "@/lib/format";
import type { WeightEntryRow, WeightUnit } from "@/types/db";

export interface WeightPoint {
  date: ISODate;
  /** Media del día (si hay varios registros) */
  value: number;
  /** Media móvil de 7 días (ventana [d-6, d]) */
  avg7: number;
}

export type WeightRange = "7d" | "30d" | "3m" | "all";

export const WEIGHT_RANGES: { value: WeightRange; label: string; days: number | null }[] = [
  { value: "7d", label: "7 días", days: 7 },
  { value: "30d", label: "30 días", days: 30 },
  { value: "3m", label: "3 meses", days: 91 },
  { value: "all", label: "Todo", days: null },
];

export function dailyWeights(entries: WeightEntryRow[], unit: WeightUnit): { date: ISODate; value: number }[] {
  const byDate = new Map<ISODate, number[]>();
  for (const e of entries) {
    const v = convertWeight(Number(e.weight), e.unit, unit);
    const list = byDate.get(e.date);
    if (list) list.push(v);
    else byDate.set(e.date, [v]);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, value: values.reduce((a, b) => a + b, 0) / values.length }));
}

/** Serie diaria con media móvil de 7 días (no interpola huecos). */
export function weightSeries(entries: WeightEntryRow[], unit: WeightUnit): WeightPoint[] {
  const daily = dailyWeights(entries, unit);
  return daily.map((point, i) => {
    let sum = 0;
    let n = 0;
    for (let j = i; j >= 0 && diffDays(point.date, daily[j].date) <= 6; j--) {
      sum += daily[j].value;
      n++;
    }
    return { ...point, avg7: sum / n };
  });
}

export function filterRange(series: WeightPoint[], range: WeightRange, today: ISODate): WeightPoint[] {
  const days = WEIGHT_RANGES.find((r) => r.value === range)?.days;
  if (!days) return series;
  const from = addDays(today, -(days - 1));
  return series.filter((p) => p.date >= from);
}

function mean(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

export interface WeightOverview {
  latest: { date: ISODate; value: number } | null;
  /** Media de los últimos 7 días */
  weekAvg: number | null;
  /** Media de los 7 días anteriores */
  prevWeekAvg: number | null;
  /** Cambio de media semanal (tendencia), no de un día a otro */
  weekChange: number | null;
  /** Cambio de media entre los últimos 30 días y los 30 anteriores */
  monthChange: number | null;
  count: number;
}

export function weightOverview(series: WeightPoint[], today: ISODate): WeightOverview {
  const inWindow = (from: number, to: number) =>
    series.filter((p) => {
      const d = diffDays(today, p.date);
      return d >= from && d <= to;
    }).map((p) => p.value);

  const weekAvg = mean(inWindow(0, 6));
  const prevWeekAvg = mean(inWindow(7, 13));
  const monthAvg = mean(inWindow(0, 29));
  const prevMonthAvg = mean(inWindow(30, 59));
  const latest = series.at(-1) ?? null;

  return {
    latest: latest ? { date: latest.date, value: latest.value } : null,
    weekAvg,
    prevWeekAvg,
    weekChange: weekAvg != null && prevWeekAvg != null ? weekAvg - prevWeekAvg : null,
    monthChange: monthAvg != null && prevMonthAvg != null ? monthAvg - prevMonthAvg : null,
    count: series.length,
  };
}

/**
 * Tono de un cambio de peso. Neutral salvo que exista un objetivo explícito
 * (perder grasa / ganar masa / mantener) que permita contextualizarlo.
 */
export function weightChangeTone(
  change: number | null,
  goal: string | null,
): "positive" | "negative" | "neutral" {
  if (change == null || Math.abs(change) < 0.05) return "neutral";
  if (goal === "lose_fat") return change < 0 ? "positive" : "negative";
  if (goal === "gain_muscle") return change > 0 ? "positive" : "negative";
  if (goal === "maintain") return Math.abs(change) <= 0.3 ? "positive" : "neutral";
  return "neutral";
}
