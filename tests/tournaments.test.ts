import { describe, expect, it } from "vitest";
import { dateRange } from "@/lib/dates";
import { isGroupHabit, isLockedHabit } from "@/lib/domain/group-habits";
import { computeDayPoints } from "@/lib/domain/points";
import {
  computeChallenges,
  daysLeft,
  eventHabitKey,
  finalStart,
  isEventHabit,
  TOURNAMENTS,
  tournamentDays,
  tournamentsNeedingEventHabits,
  tournamentStatus,
  tournamentTable,
  type TournamentDay,
  type TournamentDef,
} from "@/lib/domain/tournaments";
import { cardio, ctx, habit, log, workout } from "./helpers";

/** Torneo de prueba: 2 semanas (lunes 5 → domingo 18 de octubre), Final de 7 días. */
const T: TournamentDef = {
  id: "test",
  name: "Test",
  emoji: "🧪",
  tagline: "",
  start: "2026-10-05",
  end: "2026-10-18",
  finalDays: 7,
  finalists: 2,
  challenges: [
    { id: "w3", name: "", emoji: "", description: "", metric: { type: "workout" }, rule: { kind: "weekly", target: 3 }, points: 3 },
    { id: "c20", name: "", emoji: "", description: "", metric: { type: "cardio", minMinutes: 20 }, rule: { kind: "daily" }, points: 1 },
    { id: "f3", name: "", emoji: "", description: "", metric: { type: "habit", key: "fajr" }, rule: { kind: "streak", length: 3 }, points: 5 },
    { id: "tot", name: "", emoji: "", description: "", metric: { type: "workout" }, rule: { kind: "total", target: 4 }, points: 10 },
  ],
};

function days(points: number[], from = "2026-10-05"): TournamentDay[] {
  return dateRange(from, "2026-10-18")
    .slice(0, points.length)
    .map((date, i) => ({ date, league: points[i], challenges: 0, total: points[i] }));
}

describe("catálogo de torneos", () => {
  it("ids únicos, fechas coherentes y retos con id único por torneo", () => {
    expect(new Set(TOURNAMENTS.map((t) => t.id)).size).toBe(TOURNAMENTS.length);
    for (const t of TOURNAMENTS) {
      expect(t.start <= t.end).toBe(true);
      expect(new Set(t.challenges.map((c) => c.id)).size).toBe(t.challenges.length);
      // Los retos de hábitos de evento apuntan a hábitos que existen en el torneo.
      for (const c of t.challenges) {
        if (c.metric.type === "habit" && c.metric.key.startsWith("evento:")) {
          expect(t.eventHabits?.map((h) => eventHabitKey(t.id, h.key))).toContain(c.metric.key);
        }
      }
    }
  });

  it("los hábitos de evento están bloqueados pero no valen como hábito de grupo", () => {
    const ev = { group_key: eventHabitKey("ramadan-2027", "ayuno") };
    expect(isEventHabit(ev)).toBe(true);
    expect(isLockedHabit(ev)).toBe(true);
    expect(isGroupHabit(ev)).toBe(false);
    expect(isGroupHabit({ group_key: "fajr" })).toBe(true);
    expect(isEventHabit({ group_key: "fajr" })).toBe(false);
  });
});

describe("calendario", () => {
  it("estado y días restantes", () => {
    expect(finalStart(T)).toBe("2026-10-12");
    expect(tournamentStatus(T, "2026-10-04")).toBe("upcoming");
    expect(tournamentStatus(T, "2026-10-05")).toBe("regular");
    expect(tournamentStatus(T, "2026-10-11")).toBe("regular");
    expect(tournamentStatus(T, "2026-10-12")).toBe("final");
    expect(tournamentStatus(T, "2026-10-19")).toBe("finished");
    expect(daysLeft(T, "2026-10-02")).toBe(3);
    expect(daysLeft(T, "2026-10-18")).toBe(1);
  });

  it("sin Final: todo es fase regular", () => {
    const noFinal = { ...T, finalDays: 0 };
    expect(finalStart(noFinal)).toBeNull();
    expect(tournamentStatus(noFinal, "2026-10-17")).toBe("regular");
  });

  it("hábitos de evento: se crean una semana antes y hasta el final", () => {
    const ramadan = TOURNAMENTS.find((t) => t.id === "ramadan-2027")!;
    expect(tournamentsNeedingEventHabits("2027-01-31")).not.toContain(ramadan);
    expect(tournamentsNeedingEventHabits("2027-02-01")).toContain(ramadan);
    expect(tournamentsNeedingEventHabits(ramadan.end)).toContain(ramadan);
    expect(tournamentsNeedingEventHabits("2027-03-10")).not.toContain(ramadan);
  });
});

describe("retos", () => {
  it("semanal, diario, racha y total", () => {
    const fajr = habit({ group_key: "fajr", start_date: "2026-10-01" });
    const c = ctx({
      today: "2026-10-18",
      habits: [fajr],
      // Fajr: 5,6,7 (racha 3) · 8 falla · 9..14 (racha 6 → dos veces)
      habitLogs: ["05", "06", "07", "09", "10", "11", "12", "13", "14"].map((d) => log(fajr.id, `2026-10-${d}`)),
      // Entrenos: 3 la primera semana (reto semanal), 1 la segunda (total = 4)
      workouts: [workout("2026-10-05"), workout("2026-10-06"), workout("2026-10-07"), workout("2026-10-13"), workout("2026-10-14", "Descanso", true)],
      // Cardio: solo cuenta el día con ≥ 20 min
      cardio: [cardio("2026-10-05", 15), cardio("2026-10-06", 25)],
    });
    const { awards, progress } = computeChallenges(T, c);
    const by = (id: string) => awards.filter((a) => a.challengeId === id).map((a) => a.date);
    expect(by("w3")).toEqual(["2026-10-07"]);
    expect(by("c20")).toEqual(["2026-10-06"]);
    expect(by("f3")).toEqual(["2026-10-07", "2026-10-11", "2026-10-14"]);
    expect(by("tot")).toEqual(["2026-10-13"]);
    const p = Object.fromEntries(progress.map((x) => [x.challenge.id, x]));
    expect(p.w3).toMatchObject({ times: 1, points: 3, current: 1, goal: 3 });
    expect(p.f3).toMatchObject({ times: 3, points: 15, current: 0 });
    expect(p.tot).toMatchObject({ times: 1, current: 4, goal: 4 });
  });

  it("hoy sin hacer no rompe la racha; nada antes del inicio ni después de hoy", () => {
    const fajr = habit({ group_key: "fajr", start_date: "2026-10-01" });
    const c = ctx({
      today: "2026-10-08",
      habits: [fajr],
      habitLogs: ["03", "04", "06", "07"].map((d) => log(fajr.id, `2026-10-${d}`)),
    });
    const { awards, progress } = computeChallenges(T, c);
    expect(awards.filter((a) => a.challengeId === "f3")).toEqual([]);
    // 6 y 7 hechos, 8 (hoy) pendiente: la racha viva es 2.
    expect(progress.find((p) => p.challenge.id === "f3")?.current).toBe(2);
  });

  it("puntos del torneo = liga + retos, solo dentro del torneo", () => {
    const c = ctx({
      today: "2026-10-18",
      workouts: ["2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07"].map((d) => workout(d)),
    });
    const td = tournamentDays(T, c);
    expect(td[0].date).toBe("2026-10-05");
    expect(td).toHaveLength(14);
    const league = computeDayPoints(c, T.start, T.end);
    expect(td.map((d) => d.league)).toEqual(league.map((d) => d.total));
    // El 7 se completa el reto semanal (3 entrenos en la semana).
    expect(td[2]).toMatchObject({ challenges: 3 });
  });
});

describe("clasificación, Final y podio", () => {
  const entries = [
    { id: "a", days: days([5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1]), adherence: 90 }, // regular 35, final 7
    { id: "b", days: days([4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3]), adherence: 80 }, // regular 28, final 21
    { id: "c", days: days([1, 1, 1, 1, 1, 1, 1, 9, 9, 9, 9, 9, 9, 9]), adherence: 70 }, // regular 7, final 63 (no es finalista)
    { id: "d", days: days([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), adherence: 0 },
  ];

  it("fase regular: el podio es la cabeza de la tabla", () => {
    const table = tournamentTable(T, entries, "2026-10-10");
    expect(table.final).toEqual([]);
    expect(table.regular.map((r) => r.id)).toEqual(["a", "b", "c", "d"]);
    expect(table.podium.map((p) => [p.id, p.place])).toEqual([["a", 1], ["b", 2], ["c", 3]]);
  });

  it("la Final la juegan los 2 primeros y solo cuentan sus puntos; bronce al mejor del resto por total", () => {
    const table = tournamentTable(T, entries, "2026-10-19");
    expect(table.final).toEqual([
      { id: "b", seed: 2, points: 21 },
      { id: "a", seed: 1, points: 7 },
    ]);
    expect(table.podium).toEqual([
      { id: "b", place: 1, points: 21 },
      { id: "a", place: 2, points: 7 },
      { id: "c", place: 3, points: 70 },
    ]);
  });

  it("empate en la Final: gana el mejor de la fase regular", () => {
    const tie = [
      { id: "a", days: days([2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1]), adherence: 50 },
      { id: "b", days: days([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), adherence: 50 },
    ];
    const table = tournamentTable(T, tie, "2026-10-19");
    expect(table.podium.map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("con menos de 2 con puntos no hay Final; nadie sube al podio con 0", () => {
    const solo = [
      { id: "a", days: days([1]), adherence: 10 },
      { id: "b", days: days([0]), adherence: 0 },
    ];
    const table = tournamentTable(T, solo, "2026-10-19");
    expect(table.final).toEqual([]);
    expect(table.podium).toEqual([{ id: "a", place: 1, points: 1 }]);
  });
});

describe("hábitos con fecha de fin", () => {
  it("un hábito de evento no se programa ni puntúa después de end_date", () => {
    const key = eventHabitKey("test", "ayuno");
    const h = habit({ group_key: key, start_date: "2026-10-05", end_date: "2026-10-06", required: false });
    const c = ctx({ today: "2026-10-08", habits: [h], habitLogs: [log(h.id, "2026-10-06"), log(h.id, "2026-10-07")] });
    const t = { ...T, challenges: [{ id: "x", name: "", emoji: "", description: "", metric: { type: "habit" as const, key }, rule: { kind: "daily" as const }, points: 2 }] };
    expect(computeChallenges(t, c).awards.map((a) => a.date)).toEqual(["2026-10-06"]);
  });
});
