import { describe, expect, it } from "vitest";
import { comparisonPeriods } from "@/lib/domain/insights";
import { comparePeriods } from "@/lib/domain/compare";
import { rangeStats } from "@/lib/domain/stats";
import { computeWeek, defaultGoals, goalsForWeek } from "@/lib/domain/week";
import { evaluateHabit } from "@/lib/domain/habits";
import { filterRange, weightSeries } from "@/lib/domain/weight";
import type { WeeklyGoalRow } from "@/types/db";
import { cardio, ctx, habit, log, weight, workout } from "./helpers";

const goalRow = (week_start: string, workouts: number): WeeklyGoalRow => ({
  id: `g-${week_start}`,
  profile_id: "p",
  week_start,
  workout_sessions_target: workouts,
  cardio_mode: "both",
  cardio_days_target: 3,
  cardio_minutes_target: 150,
});

describe("comparisonPeriods", () => {
  it("en lunes compara la semana cerrada anterior con la previa", () => {
    const p = comparisonPeriods("2026-10-12");
    expect(p.partial).toBe(false);
    expect(p.current).toEqual({ from: "2026-10-05", to: "2026-10-11" });
    expect(p.previous).toEqual({ from: "2026-09-28", to: "2026-10-04" });
  });

  it("otro día compara semana en curso con los mismos días de la pasada", () => {
    const p = comparisonPeriods("2026-10-14");
    expect(p.partial).toBe(true);
    expect(p.current).toEqual({ from: "2026-10-12", to: "2026-10-14" });
    expect(p.previous).toEqual({ from: "2026-10-05", to: "2026-10-07" });
  });

  it("en domingo cubre 7 días contra 7 días", () => {
    const p = comparisonPeriods("2026-10-11");
    expect(p.current).toEqual({ from: "2026-10-05", to: "2026-10-11" });
    expect(p.previous).toEqual({ from: "2026-09-28", to: "2026-10-04" });
  });
});

describe("comparePeriods", () => {
  const base = { workouts: 2, cardioMinutes: 60, habitsPercent: null, avgWeight: 80 };
  const find = (r: ReturnType<typeof comparePeriods>, key: string) => r.find((c) => c.key === key);

  it("peso neutral sin objetivo aunque el cambio sea grande", () => {
    const r = comparePeriods({ ...base, avgWeight: 75 }, base, "kg", null);
    expect(find(r, "weight")?.tone).toBe("neutral");
  });

  it("bajar de peso es positivo con objetivo lose_fat", () => {
    const r = comparePeriods({ ...base, avgWeight: 79 }, base, "kg", "lose_fat");
    expect(find(r, "weight")?.tone).toBe("positive");
  });

  it("subir de peso es negativo con objetivo lose_fat", () => {
    const r = comparePeriods({ ...base, avgWeight: 81 }, base, "kg", "lose_fat");
    expect(find(r, "weight")?.tone).toBe("negative");
  });

  it("entrenos y cardio siguen el signo", () => {
    const up = comparePeriods({ ...base, workouts: 4, cardioMinutes: 90 }, base, "kg", null);
    expect(find(up, "workouts")?.tone).toBe("positive");
    expect(find(up, "cardio")?.tone).toBe("positive");
    const down = comparePeriods({ ...base, workouts: 1, cardioMinutes: 30 }, base, "kg", null);
    expect(find(down, "workouts")?.tone).toBe("negative");
    expect(find(down, "cardio")?.tone).toBe("negative");
    const same = comparePeriods(base, base, "kg", null);
    expect(find(same, "workouts")?.tone).toBe("neutral");
    expect(find(same, "cardio")?.tone).toBe("neutral");
  });
});

describe("rangeStats", () => {
  it("hábito pendiente hoy no cuenta en el total", () => {
    const h = habit({ start_date: "2026-10-01" });
    const c = ctx({ today: "2026-10-12", habits: [h] });
    const s = rangeStats(c, "2026-10-12", "2026-10-12");
    expect(s.habitsTotal).toBe(0);
    expect(s.habitsPercent).toBeNull();
  });

  it("hábito completado hoy sí cuenta", () => {
    const h = habit({ start_date: "2026-10-01" });
    const c = ctx({ today: "2026-10-12", habits: [h], habitLogs: [log(h.id, "2026-10-12")] });
    const s = rangeStats(c, "2026-10-12", "2026-10-12");
    expect(s.habitsTotal).toBe(1);
    expect(s.habitsDone).toBe(1);
    expect(s.habitsPercent).toBe(100);
  });

  it("un hábito pendiente de un día pasado sí cuenta como no cumplido", () => {
    const h = habit({ start_date: "2026-10-01" });
    const c = ctx({ today: "2026-10-12", habits: [h] });
    const s = rangeStats(c, "2026-10-10", "2026-10-10");
    expect(s.habitsTotal).toBe(1);
    expect(s.habitsDone).toBe(0);
    expect(s.habitsPercent).toBe(0);
  });

  it("hábitos de entreno y cardio se excluyen del porcentaje", () => {
    const w = habit({ kind: "workout", start_date: "2026-10-01" });
    const k = habit({ kind: "cardio", target: 30, start_date: "2026-10-01" });
    const c = ctx({ today: "2026-10-12", habits: [w, k], workouts: [workout("2026-10-10")], cardio: [cardio("2026-10-10", 40)] });
    const s = rangeStats(c, "2026-10-10", "2026-10-11");
    expect(s.habitsTotal).toBe(0);
    expect(s.habitsPercent).toBeNull();
    expect(s.workouts).toBe(1);
  });

  it("los días futuros aportan 0 de cardio", () => {
    const c = ctx({ today: "2026-10-14", cardio: [cardio("2026-10-13", 20), cardio("2026-10-16", 45)] });
    const s = rangeStats(c, "2026-10-12", "2026-10-18");
    expect(s.cardioDaily).toEqual([0, 20, 0, 0, 0, 0, 0]);
    expect(s.cardioMinutes).toBe(20);
    expect(s.cardioDays).toBe(1);
  });
});

describe("computeWeek y goalsForWeek", () => {
  it("semana en curso: faltantes empiezan por 'Te faltan'", () => {
    const c = ctx({ today: "2026-10-14" });
    const m = computeWeek(c, "2026-10-12");
    expect(m.isCurrent).toBe(true);
    expect(m.isClosed).toBe(false);
    const missing = m.objectives.map((o) => o.missing).filter((x): x is string => x != null);
    expect(missing.length).toBeGreaterThan(0);
    for (const msg of missing) expect(msg.startsWith("Te faltan")).toBe(true);
    expect(m.objectives.find((o) => o.key === "workouts")?.missing).toBe("Te faltan 3 entrenos.");
  });

  it("usa la última meta con week_start <= semana", () => {
    const c = ctx({ today: "2026-10-14", goals: [goalRow("2026-09-01", 2), goalRow("2026-10-05", 4), goalRow("2026-10-19", 5)] });
    expect(goalsForWeek(c, "2026-10-12").workoutTarget).toBe(4);
    expect(goalsForWeek(c, "2026-10-05").workoutTarget).toBe(4);
    expect(goalsForWeek(c, "2026-09-28").workoutTarget).toBe(2);
    expect(goalsForWeek(c, "2026-10-26").workoutTarget).toBe(5);
  });

  it("sin metas usa los valores por defecto según workout_days", () => {
    const c = ctx({ today: "2026-10-14" });
    expect(goalsForWeek(c, "2026-10-12")).toEqual(defaultGoals([1, 3, 5]));
    expect(goalsForWeek(c, "2026-10-12").workoutTarget).toBe(3);
  });
});

describe("evaluateHabit", () => {
  const today = "2026-10-12";

  it("cantidad por debajo del objetivo está en progreso", () => {
    const h = habit({ kind: "quantity", target: 5 });
    const c = ctx({ today, habits: [h], habitLogs: [log(h.id, today, { value: 3, completed: false })] });
    const r = evaluateHabit(h, today, c);
    expect(r.status).toBe("in_progress");
    expect(r.progress).toBeCloseTo(0.6);
  });

  it("cantidad igual o superior al objetivo está completada", () => {
    const h = habit({ kind: "quantity", target: 5 });
    for (const v of [5, 7]) {
      const c = ctx({ today, habits: [h], habitLogs: [log(h.id, today, { value: v, completed: false })] });
      expect(evaluateHabit(h, today, c).status).toBe("completed");
    }
  });

  it("un log skipped da estado skipped", () => {
    const h = habit({});
    const c = ctx({ today, habits: [h], habitLogs: [log(h.id, today, { status: "skipped", completed: false })] });
    expect(evaluateHabit(h, today, c).status).toBe("skipped");
  });

  it("pendiente programado en fecha pasada pasa a missed", () => {
    const h = habit({});
    const c = ctx({ today, habits: [h] });
    const r = evaluateHabit(h, "2026-10-10", c);
    expect(r.scheduled).toBe(true);
    expect(r.status).toBe("missed");
    expect(evaluateHabit(h, today, c).status).toBe("pending");
  });

  it("hábito no programado ese día tiene scheduled=false", () => {
    const h = habit({ weekdays: [1] }); // solo lunes
    const c = ctx({ today: "2026-10-14", habits: [h] });
    expect(evaluateHabit(h, "2026-10-14", c).scheduled).toBe(false); // miércoles
    expect(evaluateHabit(h, "2026-10-12", c).scheduled).toBe(true);
  });
});

describe("peso", () => {
  it("convierte registros en lb a kg", () => {
    const lb = { ...weight("2026-10-10", 220.462), unit: "lb" as const };
    const s = weightSeries([lb, weight("2026-10-11", 100)], "kg");
    expect(s[0].value).toBeCloseTo(100, 1);
    expect(s[1].value).toBe(100);
  });

  it("filterRange 7d conserva solo los últimos 7 días", () => {
    const entries = ["2026-10-03", "2026-10-04", "2026-10-05", "2026-10-08", "2026-10-11"].map((d) => weight(d, 80));
    const series = weightSeries(entries, "kg");
    const out = filterRange(series, "7d", "2026-10-11");
    expect(out.map((p) => p.date)).toEqual(["2026-10-05", "2026-10-08", "2026-10-11"]);
    expect(filterRange(series, "all", "2026-10-11")).toHaveLength(5);
  });
});
