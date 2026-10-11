import { addDays, diffDays, isoWeekday, startOfWeek, weekdayLetter, type ISODate } from "@/lib/dates";
import { formatNumber, formatWeight, round } from "@/lib/format";
import type { Insight, StreakSummary } from "@/types/domain";
import type { DomainContext } from "./context";
import { rangeStats } from "./stats";
import { goalsForWeek } from "./week";
import { weightChangeTone, weightOverview, weightSeries } from "./weight";

/**
 * Periodo de comparación justo: si hoy es lunes usamos la semana cerrada
 * anterior; si no, la semana actual hasta hoy contra los mismos días de la
 * semana pasada (nunca una semana parcial contra una completa).
 */
export function comparisonPeriods(today: ISODate) {
  const monday = isoWeekday(today) === 1;
  if (monday) {
    const from = addDays(startOfWeek(today), -7);
    return {
      label: "la semana pasada",
      prevLabel: "la anterior",
      current: { from, to: addDays(from, 6) },
      previous: { from: addDays(from, -7), to: addDays(from, -1) },
      partial: false,
    };
  }
  const from = startOfWeek(today);
  const span = diffDays(today, from);
  return {
    label: "esta semana",
    prevLabel: "la semana pasada",
    current: { from, to: today },
    previous: { from: addDays(from, -7), to: addDays(from, -7 + span) },
    partial: true,
  };
}

export function buildInsights(ctx: DomainContext, streak: StreakSummary): Insight[] {
  const periods = comparisonPeriods(ctx.today);
  const cur = rangeStats(ctx, periods.current.from, addDays(periods.current.from, 6));
  const curPartial = rangeStats(ctx, periods.current.from, periods.current.to);
  const prev = rangeStats(ctx, periods.previous.from, periods.previous.to);
  const goals = goalsForWeek(ctx, periods.current.from);
  const insights: Insight[] = [];
  const unit = ctx.settings.weight_unit;

  // Peso (tendencia por medias semanales, no por días sueltos)
  const overview = weightOverview(weightSeries(ctx.weights, unit), ctx.today);
  if (overview.weekAvg != null && overview.prevWeekAvg != null) {
    const change = round(overview.weekAvg - overview.prevWeekAvg, 1);
    const abs = formatWeight(Math.abs(change), unit);
    insights.push({
      id: "weight",
      kind: "weight",
      title: "Peso",
      message:
        change === 0
          ? "Tu promedio semanal se mantiene estable."
          : `Tu promedio semanal ${change < 0 ? "bajó" : "subió"} ${abs}.`,
      tone: weightChangeTone(change, ctx.settings.goal),
      chart: {
        type: "compare",
        labels: ["7 días previos", "Últimos 7 días"],
        values: [round(overview.prevWeekAvg, 1), round(overview.weekAvg, 1)],
        unit,
      },
      action: { label: "Ver tendencia", href: "/progreso?tab=peso" },
    });
  } else {
    insights.push({
      id: "weight",
      kind: "weight",
      title: "Peso",
      message: "Registra tu peso 2–3 veces por semana para ver la tendencia real.",
      tone: "neutral",
      chart: { type: "progress", value: overview.count, max: 7, unit: "registros" },
      action: { label: "Registrar peso", quickAdd: "weight" },
    });
  }

  // Cardio
  const cardioDiff = curPartial.cardioMinutes - prev.cardioMinutes;
  const cardioMsg =
    cardioDiff === 0
      ? `Mismos minutos de cardio que ${periods.prevLabel}.`
      : periods.partial
        ? `Llevas ${Math.abs(cardioDiff)} min ${cardioDiff > 0 ? "más" : "menos"} de cardio que a estas alturas de ${periods.prevLabel}.`
        : `Hiciste ${Math.abs(cardioDiff)} minutos ${cardioDiff > 0 ? "más" : "menos"} de cardio que ${periods.prevLabel}.`;
  insights.push({
    id: "cardio",
    kind: "cardio",
    title: "Cardio",
    message: cardioMsg,
    tone: cardioDiff > 0 ? "positive" : cardioDiff < 0 ? "negative" : "neutral",
    chart: {
      type: "bars",
      labels: [1, 2, 3, 4, 5, 6, 7].map(weekdayLetter),
      values: cur.cardioDaily,
      unit: "min",
      highlight: periods.partial ? diffDays(ctx.today, periods.current.from) : undefined,
    },
    action: { label: "Añadir cardio", quickAdd: "cardio" },
  });

  // Entrenos
  if (goals.workoutTarget > 0) {
    const done = curPartial.workouts;
    const left = goals.workoutTarget - done;
    insights.push({
      id: "workouts",
      kind: "workouts",
      title: "Entrenamiento",
      message: periods.partial
        ? left > 0
          ? `Llevas ${done} de ${goals.workoutTarget} sesiones. Te ${left === 1 ? "queda 1" : `quedan ${left}`}.`
          : `Objetivo de ${goals.workoutTarget} sesiones cumplido esta semana.`
        : `Completaste ${done} de ${goals.workoutTarget} sesiones.`,
      tone: left <= 0 ? "positive" : "neutral",
      chart: { type: "progress", value: done, max: goals.workoutTarget, unit: "sesiones" },
      action: { label: "Registrar entreno", quickAdd: "workout" },
    });
  }

  // Hábitos
  if (curPartial.habitsPercent != null) {
    const now = Math.round(curPartial.habitsPercent);
    const before = prev.habitsPercent != null ? Math.round(prev.habitsPercent) : null;
    insights.push({
      id: "habits",
      kind: "habits",
      title: "Hábitos",
      message:
        before == null
          ? `Tu adherencia a hábitos es del ${now}%.`
          : now === before
            ? `Tu adherencia se mantiene en el ${now}%.`
            : `Tu adherencia ${now > before ? "subió" : "bajó"} del ${before}% al ${now}%.`,
      tone: before == null || now === before ? "neutral" : now > before ? "positive" : "negative",
      chart: {
        type: "compare",
        labels: [periods.partial ? "Sem. pasada" : "Anterior", periods.partial ? "Esta semana" : "Sem. pasada"],
        values: [before ?? 0, now],
        unit: "%",
      },
      action: { label: "Ver hábitos", href: "/habitos" },
    });
  }

  // Racha
  if (streak.current > 0 && streak.nextMilestone) {
    const left = streak.nextMilestone - streak.current;
    insights.push({
      id: "streak",
      kind: "streak",
      title: "Racha",
      message: `${formatNumber(streak.current)} días seguidos. Te ${left === 1 ? "falta 1 día" : `faltan ${left} días`} para ${streak.nextMilestone}.`,
      tone: "positive",
      chart: { type: "progress", value: streak.current, max: streak.nextMilestone, unit: "días" },
      action: { label: "Ver racha", href: "/racha" },
    });
  }

  return insights;
}
