import { addDays, dateRange, diffDays, minDate, startOfWeek, type ISODate } from "@/lib/dates";
import { buildContext, type ContextInput, type DomainContext } from "./context";
import { GROUP_HABIT_POINTS, isGroupHabit } from "./group-habits";
import { evaluateDay } from "./habits";
import { rangeStats } from "./stats";
import { computeTimeline } from "./streak";
import { adherenceWeights, computeAdherence, computeWeek, goalsForWeek } from "./week";

/**
 * Puntos de la liga. Se calculan SIEMPRE desde el historial (nunca se guardan a
 * mano) y premian la constancia frente a los objetivos propios, no el volumen:
 *
 *   entreno            1  (como mucho 1 al día y hasta el objetivo semanal propio)
 *   cardio             1  (como mucho 1 al día y hasta el objetivo semanal propio)
 *   día de hábitos     1  (todos los obligatorios programados cumplidos)
 *   → tope de 3 puntos base por día
 *   hábito de grupo    3  (Fajr, Entrenar, Leer Corán; fuera del tope → hasta +9)
 *   semana ≥ 80 %     +2  (semana ISO cerrada; se apunta el domingo)
 *   cada 7 de racha   +1  (el día en que la racha llega a 7, 14, 21…)
 *
 * El peso no puntúa. Antitrampas: solo cuenta lo registrado el mismo día o al
 * día siguiente (created_at en la zona horaria del perfil). Los descansos
 * planificados pueden registrarse por adelantado y nunca restan.
 */
export const POINTS = {
  workout: 1,
  cardio: 1,
  habits: 1,
  dailyCap: 3,
  groupHabit: GROUP_HABIT_POINTS,
  weekBonus: 2,
  weekThreshold: 80,
  streakEvery: 7,
  streakBonus: 1,
} as const;

export interface DayPoints {
  date: ISODate;
  workout: number;
  cardio: number;
  habits: number;
  /** Hábitos de grupo cumplidos (3 cada uno, fuera del tope diario). */
  group: number;
  /** Bonus por racha múltiplo de 7. */
  streak: number;
  /** Bonus por semana cerrada con ≥ 80 %. */
  week: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Antitrampas: solo lo registrado a tiempo
// ---------------------------------------------------------------------------

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Día local (YYYY-MM-DD) de un instante en la zona horaria dada. */
export function localDateOf(timestamp: string, timeZone: string): ISODate | null {
  const ms = Date.parse(timestamp);
  if (Number.isNaN(ms)) return null;
  let fmt = formatters.get(timeZone);
  if (!fmt) {
    try {
      fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
      fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit" });
    }
    formatters.set(timeZone, fmt);
  }
  return fmt.format(new Date(ms));
}

/**
 * ¿Se registró a tiempo? Desfase entre el día registrado y el día local en que
 * se guardó: 0 (hoy) o 1 (ayer). `allowEarly` acepta registros adelantados
 * (descansos planificados). Sin marca de tiempo verificable se acepta.
 */
export function isPunctual(date: ISODate, recordedAt: string | null | undefined, timeZone: string, allowEarly = false): boolean {
  if (!recordedAt) return true;
  const local = localDateOf(recordedAt, timeZone);
  if (!local) return true;
  const lag = diffDays(local, date);
  return lag <= 1 && (allowEarly || lag >= 0);
}

/**
 * Copia del historial con solo los registros hechos a tiempo. Para los logs de
 * hábitos se usa la última modificación (updated_at): marcar como hecho un
 * hábito días después tampoco puntúa.
 */
export function punctualInput(input: ContextInput, timeZone: string): ContextInput {
  return {
    ...input,
    habitLogs: input.habitLogs.filter((l) => isPunctual(l.date, l.updated_at || l.created_at, timeZone)),
    weights: input.weights.filter((w) => isPunctual(w.date, w.created_at, timeZone)),
    workouts: input.workouts.filter((w) => isPunctual(w.date, w.created_at, timeZone, w.is_rest)),
    cardio: input.cardio.filter((c) => isPunctual(c.date, c.created_at, timeZone)),
  };
}

/** Contexto de dominio "de liga": el mismo historial, solo con lo registrado a tiempo. */
export function leagueContext(input: ContextInput, timeZone: string): DomainContext {
  return buildContext(punctualInput(input, timeZone));
}

// ---------------------------------------------------------------------------
// Puntos por día
// ---------------------------------------------------------------------------

/**
 * Puntos de cada día en [from, to] (los días futuros se ignoran). Los topes
 * semanales se calculan por semana ISO completa, aunque `from` caiga a mitad.
 */
export function computeDayPoints(ctx: DomainContext, from: ISODate, to: ISODate): DayPoints[] {
  const end = minDate(to, ctx.today);
  if (from > end) return [];
  const timeline = computeTimeline(ctx);
  const byDate = new Map(timeline.map((d) => [d.date, d]));
  const out: DayPoints[] = [];

  for (let weekStart = startOfWeek(from); weekStart <= end; weekStart = addDays(weekStart, 7)) {
    const weekEnd = addDays(weekStart, 6);
    const goals = goalsForWeek(ctx, weekStart);
    let workoutDays = 0;
    let cardioDays = 0;
    let cardioMinutes = 0;

    for (const date of dateRange(weekStart, minDate(weekEnd, end))) {
      let workout = 0;
      const trained = (ctx.workoutsByDate.get(date) ?? []).some((w) => !w.is_rest);
      if (trained && workoutDays < goals.workoutTarget) {
        workout = POINTS.workout;
        workoutDays += 1;
      }

      let cardio = 0;
      const minutes = (ctx.cardioByDate.get(date) ?? []).reduce((s, c) => s + c.minutes, 0);
      if (minutes > 0) {
        // Por encima del objetivo semanal propio no suma.
        const underGoal =
          goals.cardioMode === "minutes"
            ? cardioMinutes < goals.cardioMinutesTarget
            : cardioDays < goals.cardioDaysTarget;
        if (underGoal) {
          cardio = POINTS.cardio;
          cardioDays += 1;
        }
        cardioMinutes += minutes;
      }

      const evaluation = evaluateDay(date, ctx);
      const habits = evaluation.status === "completed" ? POINTS.habits : 0;
      const group =
        evaluation.habits.filter((r) => isGroupHabit(r.habit) && r.status === "completed").length * POINTS.groupHabit;

      const day = byDate.get(date);
      const streak =
        day?.status === "completed" && day.run > 0 && day.run % POINTS.streakEvery === 0 ? POINTS.streakBonus : 0;

      const week =
        date === weekEnd && weekEnd < ctx.today && computeWeek(ctx, weekStart).adherence >= POINTS.weekThreshold
          ? POINTS.weekBonus
          : 0;

      if (date < from) continue;
      const base = Math.min(POINTS.dailyCap, workout + cardio + habits);
      out.push({ date, workout, cardio, habits, group, streak, week, total: base + group + streak + week });
    }
  }
  return out;
}

export function sumPoints(days: DayPoints[], from?: ISODate, to?: ISODate): number {
  return days.reduce((s, d) => ((!from || d.date >= from) && (!to || d.date <= to) ? s + d.total : s), 0);
}

/**
 * Cumplimiento medio de un periodo (0–100): mismas reglas que el semanal, con
 * los objetivos prorrateados a los días transcurridos (hoy no cuenta en el
 * objetivo hasta que termina, pero sí lo que ya hayas hecho).
 */
export function periodAdherence(ctx: DomainContext, from: ISODate, to: ISODate): number {
  const end = minDate(to, ctx.today);
  if (from > end) return 0;
  const stats = rangeStats(ctx, from, end);
  const closed = dateRange(from, end).filter((d) => d < ctx.today);
  const targetDays = closed.length ? closed : [end];
  const scaled = { workoutTarget: 0, cardioDaysTarget: 0, cardioMinutesTarget: 0 };
  for (const d of targetDays) {
    const g = goalsForWeek(ctx, startOfWeek(d));
    scaled.workoutTarget += g.workoutTarget / 7;
    scaled.cardioDaysTarget += g.cardioDaysTarget / 7;
    scaled.cardioMinutesTarget += g.cardioMinutesTarget / 7;
  }
  return computeAdherence({
    habitsPercent: stats.habitsPercent,
    workouts: stats.workouts,
    cardioDays: stats.cardioDays,
    cardioMinutes: stats.cardioMinutes,
    goals: { ...scaled, cardioMode: goalsForWeek(ctx, startOfWeek(end)).cardioMode },
    weights: adherenceWeights(ctx),
  }).adherence;
}

// ---------------------------------------------------------------------------
// Clasificación
// ---------------------------------------------------------------------------

export interface Standing {
  points: number;
  /** Desempate: cumplimiento medio del periodo. */
  adherence: number;
}

/**
 * Ordena por puntos y, a igualdad, por cumplimiento. Empate total → mismo
 * puesto (1, 1, 3…). El orden de entrada se respeta entre empatados.
 */
export function rankStandings<T extends Standing>(rows: T[]): (T & { position: number })[] {
  const sorted = rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r.points - a.r.points || b.r.adherence - a.r.adherence || a.i - b.i)
    .map(({ r }) => r);
  let position = 0;
  return sorted.map((r, i) => {
    const prev = sorted[i - 1];
    if (!prev || prev.points !== r.points || prev.adherence !== r.adherence) position = i + 1;
    return { ...r, position };
  });
}

/** Ganadores de un periodo (puede haber cotitulares); nadie gana con 0 puntos. */
export function winners<T extends Standing>(rows: T[]): (T & { position: number })[] {
  return rankStandings(rows).filter((r) => r.position === 1 && r.points > 0);
}
