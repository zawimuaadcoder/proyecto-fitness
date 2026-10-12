import { addDays, dateRange, diffDays, maxDate, minDate, startOfWeek, type ISODate } from "@/lib/dates";
import type { HabitKind } from "@/types/db";
import type { DomainContext } from "./context";
import { evaluateDay } from "./habits";
import { computeDayPoints, rankStandings, type DayPoints, type Standing } from "./points";

/**
 * Torneos especiales (Winter Arc, Ramadán…): épocas con nombre propio que van
 * en paralelo a la liga mensual. Viven en código, como los hábitos de grupo:
 * para añadir uno basta con sumarlo a TOURNAMENTS.
 *
 * Puntos del torneo = puntos de liga de cada día (mismas reglas y antitrampas)
 *                   + puntos de los retos propios del torneo.
 *
 * Formato «Champions»: fase regular por puntos y, en los últimos días, una
 * Final entre los primeros clasificados (cuentan solo los puntos de la Final;
 * empate → mejor puesto en la fase regular). El bronce es para el mejor del
 * resto en el total del torneo. Los podios se guardan en el palmarés.
 */

// ---------------------------------------------------------------------------
// Definición
// ---------------------------------------------------------------------------

/** Qué se mide cada día (siempre sobre lo registrado a tiempo). */
export type ChallengeMetric =
  | { type: "workout" }
  | { type: "cardio"; minMinutes?: number }
  /** Día con todos los hábitos obligatorios cumplidos. */
  | { type: "habits" }
  /** Un hábito de grupo o de evento cumplido (por su group_key). */
  | { type: "habit"; key: string };

export type ChallengeRule =
  /** Puntos cada día que se cumple. */
  | { kind: "daily" }
  /** Puntos el día en que se llega a `target` días en la semana (lunes → domingo). */
  | { kind: "weekly"; target: number }
  /** Puntos cada vez que se encadenan `length` días seguidos (length, 2·length…). */
  | { kind: "streak"; length: number }
  /** Puntos una sola vez, al llegar a `target` días en todo el torneo. */
  | { kind: "total"; target: number };

export interface ChallengeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  metric: ChallengeMetric;
  rule: ChallengeRule;
  points: number;
}

/** Hábito que solo existe durante el torneo (opcional: no rompe la racha). */
export interface EventHabitDef {
  key: string;
  name: string;
  icon: string;
  kind: HabitKind;
}

export interface TournamentDef {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  /** Primer y último día (incluidos), en la zona horaria de cada perfil. */
  start: ISODate;
  end: ISODate;
  /** Días finales que se juegan como Final (0 = sin Final). */
  finalDays: number;
  /** Cuántos pasan a la Final. */
  finalists: number;
  challenges: ChallengeDef[];
  eventHabits?: EventHabitDef[];
  /** Nota visible (p. ej. fechas sujetas a la luna). */
  note?: string;
}

/** group_key de un hábito de evento: evento:<torneo>:<clave>. */
export function eventHabitKey(tournamentId: string, key: string): string {
  return `evento:${tournamentId}:${key}`;
}

export function isEventHabit(habit: { group_key?: string | null }): boolean {
  return Boolean(habit.group_key?.startsWith("evento:"));
}

export const TOURNAMENTS: readonly TournamentDef[] = [
  {
    id: "winter-arc-2026",
    name: "Winter Arc",
    emoji: "❄️",
    tagline: "Tres meses para llegar a la primavera en tu mejor versión. Cuando hace frío, se entrena igual.",
    start: "2026-11-01",
    end: "2027-01-31",
    finalDays: 7,
    finalists: 2,
    challenges: [
      {
        id: "frio",
        name: "El frío no para",
        emoji: "🥶",
        description: "4 entrenos en la misma semana",
        metric: { type: "workout" },
        rule: { kind: "weekly", target: 4 },
        points: 3,
      },
      {
        id: "cardio",
        name: "Cardio de invierno",
        emoji: "🏃",
        description: "3 días de cardio de 20 min o más en la semana",
        metric: { type: "cardio", minMinutes: 20 },
        rule: { kind: "weekly", target: 3 },
        points: 2,
      },
      {
        id: "semana-perfecta",
        name: "Semana impecable",
        emoji: "✨",
        description: "Los 7 días de la semana con todos tus hábitos",
        metric: { type: "habits" },
        rule: { kind: "weekly", target: 7 },
        points: 3,
      },
      {
        id: "amanecer",
        name: "Amanecer helado",
        emoji: "🌅",
        description: "14 días seguidos con Fajr (se repite cada 14)",
        metric: { type: "habit", key: "fajr" },
        rule: { kind: "streak", length: 14 },
        points: 5,
      },
      {
        id: "arc",
        name: "Arc completo",
        emoji: "🏔️",
        description: "50 días entrenados durante el torneo",
        metric: { type: "workout" },
        rule: { kind: "total", target: 50 },
        points: 10,
      },
    ],
  },
  {
    id: "ramadan-2027",
    name: "Ramadán",
    emoji: "🌙",
    tagline: "Un mes de disciplina: ayuno, oración, Corán y seguir en movimiento.",
    start: "2027-02-08",
    end: "2027-03-09",
    finalDays: 7,
    finalists: 2,
    note: "Fechas aproximadas: se ajustan al avistamiento de la luna.",
    eventHabits: [
      { key: "ayuno", name: "Ayuno", icon: "moon", kind: "check" },
      { key: "taraweeh", name: "Taraweeh", icon: "moon-star", kind: "check" },
    ],
    challenges: [
      {
        id: "ayuno",
        name: "Ayuno",
        emoji: "🌙",
        description: "Cada día de ayuno",
        metric: { type: "habit", key: "evento:ramadan-2027:ayuno" },
        rule: { kind: "daily" },
        points: 2,
      },
      {
        id: "taraweeh",
        name: "Taraweeh",
        emoji: "🕌",
        description: "Cada noche de Taraweeh",
        metric: { type: "habit", key: "evento:ramadan-2027:taraweeh" },
        rule: { kind: "daily" },
        points: 2,
      },
      {
        id: "fajr",
        name: "Fajr sin fallar",
        emoji: "🌅",
        description: "10 días seguidos con Fajr (se repite cada 10)",
        metric: { type: "habit", key: "fajr" },
        rule: { kind: "streak", length: 10 },
        points: 5,
      },
      {
        id: "coran",
        name: "Semana de Corán",
        emoji: "📖",
        description: "Leer Corán los 7 días de la semana",
        metric: { type: "habit", key: "quran" },
        rule: { kind: "weekly", target: 7 },
        points: 3,
      },
      {
        id: "activo",
        name: "En movimiento",
        emoji: "💪",
        description: "2 entrenos en la semana, también en ayunas",
        metric: { type: "workout" },
        rule: { kind: "weekly", target: 2 },
        points: 2,
      },
      {
        id: "mes",
        name: "Mes completo",
        emoji: "⭐",
        description: "25 días de ayuno durante el torneo",
        metric: { type: "habit", key: "evento:ramadan-2027:ayuno" },
        rule: { kind: "total", target: 25 },
        points: 10,
      },
    ],
  },
];

export function getTournament(id: string): TournamentDef | null {
  return TOURNAMENTS.find((t) => t.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Calendario
// ---------------------------------------------------------------------------

export type TournamentStatus = "upcoming" | "regular" | "final" | "finished";

/** Primer día de la Final (null si el torneo no tiene). */
export function finalStart(t: TournamentDef): ISODate | null {
  if (t.finalDays <= 0 || t.finalists < 2) return null;
  return addDays(t.end, 1 - t.finalDays);
}

export function tournamentStatus(t: TournamentDef, today: ISODate): TournamentStatus {
  if (today < t.start) return "upcoming";
  if (today > t.end) return "finished";
  const fs = finalStart(t);
  return fs && today >= fs ? "final" : "regular";
}

/** Días que faltan para empezar (upcoming) o para terminar (en juego), incluido hoy. */
export function daysLeft(t: TournamentDef, today: ISODate): number {
  return today < t.start ? diffDays(t.start, today) : Math.max(0, diffDays(t.end, today) + 1);
}

/** Hábitos de evento: se crean unos días antes para que se vean venir. */
export const EVENT_HABITS_LEAD_DAYS = 7;

export function tournamentsNeedingEventHabits(today: ISODate): TournamentDef[] {
  return TOURNAMENTS.filter(
    (t) => t.eventHabits?.length && today >= addDays(t.start, -EVENT_HABITS_LEAD_DAYS) && today <= t.end,
  );
}

// ---------------------------------------------------------------------------
// Puntos
// ---------------------------------------------------------------------------

/** ¿Se cumple la métrica ese día? (ctx = contexto de liga, solo lo puntual). */
export function metricMet(metric: ChallengeMetric, ctx: DomainContext, date: ISODate): boolean {
  switch (metric.type) {
    case "workout":
      return (ctx.workoutsByDate.get(date) ?? []).some((w) => !w.is_rest);
    case "cardio": {
      const minutes = (ctx.cardioByDate.get(date) ?? []).reduce((s, c) => s + c.minutes, 0);
      return minutes > 0 && minutes >= (metric.minMinutes ?? 0);
    }
    case "habits":
      return evaluateDay(date, ctx).status === "completed";
    case "habit":
      return evaluateDay(date, ctx).habits.some((r) => r.habit.group_key === metric.key && r.status === "completed");
  }
}

export interface ChallengeAward {
  challengeId: string;
  date: ISODate;
  points: number;
}

export interface ChallengeProgress {
  challenge: ChallengeDef;
  /** Veces conseguido. */
  times: number;
  points: number;
  /** Progreso actual (semana en curso, racha viva o total). */
  current: number;
  goal: number;
}

/** Retos conseguidos en [t.start, min(t.end, hoy)]. */
export function computeChallenges(
  t: TournamentDef,
  ctx: DomainContext,
): { awards: ChallengeAward[]; progress: ChallengeProgress[] } {
  const end = minDate(t.end, ctx.today);
  const days = t.start <= end ? dateRange(t.start, end) : [];
  const awards: ChallengeAward[] = [];
  const progress: ChallengeProgress[] = [];

  for (const c of t.challenges) {
    const met = days.map((d) => metricMet(c.metric, ctx, d));
    let times = 0;
    let current = 0;
    let goal = 1;
    const award = (date: ISODate) => {
      times += 1;
      awards.push({ challengeId: c.id, date, points: c.points });
    };

    switch (c.rule.kind) {
      case "daily":
        days.forEach((d, i) => met[i] && award(d));
        current = met.length && met[met.length - 1] ? 1 : 0;
        break;
      case "weekly": {
        goal = c.rule.target;
        let week = "";
        let count = 0;
        days.forEach((d, i) => {
          if (startOfWeek(d) !== week) {
            week = startOfWeek(d);
            count = 0;
          }
          if (!met[i]) return;
          count += 1;
          if (count === goal) award(d);
        });
        current = days.length && startOfWeek(days[days.length - 1]) === week ? count : 0;
        break;
      }
      case "streak": {
        goal = c.rule.length;
        let run = 0;
        days.forEach((d, i) => {
          // Hoy aún no ha terminado: si no está hecho, no rompe la racha.
          if (!met[i]) {
            if (d !== ctx.today) run = 0;
            return;
          }
          run += 1;
          if (run % goal === 0) award(d);
        });
        current = run % goal;
        break;
      }
      case "total": {
        goal = c.rule.target;
        let count = 0;
        days.forEach((d, i) => {
          if (!met[i]) return;
          count += 1;
          if (count === goal) award(d);
        });
        current = Math.min(count, goal);
        break;
      }
    }
    progress.push({ challenge: c, times, points: times * c.points, current, goal });
  }
  return { awards, progress };
}

export interface TournamentDay {
  date: ISODate;
  league: number;
  challenges: number;
  total: number;
}

/** Puntos del torneo día a día (liga + retos). `leagueDays` puede cubrir más rango. */
export function tournamentDays(t: TournamentDef, ctx: DomainContext, leagueDays?: DayPoints[]): TournamentDay[] {
  const end = minDate(t.end, ctx.today);
  if (t.start > end) return [];
  const league = new Map((leagueDays ?? computeDayPoints(ctx, t.start, end)).map((d) => [d.date, d.total]));
  const extra = new Map<ISODate, number>();
  for (const a of computeChallenges(t, ctx).awards) extra.set(a.date, (extra.get(a.date) ?? 0) + a.points);
  return dateRange(t.start, end).map((date) => {
    const l = league.get(date) ?? 0;
    const c = extra.get(date) ?? 0;
    return { date, league: l, challenges: c, total: l + c };
  });
}

export function sumDays(days: TournamentDay[], from: ISODate, to: ISODate): number {
  return days.reduce((s, d) => (d.date >= from && d.date <= to ? s + d.total : s), 0);
}

// ---------------------------------------------------------------------------
// Clasificación, Final y podio
// ---------------------------------------------------------------------------

export interface TournamentEntry {
  id: string;
  days: TournamentDay[];
  /** Cumplimiento medio de la fase regular (desempate). */
  adherence: number;
}

export interface Placement {
  id: string;
  /** Puesto final: 1 campeón, 2 subcampeón, 3 bronce. */
  place: 1 | 2 | 3;
  points: number;
}

export interface TournamentTable {
  /** Fase regular (o el torneo entero si no hay Final). */
  regular: (Standing & { id: string; position: number; total: number })[];
  /** Finalistas con sus puntos de la Final (vacío si aún no ha empezado). */
  final: { id: string; seed: number; points: number }[];
  /** Podio provisional (en juego) o definitivo (terminado). */
  podium: Placement[];
}

/**
 * Clasificación del torneo. En fase regular el «podio» es la cabeza de la
 * tabla; en la Final, los finalistas se ordenan por puntos de la Final
 * (empate → mejor puesto de la fase regular) y el bronce es el mejor del
 * resto por total del torneo. Nadie sube al podio con 0 puntos.
 */
export function tournamentTable(t: TournamentDef, entries: TournamentEntry[], today: ISODate): TournamentTable {
  const fs = finalStart(t);
  const regularEnd = fs ? addDays(fs, -1) : t.end;
  const total = (e: TournamentEntry) => sumDays(e.days, t.start, t.end);
  const regular = rankStandings(
    entries.map((e) => ({ id: e.id, points: sumDays(e.days, t.start, regularEnd), adherence: e.adherence, total: total(e) })),
  );

  const status = tournamentStatus(t, today);
  const scoring = regular.filter((r) => r.points > 0);
  const inFinal = fs && (status === "final" || status === "finished") && scoring.length >= 2;

  if (!inFinal) {
    const podium = regular
      .filter((r) => r.points > 0 && r.position <= 3)
      .slice(0, 3)
      .map((r) => ({ id: r.id, place: r.position as 1 | 2 | 3, points: r.points }));
    return { regular, final: [], podium };
  }

  const finalists = scoring.slice(0, t.finalists);
  const finalFrom = maxDate(fs, t.start);
  const final = finalists
    .map((r, i) => ({ id: r.id, seed: i + 1, points: sumDays(entries.find((e) => e.id === r.id)!.days, finalFrom, t.end) }))
    .sort((a, b) => b.points - a.points || a.seed - b.seed);

  const podium: Placement[] = final.slice(0, 3).map((f, i) => ({ id: f.id, place: (i + 1) as 1 | 2 | 3, points: f.points }));
  if (podium.length < 3) {
    // Final a dos: el bronce es para el mejor del resto por total del torneo.
    const finalistIds = new Set(final.map((f) => f.id));
    const bronze = regular
      .filter((r) => !finalistIds.has(r.id) && r.total > 0)
      .sort((a, b) => b.total - a.total || b.adherence - a.adherence)[0];
    if (bronze) podium.push({ id: bronze.id, place: 3, points: bronze.total });
  }
  return { regular, final, podium };
}
