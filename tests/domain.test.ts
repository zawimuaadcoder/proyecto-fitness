import { describe, expect, it } from "vitest";
import { addDays, isoWeekday, startOfWeek, todayInTimeZone, isoWeekNumber } from "@/lib/dates";
import { computeStreak, computeTimeline } from "@/lib/domain/streak";
import { computeAdherence, computeWeek } from "@/lib/domain/week";
import { weightOverview, weightSeries } from "@/lib/domain/weight";
import { evaluateDay } from "@/lib/domain/habits";
import { cardio, ctx, habit, log, weight, workout } from "./helpers";

describe("fechas", () => {
  it("semana lunes → domingo", () => {
    expect(isoWeekday("2026-10-11")).toBe(7); // domingo
    expect(startOfWeek("2026-10-11")).toBe("2026-10-05");
    expect(startOfWeek("2026-10-12")).toBe("2026-10-12");
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30"); // cambio de hora no afecta
  });

  it("día local según zona horaria", () => {
    const instant = new Date("2026-10-11T23:30:00Z");
    expect(todayInTimeZone("Europe/Madrid", instant)).toBe("2026-10-12");
    expect(todayInTimeZone("America/Mexico_City", instant)).toBe("2026-10-11");
  });

  it("número de semana ISO", () => {
    expect(isoWeekNumber("2026-01-01")).toBe(1);
    expect(isoWeekNumber("2026-10-11")).toBe(41);
  });
});

describe("racha", () => {
  it("cuenta días completados seguidos y hoy pendiente no rompe", () => {
    const h = habit({ start_date: "2026-10-01" });
    const logs = ["2026-10-01", "2026-10-02", "2026-10-03"].map((d) => log(h.id, d));
    const c = ctx({ today: "2026-10-04", habits: [h], habitLogs: logs });
    const s = computeStreak(c);
    expect(s.current).toBe(3);
    expect(s.today).toBe("pending");
  });

  it("un día fallido reinicia la racha", () => {
    const h = habit({ start_date: "2026-10-01" });
    const logs = ["2026-10-01", "2026-10-02", "2026-10-04"].map((d) => log(h.id, d));
    const c = ctx({ today: "2026-10-04", habits: [h], habitLogs: logs });
    const s = computeStreak(c);
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
  });

  it("los hábitos no programados ese día no cuentan (día de descanso)", () => {
    // Lunes a viernes; 2026-10-03 y 04 son sábado/domingo
    const h = habit({ start_date: "2026-10-01", weekdays: [1, 2, 3, 4, 5] });
    const logs = ["2026-10-01", "2026-10-02", "2026-10-05"].map((d) => log(h.id, d));
    const c = ctx({ today: "2026-10-05", habits: [h], habitLogs: logs });
    const t = computeTimeline(c);
    expect(t.find((d) => d.date === "2026-10-03")?.status).toBe("rest");
    expect(computeStreak(c).current).toBe(3);
  });

  it("un descanso planificado excusa el hábito de entreno", () => {
    const w = habit({ kind: "workout", start_date: "2026-10-01" });
    const c = ctx({
      today: "2026-10-03",
      habits: [w],
      workouts: [workout("2026-10-01"), workout("2026-10-02", "Descanso", true), workout("2026-10-03")],
    });
    expect(evaluateDay("2026-10-02", c).status).toBe("rest");
    expect(computeStreak(c).current).toBe(2);
  });

  it("hábito de cardio parcial queda en progreso y falla al cerrar el día", () => {
    const h = habit({ kind: "cardio", target: 30, start_date: "2026-10-01" });
    const c = ctx({ today: "2026-10-02", habits: [h], cardio: [cardio("2026-10-01", 20), cardio("2026-10-02", 24)] });
    expect(evaluateDay("2026-10-01", c).status).toBe("failed");
    const today = evaluateDay("2026-10-02", c);
    expect(today.habits[0].status).toBe("in_progress");
    expect(today.habits[0].details.at(-1)).toEqual({ label: "Restante", value: "6 min" });
  });

  it("detecta el día en que se supera la mejor racha", () => {
    const h = habit({ start_date: "2026-10-01" });
    const days = ["2026-10-01", "2026-10-02", "2026-10-04", "2026-10-05", "2026-10-06"];
    const c = ctx({ today: "2026-10-06", habits: [h], habitLogs: days.map((d) => log(h.id, d)) });
    const s = computeStreak(c);
    expect(s.current).toBe(3);
    expect(s.isRecord).toBe(true);
  });
});

describe("cumplimiento semanal", () => {
  it("fórmula ponderada y sin superar 100", () => {
    const r = computeAdherence({
      habitsPercent: 90,
      workouts: 5,
      cardioDays: 3,
      cardioMinutes: 200,
      goals: { workoutTarget: 4, cardioMode: "both", cardioDaysTarget: 3, cardioMinutesTarget: 150 },
      weights: { habits: 40, workouts: 30, cardio: 30 },
    });
    expect(r.adherence).toBe(96);
  });

  it("excluye componentes sin objetivo", () => {
    const r = computeAdherence({
      habitsPercent: null,
      workouts: 2,
      cardioDays: 0,
      cardioMinutes: 0,
      goals: { workoutTarget: 4, cardioMode: "both", cardioDaysTarget: 0, cardioMinutesTarget: 0 },
      weights: { habits: 40, workouts: 30, cardio: 30 },
    });
    expect(r.adherence).toBe(50);
  });

  it("semana cerrada con faltantes y peso fuera del porcentaje", () => {
    const h = habit({ start_date: "2026-09-28" });
    const week = "2026-09-28";
    const logs = [0, 1, 2, 3, 4, 5, 6].map((i) => log(h.id, addDays(week, i)));
    const c = ctx({
      today: "2026-10-05",
      habits: [h],
      habitLogs: logs,
      workouts: [workout("2026-09-28"), workout("2026-09-30"), workout("2026-10-02")],
      cardio: [cardio("2026-09-29", 60), cardio("2026-10-01", 72)],
      weights: [weight("2026-09-28", 80), weight("2026-10-03", 79)],
      goals: [
        { id: "g", profile_id: "p", week_start: "2026-09-01", workout_sessions_target: 3, cardio_mode: "minutes", cardio_days_target: 3, cardio_minutes_target: 150 },
      ],
    });
    const m = computeWeek(c, week);
    expect(m.isClosed).toBe(true);
    expect(m.workouts.count).toBe(3);
    expect(m.cardio.minutes).toBe(132);
    expect(m.avgWeight).toBe(79.5);
    expect(m.objectives.find((o) => o.key === "cardio_minutes")?.missing).toBe("Te faltaron 18 minutos de cardio.");
    // 0.4·1 + 0.3·1 + 0.3·(132/150) = 0.964
    expect(m.adherence).toBe(96);
  });
});

describe("peso", () => {
  it("media semanal y cambio entre semanas", () => {
    const entries = [
      weight("2026-09-28", 77.2),
      weight("2026-10-01", 77.0),
      weight("2026-10-05", 76.8),
      weight("2026-10-08", 76.4),
    ];
    const o = weightOverview(weightSeries(entries, "kg"), "2026-10-11");
    expect(o.weekAvg).toBeCloseTo(76.6);
    expect(o.prevWeekAvg).toBeCloseTo(77.1);
    expect(o.weekChange).toBeCloseTo(-0.5);
  });
});
