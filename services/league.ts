import "server-only";
import { after } from "next/server";
import { cache } from "react";
import { LEAGUE_START_MONTH } from "@/lib/constants";
import { addDays, dateRange, endOfMonth, startOfMonth, startOfWeek, type ISODate } from "@/lib/dates";
import { leagueContext, computeDayPoints, periodAdherence, rankStandings, sumPoints, winners, type DayPoints } from "@/lib/domain/points";
import { computeStreak, computeTimeline } from "@/lib/domain/streak";
import { computeWeek } from "@/lib/domain/week";
import { db, unwrap } from "@/lib/server/supabase";
import type { LeagueTitleRow, PublicProfile } from "@/types/db";
import type { ProfileSnapshot } from "@/types/domain";
import { contextFromSnapshot } from "./analysis";
import { isActiveToday } from "./app-profile";
import { listProfiles } from "./profiles";
import { loadSnapshot } from "./snapshot";

export interface LeagueMember {
  profile: PublicProfile;
  isMe: boolean;
  position: number;
  /** Puesto al cierre de la semana anterior (null si aún no había liga este mes). */
  previousPosition: number | null;
  points: number;
  adherence: number;
  streak: number;
  activeToday: boolean;
  /** Puntos de los últimos 7 días (incluye hoy). */
  last7: { date: ISODate; points: number }[];
  /** Puntos por día del mes (null = día futuro). */
  month: { date: ISODate; points: number | null }[];
  titles: number;
}

export interface LeagueTitle {
  month: ISODate;
  profiles: PublicProfile[];
  points: number;
}

export interface Matchday {
  weekStart: ISODate;
  winners: { profile: PublicProfile; points: number }[];
  me: { position: number; points: number; of: number } | null;
}

export interface League {
  today: ISODate;
  monthStart: ISODate;
  monthEnd: ISODate;
  members: LeagueMember[];
  meParticipates: boolean;
  titles: LeagueTitle[];
  matchday: Matchday | null;
}

interface Participant {
  profile: PublicProfile;
  days: Map<ISODate, DayPoints>;
  ctx: ReturnType<typeof leagueContext>;
  streak: number;
  activeToday: boolean;
}

/** Participa en liga y torneos: ha activado la opción y tiene algo registrado. */
export function isLeagueParticipant(s: ProfileSnapshot): boolean {
  if (!s.settings.league_opt_in) return false;
  return s.settings.onboarded || s.habits.length > 0 || s.workouts.length > 0 || s.cardio.length > 0;
}

/** Contexto de liga de un perfil: su historial con solo lo registrado a tiempo. */
export function leagueContextOf(s: ProfileSnapshot) {
  return leagueContext(
    {
      today: s.today,
      settings: s.settings,
      habits: s.habits,
      habitLogs: s.habitLogs,
      weights: s.weights,
      workouts: s.workouts,
      cardio: s.cardio,
      goals: s.goals,
    },
    s.settings.timezone,
  );
}

function sumRange(days: Map<ISODate, DayPoints>, from: ISODate, to: ISODate): number {
  return sumPoints([...days.values()], from, to);
}

export async function readTitles(): Promise<LeagueTitleRow[] | null> {
  try {
    return unwrap(await db().from("league_titles").select("*").order("month", { ascending: false })) as LeagueTitleRow[];
  } catch (error) {
    // Sin la migración de la liga: sin histórico, pero la liga funciona.
    console.error("[league] títulos", error);
    return null;
  }
}

/**
 * Liga mensual del grupo. Todo se deriva del historial de cada perfil (en su
 * zona horaria) con solo los registros hechos a tiempo. El mes que se muestra
 * es el mes natural del perfil que mira.
 */
export const loadLeague = cache(async (viewerId: string): Promise<League | null> => {
  const [profiles, viewer, titleRows] = await Promise.all([listProfiles(), loadSnapshot(viewerId), readTitles()]);
  if (!viewer) return null;

  const today = viewer.today;
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const prevMonthStart = startOfMonth(addDays(monthStart, -1));
  const prevMonthEnd = addDays(monthStart, -1);

  const snapshots = await Promise.all(profiles.map((p) => loadSnapshot(p.id)));
  const participants: Participant[] = [];
  for (const s of snapshots) {
    if (!s || !isLeagueParticipant(s)) continue;
    const ctx = leagueContextOf(s);
    const days = new Map(computeDayPoints(ctx, prevMonthStart, s.today).map((d) => [d.date, d]));
    // La racha que se muestra es la de siempre (la llama de la app).
    const real = contextFromSnapshot(s);
    const streak = computeStreak(real, computeTimeline(real)).current;
    participants.push({ profile: s.profile, days, ctx, streak, activeToday: isActiveToday(s) });
  }

  // Clasificación del mes y la de hace una semana (para la variación).
  const standings = rankStandings(
    participants.map((p) => ({ p, points: sumRange(p.days, monthStart, monthEnd), adherence: periodAdherence(p.ctx, monthStart, monthEnd) })),
  );
  const lastSunday = addDays(startOfWeek(today), -1);
  const previous =
    lastSunday >= monthStart
      ? new Map(
          rankStandings(
            participants.map((p) => ({ p, points: sumRange(p.days, monthStart, lastSunday), adherence: periodAdherence(p.ctx, monthStart, lastSunday) })),
          ).map((r) => [r.p.profile.id, r.position]),
        )
      : null;

  // Títulos: histórico guardado + campeón del mes anterior si aún no está.
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const rows = titleRows ?? [];
  if (titleRows && prevMonthStart >= LEAGUE_START_MONTH && !rows.some((r) => r.month === prevMonthStart)) {
    const champions = winners(
      participants.map((p) => ({ p, points: sumRange(p.days, prevMonthStart, prevMonthEnd), adherence: periodAdherence(p.ctx, prevMonthStart, prevMonthEnd) })),
    );
    if (champions.length) {
      const fresh = champions.map((c) => ({ month: prevMonthStart, profile_id: c.p.profile.id, points: c.points, adherence: c.adherence }));
      rows.unshift(...fresh.map((f) => ({ ...f, id: `${f.month}:${f.profile_id}` })));
      persistTitles(fresh);
    }
  }
  const titleCount = new Map<string, number>();
  const titlesByMonth = new Map<ISODate, LeagueTitle>();
  for (const r of rows) {
    const profile = byId.get(r.profile_id);
    if (!profile) continue;
    titleCount.set(r.profile_id, (titleCount.get(r.profile_id) ?? 0) + 1);
    const entry = titlesByMonth.get(r.month) ?? { month: r.month, profiles: [], points: r.points };
    entry.profiles.push(profile);
    titlesByMonth.set(r.month, entry);
  }

  const monthDays = dateRange(monthStart, monthEnd);
  const members: LeagueMember[] = standings.map(({ p, points, adherence, position }) => ({
    profile: p.profile,
    isMe: p.profile.id === viewerId,
    position,
    previousPosition: previous?.get(p.profile.id) ?? null,
    points,
    adherence,
    streak: p.streak,
    activeToday: p.activeToday,
    last7: dateRange(addDays(today, -6), today).map((date) => ({ date, points: p.days.get(date)?.total ?? 0 })),
    month: monthDays.map((date) => ({ date, points: date > p.ctx.today ? null : (p.days.get(date)?.total ?? 0) })),
    titles: titleCount.get(p.profile.id) ?? 0,
  }));

  // Jornada: la semana anterior (lunes → domingo).
  const weekStart = addDays(startOfWeek(today), -7);
  const weekEnd = addDays(weekStart, 6);
  const week = rankStandings(
    participants.map((p) => ({ p, points: sumRange(p.days, weekStart, weekEnd), adherence: computeWeek(p.ctx, weekStart).adherence })),
  );
  const mine = week.find((w) => w.p.profile.id === viewerId);
  const matchday: Matchday | null = week.length
    ? {
        weekStart,
        winners: week.filter((w) => w.position === 1 && w.points > 0).map((w) => ({ profile: w.p.profile, points: w.points })),
        me: mine ? { position: mine.position, points: mine.points, of: week.length } : null,
      }
    : null;

  return {
    today,
    monthStart,
    monthEnd,
    members,
    meParticipates: viewer.settings.league_opt_in,
    titles: [...titlesByMonth.values()].sort((a, b) => b.month.localeCompare(a.month)),
    matchday,
  };
});

function persistTitles(rows: { month: ISODate; profile_id: string; points: number; adherence: number }[]) {
  try {
    after(async () => {
      try {
        await db().from("league_titles").upsert(rows, { onConflict: "month,profile_id", ignoreDuplicates: true });
      } catch (error) {
        console.error("[league] guardar títulos", error);
      }
    });
  } catch {
    // `after` no disponible fuera de una petición.
  }
}
