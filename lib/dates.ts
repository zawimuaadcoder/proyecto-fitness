/**
 * Utilidades de fechas "de calendario".
 *
 * Todas las fechas de dominio son strings ISO "YYYY-MM-DD" que representan un
 * día local del perfil (no un instante). La aritmética se hace sobre UTC para
 * que nunca dependa de la zona horaria del servidor ni del cambio de horario.
 * El único punto donde entra la zona horaria es `todayInTimeZone`.
 */

export type ISODate = string;

const DAY_MS = 86_400_000;

function toUTC(date: ISODate): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUTC(ms: number): ISODate {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isISODate(value: unknown): value is ISODate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return fromUTC(toUTC(value)) === value;
}

export function addDays(date: ISODate, days: number): ISODate {
  return fromUTC(toUTC(date) + days * DAY_MS);
}

export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((toUTC(a) - toUTC(b)) / DAY_MS);
}

/** 1 = lunes … 7 = domingo (ISO-8601). */
export function isoWeekday(date: ISODate): number {
  const day = new Date(toUTC(date)).getUTCDay();
  return day === 0 ? 7 : day;
}

/** Lunes de la semana a la que pertenece la fecha. */
export function startOfWeek(date: ISODate): ISODate {
  return addDays(date, 1 - isoWeekday(date));
}

export function endOfWeek(date: ISODate): ISODate {
  return addDays(startOfWeek(date), 6);
}

export function weekDays(weekStart: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function dateRange(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Número de semana ISO-8601. */
export function isoWeekNumber(date: ISODate): number {
  const thursday = addDays(date, 4 - isoWeekday(date));
  const yearStart = `${thursday.slice(0, 4)}-01-01`;
  return Math.floor(diffDays(thursday, yearStart) / 7) + 1;
}

export function minDate(a: ISODate, b: ISODate): ISODate {
  return a < b ? a : b;
}

export function maxDate(a: ISODate, b: ISODate): ISODate {
  return a > b ? a : b;
}

/** Día actual en la zona horaria indicada (p. ej. "Europe/Madrid"). */
export function todayInTimeZone(timeZone: string, now: Date = new Date()): ISODate {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

export function currentTimeInTimeZone(timeZone: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
  } catch {
    return now.toISOString().slice(11, 16);
  }
}

export function hourInTimeZone(timeZone: string, now: Date = new Date()): number {
  return Number(currentTimeInTimeZone(timeZone, now).slice(0, 2));
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Formato (es-ES)
// ---------------------------------------------------------------------------

const WEEKDAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKDAY_ABBR = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const WEEKDAY_LONG = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const MONTH_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
const MONTH_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function weekdayLetter(weekday: number): string {
  return WEEKDAY_SHORT[weekday - 1];
}

export function weekdayAbbr(weekday: number): string {
  return WEEKDAY_ABBR[weekday - 1];
}

export function weekdayLong(weekday: number): string {
  return WEEKDAY_LONG[weekday - 1];
}

function parts(date: ISODate) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
}

/** "11 oct" */
export function formatShortDate(date: ISODate): string {
  const { m, d } = parts(date);
  return `${d} ${MONTH_SHORT[m - 1]}`;
}

/** "sábado, 11 de octubre" */
export function formatLongDate(date: ISODate): string {
  const { m, d } = parts(date);
  return `${weekdayLong(isoWeekday(date))}, ${d} de ${MONTH_LONG[m - 1]}`;
}

/** "11 oct 2026" */
export function formatDateWithYear(date: ISODate): string {
  const { y } = parts(date);
  return `${formatShortDate(date)} ${y}`;
}

/** "6 – 12 oct" */
export function formatWeekRange(weekStart: ISODate): string {
  const end = addDays(weekStart, 6);
  const a = parts(weekStart);
  const b = parts(end);
  if (a.m === b.m) return `${a.d} – ${b.d} ${MONTH_SHORT[b.m - 1]}`;
  return `${a.d} ${MONTH_SHORT[a.m - 1]} – ${b.d} ${MONTH_SHORT[b.m - 1]}`;
}

/** "Hoy", "Ayer", "Mañana" o "Lun 6 oct". */
export function formatRelativeDay(date: ISODate, today: ISODate): string {
  const diff = diffDays(date, today);
  if (diff === 0) return "Hoy";
  if (diff === -1) return "Ayer";
  if (diff === 1) return "Mañana";
  return `${weekdayAbbr(isoWeekday(date))} ${formatShortDate(date)}`;
}

export function monthLabel(date: ISODate): string {
  const { m } = parts(date);
  return MONTH_SHORT[m - 1];
}
