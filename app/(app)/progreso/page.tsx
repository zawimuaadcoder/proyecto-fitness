import { CalendarRange, GitCompareArrows } from "lucide-react";
import { redirect } from "next/navigation";
import { MiniBars } from "@/components/charts/MiniCharts";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { LinkTabs } from "@/components/ui/LinkTabs";
import { MetricChip } from "@/components/ui/Pills";
import { addDays, isoWeekNumber } from "@/lib/dates";
import { comparePeriods } from "@/lib/domain/compare";
import { rangeStats } from "@/lib/domain/stats";
import { requireProfileId } from "@/lib/server/session";
import { recentDays } from "@/lib/domain/streak";
import { allWeeks, analyzeProfile } from "@/services/analysis";
import { buildHabitDays, buildWeightHistory } from "@/services/history";
import { HistoryTables } from "@/features/history/HistoryTables";
import { StreakHeatmap } from "@/features/streak/StreakHeatmap";
import { WeekList } from "@/features/weekly/WeekList";
import { WeightChartCard } from "@/features/weight/WeightChartCard";
import type { WeekMetrics } from "@/types/domain";

export const metadata = { title: "Progreso" };

const TABS = [
  { key: "resumen", label: "Resumen", href: "/progreso" },
  { key: "peso", label: "Peso", href: "/progreso?tab=peso" },
  { key: "semanas", label: "Semanas", href: "/progreso?tab=semanas" },
  { key: "historial", label: "Historial", href: "/progreso?tab=historial" },
];

const asCompare = (w: WeekMetrics) => ({
  workouts: w.workouts.count,
  cardioMinutes: w.cardio.minutes,
  habitsPercent: w.habits.percent,
  avgWeight: w.avgWeight,
  adherence: w.adherence,
});

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ tab?: string; ver?: string }> }) {
  const id = await requireProfileId();
  const [a, params] = await Promise.all([analyzeProfile(id), searchParams]);
  if (!a) redirect("/perfiles");
  const tab = TABS.some((t) => t.key === params.tab) ? params.tab! : "resumen";
  const s = a.snapshot;
  const unit = s.settings.weight_unit;

  return (
    <Page wide>
      <PageHeader title="Progreso" description="Tendencias, semanas cerradas y todos tus registros." />
      <div className="mb-4">
        <LinkTabs tabs={TABS} active={tab} label="Secciones de progreso" />
      </div>

      {tab === "resumen" && <Summary a={a} />}

      {tab === "peso" && (
        <div className="grid gap-4">
          <WeightChartCard series={a.series} unit={unit} today={s.today} goal={s.settings.goal} targetWeight={s.settings.target_weight} />
          <HistoryTables
            only="peso"
            weights={buildWeightHistory(a)}
            cardio={[]}
            workouts={[]}
            habitDays={[]}
            notes={[]}
            unit={unit}
          />
        </div>
      )}

      {tab === "semanas" && (
        <Card>
          <CardHeader icon={<CalendarRange />} title="Semanas" subtitle="Lunes → domingo. Pulsa una semana para ver el detalle." />
          <WeekList weeks={allWeeks(a)} unit={unit} />
        </Card>
      )}

      {tab === "historial" && (
        <HistoryTables
          initialTab={(["peso", "cardio", "entreno", "habitos", "notas"].includes(params.ver ?? "") ? params.ver : "peso") as "peso"}
          weights={buildWeightHistory(a)}
          cardio={[...s.cardio].reverse()}
          workouts={[...s.workouts].reverse()}
          habitDays={buildHabitDays(a)}
          notes={s.notes}
          unit={unit}
        />
      )}
    </Page>
  );
}

function Summary({ a }: { a: NonNullable<Awaited<ReturnType<typeof analyzeProfile>>> }) {
  const s = a.snapshot;
  const unit = s.settings.weight_unit;
  const weeks = allWeeks(a, 8).reverse();
  const month = rangeStats(a.ctx, addDays(s.today, -29), s.today);
  const prevMonth = rangeStats(a.ctx, addDays(s.today, -59), addDays(s.today, -30));
  const weekCmp = comparePeriods(asCompare(a.lastWeek), asCompare(a.weekBefore), unit, s.settings.goal);
  const monthCmp = comparePeriods(
    { workouts: month.workouts, cardioMinutes: month.cardioMinutes, habitsPercent: month.habitsPercent, avgWeight: month.avgWeight },
    { workouts: prevMonth.workouts, cardioMinutes: prevMonth.cardioMinutes, habitsPercent: prevMonth.habitsPercent, avgWeight: prevMonth.avgWeight },
    unit,
    s.settings.goal,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader icon={<CalendarRange />} title="Cumplimiento por semana" subtitle="Últimas 8 semanas" />
        <MiniBars
          values={weeks.map((w) => w.adherence)}
          labels={weeks.map((w) => `S${isoWeekNumber(w.weekStart)}`)}
          unit="%"
          height={96}
          highlight={weeks.length - 1}
          target={90}
          ariaLabel="Cumplimiento semanal de las últimas 8 semanas"
        />
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader icon={<CalendarRange />} title="Constancia · últimas 16 semanas" />
        <StreakHeatmap days={recentDays(a.timeline, s.today, 112)} />
      </Card>
      <Card>
        <CardHeader icon={<GitCompareArrows />} title="Semana pasada vs anterior" />
        <div className="flex flex-wrap gap-1.5">
          {weekCmp.map((c) => (
            <MetricChip key={c.key} label={c.label} value={c.value} tone={c.tone} />
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader icon={<GitCompareArrows />} title="Últimos 30 días vs 30 anteriores" />
        <div className="flex flex-wrap gap-1.5">
          {monthCmp.map((c) => (
            <MetricChip key={c.key} label={c.label} value={c.value} tone={c.tone} />
          ))}
        </div>
      </Card>
      <div className="lg:col-span-2">
        <WeightChartCard series={a.series} unit={unit} today={s.today} goal={s.settings.goal} targetWeight={s.settings.target_weight} />
      </div>
    </div>
  );
}
