import { CalendarRange, Info, Scale } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { requireProfileId } from "@/lib/server/session";
import { allWeeks, analyzeProfile } from "@/services/analysis";
import { comparePeriods } from "@/lib/domain/compare";
import { DayDot } from "@/features/streak/StreakCard";
import { GoalsCard } from "@/features/settings/GoalsCard";
import { WeekList } from "@/features/weekly/WeekList";
import { WeekRecapCard } from "@/features/weekly/WeekRecapCard";
import { WeeklyComplianceCard } from "@/features/weekly/WeeklyComplianceCard";
import { AdherenceWeightsCard } from "@/features/settings/AdherenceWeightsCard";
import type { WeekMetrics } from "@/types/domain";

export const metadata = { title: "Cumplimiento semanal" };

const asCompare = (w: WeekMetrics) => ({
  workouts: w.workouts.count,
  cardioMinutes: w.cardio.minutes,
  habitsPercent: w.habits.percent,
  avgWeight: w.avgWeight,
  adherence: w.adherence,
});

export default async function CompliancePage() {
  const id = await requireProfileId();
  const a = await analyzeProfile(id);
  if (!a) redirect("/perfiles");
  const s = a.snapshot;
  const w = a.currentWeek;

  return (
    <Page wide>
      <PageHeader title="Cumplimiento semanal" description="Perspectiva: ¿qué tan constante estás siendo esta semana?" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex flex-col gap-4">
          <WeeklyComplianceCard week={w} />
          <Card>
            <CardHeader title="Esta semana, día a día" />
            <div className="flex gap-1">
              {w.dayStatuses.map((d) => (
                <DayDot key={d.date} status={d.status} date={d.date} isToday={d.date === a.ctx.today} />
              ))}
            </div>
            {w.objectives.some((o) => o.missing) && (
              <ul className="mt-4 flex flex-col gap-1 border-t border-line pt-3 text-[13px] text-ink-2">
                {w.objectives
                  .filter((o) => o.missing)
                  .map((o) => (
                    <li key={o.key}>{o.missing}</li>
                  ))}
              </ul>
            )}
          </Card>
          <WeekRecapCard
            week={a.lastWeek}
            comparisons={comparePeriods(asCompare(a.lastWeek), asCompare(a.weekBefore), s.settings.weight_unit, s.settings.goal)}
            unit={s.settings.weight_unit}
            defaultExpanded
          />
          <Card>
            <CardHeader icon={<CalendarRange />} title="Historial de semanas" action={<Link href="/progreso?tab=semanas" className="text-xs text-ink-3 hover:text-ink">Ver todo</Link>} />
            <WeekList weeks={allWeeks(a, 12)} unit={s.settings.weight_unit} />
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <GoalsCard goals={w.goals} />
          <AdherenceWeightsCard
            weights={{ habits: s.settings.weight_habits, workouts: s.settings.weight_workouts, cardio: s.settings.weight_cardio }}
            habitsGoal={s.settings.habits_goal_percent}
          />
          <Card>
            <CardHeader icon={<Info />} title="Fórmula" />
            <p className="text-[13px] text-ink-2">
              Media ponderada de hábitos obligatorios cumplidos, entrenos / objetivo y cardio (días y/o minutos) / objetivo. Cada parte se limita al
              100%, así que el total nunca lo supera.
            </p>
            <p className="mt-2 flex items-start gap-2 text-[13px] text-ink-3">
              <Scale className="mt-0.5 size-3.5 shrink-0" /> El peso no forma parte: es un resultado, no una acción que controles.
            </p>
          </Card>
        </div>
      </div>
    </Page>
  );
}
