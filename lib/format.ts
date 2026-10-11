import type { WeightUnit } from "@/types/db";

const LB_PER_KG = 2.2046226218;

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  return from === "kg" ? value * LB_PER_KG : value / LB_PER_KG;
}

export function round(value: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

const formatters = new Map<string, Intl.NumberFormat>();

export function formatNumber(value: number, decimals = 0, minDecimals = decimals): string {
  const key = `${decimals}:${minDecimals}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: minDecimals,
      useGrouping: true,
    });
    formatters.set(key, f);
  }
  // Intl en es-ES no agrupa números de 4 cifras; está bien para esta app.
  return f.format(value);
}

/** "+28", "−0,4", "0" (usa el signo menos tipográfico) */
export function formatSigned(value: number, decimals = 0): string {
  const r = round(value, decimals);
  if (r === 0) return formatNumber(0, decimals);
  const abs = formatNumber(Math.abs(r), decimals);
  return r > 0 ? `+${abs}` : `−${abs}`;
}

export function formatWeight(value: number | null | undefined, unit: WeightUnit, withUnit = true): string {
  if (value == null || Number.isNaN(value)) return "—";
  const v = formatNumber(round(value, 1), 1, 1);
  return withUnit ? `${v} ${unit}` : v;
}

export function formatMinutes(value: number): string {
  if (value < 60) return `${value} min`;
  const h = Math.floor(value / 60);
  const m = value % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${Math.round(value)}%`;
}

export function pluralize(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function initials(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

/** Parse "76,4" o "76.4" */
export function parseDecimal(input: string): number | null {
  const v = Number(input.replace(",", ".").trim());
  return input.trim() === "" || Number.isNaN(v) ? null : v;
}
