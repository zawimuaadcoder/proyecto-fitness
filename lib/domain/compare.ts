import { formatSigned, round } from "@/lib/format";
import type { WeightUnit } from "@/types/db";
import { weightChangeTone } from "./weight";

export interface Comparison {
  key: string;
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
}

interface PeriodLike {
  workouts: number;
  cardioMinutes: number;
  habitsPercent: number | null;
  avgWeight: number | null;
  adherence?: number;
}

/**
 * Comparación compacta entre dos periodos. Verde/rojo solo cuando tiene
 * significado (más entrenos = mejor). El peso es neutral salvo objetivo explícito.
 */
export function comparePeriods(current: PeriodLike, previous: PeriodLike, unit: WeightUnit, goal: string | null): Comparison[] {
  const out: Comparison[] = [];
  const tone = (d: number) => (d > 0 ? "positive" : d < 0 ? "negative" : "neutral") as Comparison["tone"];

  if (current.adherence != null && previous.adherence != null) {
    const d = current.adherence - previous.adherence;
    out.push({ key: "adherence", label: "Cumplimiento", value: `${formatSigned(d)}%`, tone: tone(d) });
  }
  const dw = current.workouts - previous.workouts;
  out.push({ key: "workouts", label: "Entrenos", value: formatSigned(dw), tone: tone(dw) });
  const dc = current.cardioMinutes - previous.cardioMinutes;
  out.push({ key: "cardio", label: "Cardio", value: `${formatSigned(dc)} min`, tone: tone(dc) });
  if (current.habitsPercent != null && previous.habitsPercent != null) {
    const dh = Math.round(current.habitsPercent) - Math.round(previous.habitsPercent);
    out.push({ key: "habits", label: "Hábitos", value: `${formatSigned(dh)}%`, tone: tone(dh) });
  }
  if (current.avgWeight != null && previous.avgWeight != null) {
    const d = round(current.avgWeight - previous.avgWeight, 1);
    out.push({ key: "weight", label: "Peso medio", value: `${formatSigned(d, 1)} ${unit}`, tone: weightChangeTone(d, goal) });
  }
  return out;
}
