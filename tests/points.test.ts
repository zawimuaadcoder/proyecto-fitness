import { describe, expect, it } from "vitest";
import { dateRange, endOfMonth, startOfMonth } from "@/lib/dates";
import { buildContext } from "@/lib/domain/context";
import {
  computeDayPoints,
  isPunctual,
  leagueContext,
  periodAdherence,
  punctualInput,
  rankStandings,
  sumPoints,
  winners,
} from "@/lib/domain/points";
import type { WeeklyGoalRow } from "@/types/db";
import { cardio, ctx, habit, log, weight, workout } from "./helpers";

const WEEK = dateRange("2026-10-05", "2026-10-11"); // lunes → domingo
const TZ = "Europe/Madrid";

const settings = {
  weight_unit: "kg" as const,
  workout_days: [1, 3, 5],
  habits_goal_percent: 85,
  weight_habits: 40,
  weight_workouts: 30,
  weight_cardio: 30,
  goal: null,
  target_weight: null,
};

function goal(partial: Partial<WeeklyGoalRow>): WeeklyGoalRow {
  return {
    id: "g",
    profile_id: "p",
    week_start: "2026-10-05",
    workout_sessions_target: 3,
    cardio_mode: "both",
    cardio_days_target: 3,
    cardio_minutes_target: 150,
    ...partial,
  };
}

describe("puntos de liga", () => {
  it("semana completa: topes por objetivo, bonus de racha y de semana", () => {
    const h = habit({ start_date: "2026-10-05" });
    const c = ctx({
      today: "2026-10-12",
      habits: [h],
      habitLogs: WEEK.map((d) => log(h.id, d)),
      workouts: WEEK.slice(0, 5).map((d) => workout(d)), // 5 entrenos, objetivo 3
      cardio: WEEK.slice(0, 4).map((d) => cardio(d, 30)), // 4 días, objetivo 3
    });
    const days = computeDayPoints(c, "2026-10-05", "2026-10-11");
    expect(days.map((d) => d.total)).toEqual([3, 3, 3, 1, 1, 1, 4]);
    expect(days[6]).toMatchObject({ habits: 1, streak: 1, week: 2 });
    expect(sumPoints(days)).toBe(16);
  });

  it("los entrenos de más en un día no suman (máximo 3 base al día)", () => {
    const h = habit({ start_date: "2026-10-05" });
    const c = ctx({
      today: "2026-10-06",
      habits: [h],
      habitLogs: [log(h.id, "2026-10-05")],
      workouts: [workout("2026-10-05"), workout("2026-10-05", "Full body"), workout("2026-10-05", "Otro")],
      cardio: [cardio("2026-10-05", 20), cardio("2026-10-05", 90)],
    });
    expect(computeDayPoints(c, "2026-10-05", "2026-10-05")[0].total).toBe(3);
  });

  it("modo minutos: el cardio deja de puntuar al alcanzar el objetivo", () => {
    const c = ctx({
      today: "2026-10-12",
      goals: [goal({ cardio_mode: "minutes", cardio_minutes_target: 60 })],
      cardio: ["2026-10-05", "2026-10-06", "2026-10-07"].map((d) => cardio(d, 40)),
    });
    const days = computeDayPoints(c, "2026-10-05", "2026-10-07");
    expect(days.map((d) => d.cardio)).toEqual([1, 1, 0]);
  });

  it("objetivo 0 → esa categoría no puntúa", () => {
    const c = ctx({ today: "2026-10-06", goals: [goal({ workout_sessions_target: 0 })], workouts: [workout("2026-10-05")] });
    expect(computeDayPoints(c, "2026-10-05", "2026-10-05")[0].workout).toBe(0);
  });

  it("el peso no puntúa", () => {
    const c = ctx({ today: "2026-10-12", weights: WEEK.map((d) => weight(d, 80)) });
    expect(sumPoints(computeDayPoints(c, "2026-10-05", "2026-10-11"))).toBe(0);
  });

  it("semana por debajo del 80 % no da bonus y la semana en curso tampoco", () => {
    const h = habit({ start_date: "2026-10-05" });
    const partial = ctx({ today: "2026-10-12", habits: [h], habitLogs: WEEK.map((d) => log(h.id, d)) });
    // Solo hábitos: entrenos 0/3 y cardio 0 → 40 %
    expect(computeDayPoints(partial, "2026-10-11", "2026-10-11")[0].week).toBe(0);

    const running = ctx({
      today: "2026-10-11",
      habits: [h],
      habitLogs: WEEK.map((d) => log(h.id, d)),
      workouts: WEEK.slice(0, 3).map((d) => workout(d)),
      cardio: WEEK.slice(0, 5).map((d) => cardio(d, 40)),
    });
    expect(computeDayPoints(running, "2026-10-11", "2026-10-11")[0].week).toBe(0);
  });

  it("el bonus de racha cae cada 7 días seguidos", () => {
    const h = habit({ start_date: "2026-09-28" });
    const dates = dateRange("2026-09-28", "2026-10-11");
    const c = ctx({ today: "2026-10-12", habits: [h], habitLogs: dates.map((d) => log(h.id, d)) });
    const streakDays = computeDayPoints(c, "2026-09-28", "2026-10-11").filter((d) => d.streak > 0).map((d) => d.date);
    expect(streakDays).toEqual(["2026-10-04", "2026-10-11"]);
  });

  it("solo lo de hoy y ayer suma; descansos planificados por adelantado sí valen", () => {
    expect(isPunctual("2026-10-11", "2026-10-11T08:00:00Z", TZ)).toBe(true);
    expect(isPunctual("2026-10-11", "2026-10-12T20:00:00Z", TZ)).toBe(true); // ayer
    expect(isPunctual("2026-10-11", "2026-10-12T22:30:00Z", TZ)).toBe(false); // ya es 13 en Madrid
    expect(isPunctual("2026-10-11", "2026-10-12T22:30:00Z", "America/Mexico_City")).toBe(true);
    expect(isPunctual("2026-10-11", "2026-10-09T10:00:00Z", TZ)).toBe(false); // adelantado
    expect(isPunctual("2026-10-11", "2026-10-09T10:00:00Z", TZ, true)).toBe(true);

    const late = { ...workout("2026-10-05"), created_at: "2026-10-08T10:00:00Z" };
    const onTime = { ...cardio("2026-10-05", 30), created_at: "2026-10-06T09:00:00Z" };
    const input = {
      today: "2026-10-12",
      settings,
      habits: [],
      habitLogs: [],
      weights: [],
      workouts: [late],
      cardio: [onTime],
      goals: [],
    };
    expect(punctualInput(input, TZ).workouts).toHaveLength(0);
    const day = computeDayPoints(leagueContext(input, TZ), "2026-10-05", "2026-10-05")[0];
    expect(day).toMatchObject({ workout: 0, cardio: 1 });
    // Sin filtrar sí habría contado el entreno
    expect(computeDayPoints(buildContext(input), "2026-10-05", "2026-10-05")[0].workout).toBe(1);
  });

  it("un hábito marcado días después no completa el día", () => {
    const h = habit({ start_date: "2026-10-05" });
    const input = {
      today: "2026-10-12",
      settings,
      habits: [h],
      habitLogs: [log(h.id, "2026-10-05", { created_at: "2026-10-05T10:00:00Z", updated_at: "2026-10-09T10:00:00Z" })],
      weights: [],
      workouts: [],
      cardio: [],
      goals: [],
    };
    expect(computeDayPoints(leagueContext(input, TZ), "2026-10-05", "2026-10-05")[0].habits).toBe(0);
  });

  it("los topes semanales se respetan aunque el rango empiece a mitad de semana", () => {
    const c = ctx({ today: "2026-10-12", workouts: WEEK.map((d) => workout(d)) });
    // Lun–mié ya agotan el objetivo (3): de jueves a domingo no suma
    expect(computeDayPoints(c, "2026-10-08", "2026-10-11").every((d) => d.workout === 0)).toBe(true);
  });

  it("no calcula días futuros", () => {
    const c = ctx({ today: "2026-10-07" });
    expect(computeDayPoints(c, "2026-10-01", "2026-10-31").at(-1)?.date).toBe("2026-10-07");
    expect(computeDayPoints(c, "2026-11-01", "2026-11-30")).toEqual([]);
  });
});

describe("cumplimiento del periodo", () => {
  it("prorratea los objetivos a los días transcurridos", () => {
    const h = habit({ start_date: "2026-10-01" });
    const dates = dateRange("2026-10-01", "2026-10-14");
    const c = ctx({
      today: "2026-10-15",
      habits: [h],
      habitLogs: dates.map((d) => log(h.id, d)),
      workouts: dates.filter((_, i) => i % 7 < 3).map((d) => workout(d)), // 6 en 14 días (objetivo 3/sem)
      cardio: dates.filter((_, i) => i % 7 < 3).map((d) => cardio(d, 50)), // 6 días y 300 min
    });
    expect(periodAdherence(c, "2026-10-01", "2026-10-31")).toBe(100);
    expect(periodAdherence(ctx({ today: "2026-10-15" }), "2026-10-01", "2026-10-31")).toBe(0);
  });
});

describe("clasificación", () => {
  it("desempata por cumplimiento y comparte puesto en empate total", () => {
    const ranked = rankStandings([
      { id: "a", points: 10, adherence: 70 },
      { id: "b", points: 12, adherence: 50 },
      { id: "c", points: 10, adherence: 90 },
      { id: "d", points: 10, adherence: 70 },
    ]);
    expect(ranked.map((r) => [r.id, r.position])).toEqual([
      ["b", 1],
      ["c", 2],
      ["a", 3],
      ["d", 3],
    ]);
  });

  it("cotitulares y nadie gana con 0 puntos", () => {
    expect(winners([{ id: "a", points: 5, adherence: 80 }, { id: "b", points: 5, adherence: 80 }]).map((w) => w.id)).toEqual(["a", "b"]);
    expect(winners([{ id: "a", points: 0, adherence: 0 }])).toEqual([]);
  });

  it("límites del mes natural", () => {
    expect(startOfMonth("2026-10-12")).toBe("2026-10-01");
    expect(endOfMonth("2026-10-12")).toBe("2026-10-31");
    expect(endOfMonth("2028-02-10")).toBe("2028-02-29");
    expect(endOfMonth("2026-12-31")).toBe("2026-12-31");
  });
});

describe("hábitos de grupo", () => {
  const start = "2026-10-05";
  const fajr = habit({ name: "Fajr", group_key: "fajr", start_date: start });
  const entrenar = habit({ name: "Entrenar", kind: "workout", group_key: "workout", start_date: start });
  const quran = habit({ name: "Leer Corán", group_key: "quran", start_date: start });
  const habits = [fajr, entrenar, quran];

  it("valen 3 cada uno y van fuera del tope diario", () => {
    const c = ctx({
      today: "2026-10-12",
      habits,
      habitLogs: [log(fajr.id, "2026-10-05"), log(quran.id, "2026-10-05"), log(fajr.id, "2026-10-06")],
      workouts: [workout("2026-10-05")],
      cardio: [cardio("2026-10-05", 30)],
    });
    const [mon, tue] = computeDayPoints(c, "2026-10-05", "2026-10-06");
    // Lunes: 3 base (entreno + cardio + día de hábitos) + 3 × 3 de grupo
    expect(mon).toMatchObject({ workout: 1, cardio: 1, habits: 1, group: 9, total: 12 });
    // Martes: solo Fajr → 3, y el día de hábitos no se completa
    expect(tue).toMatchObject({ habits: 0, group: 3, total: 3 });
  });

  it("Entrenar puntúa cada día aunque se pase del objetivo semanal; el descanso no suma ni rompe", () => {
    const c = ctx({
      today: "2026-10-12",
      habits,
      goals: [goal({ workout_sessions_target: 1 })],
      habitLogs: [log(fajr.id, "2026-10-07"), log(quran.id, "2026-10-07")],
      workouts: [workout("2026-10-05"), workout("2026-10-06"), workout("2026-10-07", "Descanso", true)],
    });
    const [mon, tue, wed] = computeDayPoints(c, "2026-10-05", "2026-10-07");
    expect(mon).toMatchObject({ workout: 1, group: 3 });
    expect(tue).toMatchObject({ workout: 0, group: 3 });
    // Miércoles: descanso planificado, Fajr y Corán hechos → día completo
    expect(wed).toMatchObject({ workout: 0, habits: 1, group: 6, total: 7 });
  });

  it("antitrampas: marcarlos días después no puntúa", () => {
    const input = {
      today: "2026-10-12",
      settings,
      habits,
      habitLogs: [
        log(fajr.id, "2026-10-05", { created_at: "2026-10-05T05:00:00Z", updated_at: "2026-10-05T05:00:00Z" }),
        log(quran.id, "2026-10-05", { created_at: "2026-10-08T10:00:00Z", updated_at: "2026-10-08T10:00:00Z" }),
      ],
      weights: [],
      workouts: [],
      cardio: [],
      goals: [],
    };
    expect(computeDayPoints(leagueContext(input, TZ), "2026-10-05", "2026-10-05")[0].group).toBe(3);
  });

  it("no puntúan antes de su fecha de inicio", () => {
    const late = habit({ group_key: "fajr", start_date: "2026-10-07" });
    const c = ctx({ today: "2026-10-12", habits: [late], habitLogs: [log(late.id, "2026-10-06")] });
    expect(computeDayPoints(c, "2026-10-06", "2026-10-06")[0].group).toBe(0);
  });
});
