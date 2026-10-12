import "server-only";
import { after } from "next/server";
import { cache } from "react";
import { addDays, dateRange, minDate, type ISODate } from "@/lib/dates";
import { periodAdherence } from "@/lib/domain/points";
import {
  computeChallenges,
  daysLeft,
  eventHabitKey,
  finalStart,
  getTournament,
  TOURNAMENTS,
  tournamentDays,
  tournamentsNeedingEventHabits,
  tournamentStatus,
  tournamentTable,
  type ChallengeProgress,
  type TournamentDay,
  type TournamentDef,
  type TournamentStatus,
} from "@/lib/domain/tournaments";
import { db, unwrap } from "@/lib/server/supabase";
import type { PublicProfile, TournamentTrophyRow } from "@/types/db";
import type { ProfileSnapshot } from "@/types/domain";
import { isLeagueParticipant, leagueContextOf, readTitles } from "./league";
import { listProfiles } from "./profiles";
import { loadSnapshot } from "./snapshot";

export interface TournamentMember {
  profile: PublicProfile;
  isMe: boolean;
  /** Puesto en la fase regular (o en el torneo, si no tiene Final). */
  position: number;
  /** Puntos de la fase regular. */
  points: number;
  /** Puntos de todo el torneo (liga + retos). */
  total: number;
  /** De ellos, por retos. */
  challengePoints: number;
  adherence: number;
  /** Puntos de los últimos 7 días del torneo. */
  last7: { date: ISODate; points: number }[];
}

export interface TournamentView {
  def: TournamentDef;
  status: TournamentStatus;
  today: ISODate;
  daysLeft: number;
  finalStart: ISODate | null;
  members: TournamentMember[];
  /** Finalistas (vacío hasta que empieza la Final). */
  final: { profile: PublicProfile; isMe: boolean; seed: number; points: number }[];
  podium: { profile: PublicProfile; isMe: boolean; place: 1 | 2 | 3; points: number }[];
  /** Retos del perfil que mira (null si no participa). */
  myChallenges: ChallengeProgress[] | null;
  meParticipates: boolean;
}

interface Participant {
  profile: PublicProfile;
  ctx: ReturnType<typeof leagueContextOf>;
  snapshot: ProfileSnapshot;
}

/** Participantes de liga y torneos (los mismos), con su contexto antitrampas. */
const loadParticipants = cache(async (): Promise<Participant[]> => {
  const profiles = await listProfiles();
  const snapshots = await Promise.all(profiles.map((p) => loadSnapshot(p.id)));
  return snapshots
    .filter((s): s is ProfileSnapshot => Boolean(s && isLeagueParticipant(s)))
    .map((s) => ({ profile: s.profile, ctx: leagueContextOf(s), snapshot: s }));
});

function computeTable(t: TournamentDef, participants: Participant[], today: ISODate) {
  const fs = finalStart(t);
  const regularEnd = fs ? addDays(fs, -1) : t.end;
  const rows = participants.map((p) => {
    const days = tournamentDays(t, p.ctx);
    return {
      p,
      days,
      challenges: computeChallenges(t, p.ctx).progress,
      adherence: p.ctx.today >= t.start ? periodAdherence(p.ctx, t.start, minDate(regularEnd, p.ctx.today)) : 0,
    };
  });
  const table = tournamentTable(
    t,
    rows.map((r) => ({ id: r.p.profile.id, days: r.days, adherence: r.adherence })),
    today,
  );
  return { rows, table };
}

/** Torneo con su clasificación, Final, podio y los retos del perfil que mira. */
export const loadTournament = cache(async (viewerId: string, tournamentId: string): Promise<TournamentView | null> => {
  const def = getTournament(tournamentId);
  const viewer = await loadSnapshot(viewerId);
  if (!def || !viewer) return null;
  const today = viewer.today;
  const participants = await loadParticipants();
  const { rows, table } = computeTable(def, participants, today);
  const status = tournamentStatus(def, today);

  const byId = new Map(rows.map((r) => [r.p.profile.id, r]));
  const profileOf = (id: string) => byId.get(id)!.p.profile;
  const last7From = addDays(minDate(def.end, today), -6);
  const members: TournamentMember[] = table.regular.map((r) => {
    const row = byId.get(r.id)!;
    const sumChallenges = row.days.reduce((s, d) => s + d.challenges, 0);
    return {
      profile: row.p.profile,
      isMe: r.id === viewerId,
      position: r.position,
      points: r.points,
      total: r.total,
      challengePoints: sumChallenges,
      adherence: r.adherence,
      last7: dateRange(last7From, minDate(def.end, today))
        .filter((d) => d >= def.start)
        .map((date) => ({ date, points: row.days.find((x: TournamentDay) => x.date === date)?.total ?? 0 })),
    };
  });

  if (status === "finished" && table.podium.length) persistTrophies(def.id, table.podium);

  const mine = byId.get(viewerId);
  return {
    def,
    status,
    today,
    daysLeft: daysLeft(def, today),
    finalStart: finalStart(def),
    members,
    final: table.final.map((f) => ({ profile: profileOf(f.id), isMe: f.id === viewerId, seed: f.seed, points: f.points })),
    podium: table.podium.map((p) => ({ profile: profileOf(p.id), isMe: p.id === viewerId, place: p.place, points: p.points })),
    myChallenges: mine ? mine.challenges : null,
    meParticipates: Boolean(mine),
  };
});

export interface TournamentSummary {
  def: TournamentDef;
  status: TournamentStatus;
  daysLeft: number;
}

/** Calendario: en juego primero, luego los próximos y al final los terminados. */
export function listTournaments(today: ISODate): TournamentSummary[] {
  const order: Record<TournamentStatus, number> = { final: 0, regular: 0, upcoming: 1, finished: 2 };
  return TOURNAMENTS.map((def) => ({ def, status: tournamentStatus(def, today), daysLeft: daysLeft(def, today) })).sort(
    (a, b) =>
      order[a.status] - order[b.status] ||
      (a.status === "finished" ? b.def.start.localeCompare(a.def.start) : a.def.start.localeCompare(b.def.start)),
  );
}

/** El torneo que toca destacar: el que está en juego o el próximo. */
export function featuredTournament(today: ISODate): TournamentSummary | null {
  return listTournaments(today).find((t) => t.status !== "finished") ?? null;
}

// ---------------------------------------------------------------------------
// Palmarés
// ---------------------------------------------------------------------------

export type Trophy =
  | { kind: "league"; month: ISODate; points: number }
  | { kind: "tournament"; tournament: TournamentDef; place: 1 | 2 | 3; points: number };

export interface PalmaresEntry {
  profile: PublicProfile;
  trophies: Trophy[];
  /** Títulos (campeón de liga o de torneo). */
  titles: number;
}

async function readTrophies(): Promise<TournamentTrophyRow[] | null> {
  try {
    return unwrap(await db().from("tournament_trophies").select("*")) as TournamentTrophyRow[];
  } catch (error) {
    // Sin la migración de torneos: sin palmarés de torneos, pero todo funciona.
    console.error("[torneos] trofeos", error);
    return null;
  }
}

/**
 * Palmarés del grupo: títulos de liga + podios de torneos. Si un torneo ya
 * terminó y su podio aún no está guardado, se calcula y se guarda.
 */
export const loadPalmares = cache(async (viewerId: string): Promise<PalmaresEntry[]> => {
  const [profiles, viewer, titles, stored] = await Promise.all([
    listProfiles(),
    loadSnapshot(viewerId),
    readTitles(),
    readTrophies(),
  ]);
  const trophies = [...(stored ?? [])];

  if (stored && viewer) {
    const pending = TOURNAMENTS.filter(
      (t) => tournamentStatus(t, viewer.today) === "finished" && !stored.some((r) => r.tournament_id === t.id),
    );
    if (pending.length) {
      const participants = await loadParticipants();
      for (const t of pending) {
        const { podium } = computeTable(t, participants, viewer.today).table;
        if (!podium.length) continue;
        trophies.push(...podium.map((p) => ({ id: `${t.id}:${p.id}`, tournament_id: t.id, profile_id: p.id, place: p.place, points: p.points })));
        persistTrophies(t.id, podium);
      }
    }
  }

  const byProfile = new Map<string, Trophy[]>();
  const add = (id: string, t: Trophy) => byProfile.set(id, [...(byProfile.get(id) ?? []), t]);
  for (const r of titles ?? []) add(r.profile_id, { kind: "league", month: r.month, points: r.points });
  for (const r of trophies) {
    const tournament = getTournament(r.tournament_id);
    if (tournament) add(r.profile_id, { kind: "tournament", tournament, place: r.place, points: r.points });
  }

  const dateOf = (t: Trophy) => (t.kind === "league" ? t.month : t.tournament.end);
  return profiles
    .map((profile) => {
      const list = (byProfile.get(profile.id) ?? []).sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
      const titles = list.filter((t) => t.kind === "league" || t.place === 1).length;
      return { profile, trophies: list, titles };
    })
    .filter((e) => e.trophies.length > 0)
    .sort((a, b) => b.titles - a.titles || b.trophies.length - a.trophies.length || a.profile.name.localeCompare(b.profile.name));
});

function persistTrophies(tournamentId: string, podium: { id: string; place: 1 | 2 | 3; points: number }[]) {
  const rows = podium.map((p) => ({ tournament_id: tournamentId, profile_id: p.id, place: p.place, points: p.points }));
  try {
    after(async () => {
      try {
        await db().from("tournament_trophies").upsert(rows, { onConflict: "tournament_id,profile_id", ignoreDuplicates: true });
      } catch (error) {
        console.error("[torneos] guardar trofeos", error);
      }
    });
  } catch {
    // `after` no disponible fuera de una petición.
  }
}

// ---------------------------------------------------------------------------
// Hábitos de evento
// ---------------------------------------------------------------------------

/**
 * Da de alta (en segundo plano) los hábitos de evento de los torneos que estén
 * en juego o a punto de empezar: opcionales (no rompen la racha), bloqueados y
 * programados solo entre el inicio y el final del torneo. Idempotente.
 */
export function scheduleEventHabits(s: ProfileSnapshot) {
  if (!isLeagueParticipant(s)) return;
  const missing = tournamentsNeedingEventHabits(s.today).flatMap((t) =>
    (t.eventHabits ?? [])
      .map((h) => ({ t, h, key: eventHabitKey(t.id, h.key) }))
      .filter(({ key }) => !s.habits.some((x) => x.group_key === key)),
  );
  if (!missing.length) return;
  try {
    after(async () => {
      try {
        for (const { t, h, key } of missing) {
          // El índice único (profile_id, group_key) es parcial: insert y, si ya
          // existe (otra petición se adelantó), se ignora.
          const { data, error } = await db()
            .from("habits")
            .insert({
              profile_id: s.profile.id,
              name: h.name,
              icon: h.icon,
              kind: h.kind,
              required: false,
              active: true,
              sort_order: 0,
              start_date: t.start,
              end_date: t.end,
              group_key: key,
            })
            .select("id");
          if (error?.code === "23505") continue;
          if (error) throw error;
          const id = (data as { id: string }[] | null)?.[0]?.id;
          if (!id) continue;
          unwrap(
            await db()
              .from("habit_schedules")
              .upsert(
                [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({ habit_id: id, profile_id: s.profile.id, weekday })),
                { onConflict: "habit_id,weekday", ignoreDuplicates: true },
              ),
          );
        }
      } catch (error) {
        console.error("[torneos] hábitos de evento", error);
      }
    });
  } catch {
    // `after` no disponible fuera de una petición.
  }
}
