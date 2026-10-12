import { Page } from "@/components/layout/Page";
import { addDays, formatLongDate, hourInTimeZone, isoWeekday, startOfWeek } from "@/lib/dates";
import { comparePeriods } from "@/lib/domain/compare";
import { requireProfileId } from "@/lib/server/session";
import { analyzeProfile } from "@/services/analysis";
import { isActiveToday } from "@/services/app-profile";
import { loadLeague } from "@/services/league";
import { CardioCard } from "@/features/cardio/CardioCard";
import { TodayHabitsCard } from "@/features/habits/TodayHabitsCard";
import { InsightCarousel } from "@/features/insights/InsightCarousel";
import type { CelebrationData } from "@/features/streak/Celebration";
import { StreakBadge } from "@/features/streak/StreakBadge";
import { StreakCard } from "@/features/streak/StreakCard";
import { WeekRecapCard } from "@/features/weekly/WeekRecapCard";
import { WeeklyComplianceCard } from "@/features/weekly/WeeklyComplianceCard";
import { WeightCard } from "@/features/weight/WeightCard";
import { WorkoutCard } from "@/features/workouts/WorkoutCard";
import type { WeekMetrics } from "@/types/domain";
import { redirect } from "next/navigation";

export const metadata = { title: "Hoy" };

function greeting(hour: number) {
  if (hour < 6) return "Buenas noches";
  if (hour < 13) return "Buenos días";
  if (hour < 21) return "Buenas tardes";
  return "Buenas noches";
}

function toCompare(w: WeekMetrics) {
  return {
    workouts: w.workouts.count,
    cardioMinutes: w.cardio.minutes,
    habitsPercent: w.habits.percent,
    avgWeight: w.avgWeight,
    adherence: w.adherence,
  };
}

export default async function TodayPage() {
  const id = await requireProfileId();
  const a = await analyzeProfile(id);
  if (!a) redirect("/perfiles");
  const { snapshot: s, streak, today, currentWeek, lastWeek, weekBefore } = a;
  const unit = s.settings.weight_unit;
  const isMonday = isoWeekday(s.today) === 1;
  const weekStart = startOfWeek(s.today);

  // Celebraciones: solo una vez por evento (streak_events.seen_at)
  const seen = (kind: string, value: number, date = s.today) =>
    s.streakEvents.some((e) => e.kind === kind && e.date === date && e.value === value && e.seen_at);
  let celebration: CelebrationData | null = null;
  if (streak.today === "completed") {
    if (streak.milestone && !seen("milestone", streak.milestone)) celebration = { kind: "milestone", value: streak.milestone, date: s.today };
    else if (streak.isRecord && !seen("record", streak.current)) celebration = { kind: "record", value: streak.current, date: s.today };
    else if (!seen("perfect_day", 0)) celebration = { kind: "perfect_day", value: 0, date: s.today };
  }
  if (!celebration && isMonday && lastWeek.adherence === 100 && !seen("perfect_week", 0)) {
    celebration = { kind: "perfect_week", value: 0, date: s.today };
  }

  // Los lunes, la tarjeta de cierre muestra la jornada de la liga.
  const league = isMonday ? await loadLeague(id) : null;

  const hasHistory = lastWeek.dayStatuses.some((d) => d.status !== "none") || lastWeek.workouts.count > 0 || lastWeek.cardio.minutes > 0;
  const recap = hasHistory ? (
    <WeekRecapCard
      week={lastWeek}
      comparisons={comparePeriods(toCompare(lastWeek), toCompare(weekBefore), unit, s.settings.goal)}
      unit={unit}
      defaultExpanded={isMonday}
      matchday={league?.matchday}
    />
  ) : null;

  const weightTrend = a.series.filter((p) => p.date >= addDays(s.today, -30)).map((p) => p.avg7);
  const weekWorkouts = s.workouts.filter((w) => w.date >= weekStart && w.date <= addDays(weekStart, 6));

  return (
    <Page wide>
      <header className="animate-fade-up mb-5 flex items-start justify-between gap-3 md:mb-6">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-3 first-letter:uppercase">{formatLongDate(s.today)}</p>
          <h1 className="mt-0.5 text-[22px] font-semibold tracking-tight md:text-2xl">
            {greeting(hourInTimeZone(s.settings.timezone))}, {s.profile.name}
          </h1>
        </div>
        <StreakBadge streak={streak.current} activeToday={isActiveToday(s)} profileId={id} today={s.today} />
      </header>

      {/* Móvil: una columna en el orden del producto. Desktop: 2 columnas. */}
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-4">
        <div className="contents lg:flex lg:flex-col lg:gap-4">
          {isMonday && recap && <div className="order-1 animate-fade-up lg:order-none" style={{ animationDelay: "35ms" }}>{recap}</div>}
          <div className="order-2 animate-fade-up lg:order-none" style={{ animationDelay: "70ms" }}>
            <StreakCard streak={streak} today={today.date} celebration={celebration} />
          </div>
          <div className="order-3 animate-fade-up lg:order-none" style={{ animationDelay: "105ms" }}>
            <TodayHabitsCard habits={today.habits} />
          </div>
          <div className="order-4 animate-fade-up lg:order-none" style={{ animationDelay: "140ms" }}>
            <WeightCard overview={a.weight} trend={weightTrend} unit={unit} goal={s.settings.goal} today={s.today} />
          </div>
          <div className="order-6 animate-fade-up lg:order-none" style={{ animationDelay: "210ms" }}>
            <CardioCard week={currentWeek} today={s.today} />
          </div>
        </div>
        <div className="contents lg:flex lg:flex-col lg:gap-4">
          <div className="order-7 animate-fade-up lg:order-none" style={{ animationDelay: "245ms" }}>
            <WeeklyComplianceCard week={currentWeek} />
          </div>
          {!isMonday && recap && <div className="order-8 animate-fade-up lg:order-none" style={{ animationDelay: "280ms" }}>{recap}</div>}
          <div className="order-5 animate-fade-up lg:order-none" style={{ animationDelay: "175ms" }}>
            <WorkoutCard
              todayEntries={s.workouts.filter((w) => w.date === s.today)}
              weekEntries={weekWorkouts}
              weekStart={weekStart}
              target={currentWeek.workouts.target}
              plannedDays={s.settings.workout_days}
              today={s.today}
            />
          </div>
          <div className="order-9 animate-fade-up lg:order-none" style={{ animationDelay: "315ms" }}>
            <InsightCarousel insights={a.insights} />
          </div>
        </div>
      </div>
    </Page>
  );
}
