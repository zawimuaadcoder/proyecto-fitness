import { CalendarDays, ChevronLeft, ChevronRight, GitCompareArrows, Target } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { MetricChip } from "@/components/ui/Pills";
import { ProgressRow } from "@/components/ui/Progress";
import { addDays, formatWeekRange, isISODate, isoWeekNumber, startOfWeek, weekDays } from "@/lib/dates";
import { formatPercent, formatWeight } from "@/lib/format";
import { comparePeriods } from "@/lib/domain/compare";
import { evaluateDay } from "@/lib/domain/habits";
import { computeWeek } from "@/lib/domain/week";
import { requireProfileId } from "@/lib/server/session";
import { analyzeProfile } from "@/services/analysis";
import { DayBreakdown } from "@/features/weekly/DayBreakdown";
import type { WeekMetrics } from "@/types/domain";

export const metadata = { title: "Semana" };

const asCompare = (w: WeekMetrics) => ({
  workouts: w.workouts.count,
  cardioMinutes: w.cardio.minutes,
  habitsPercent: w.habits.percent,
  avgWeight: w.avgWeight,
  adherence: w.adherence,
});

export default async function WeekPage({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  if (!isISODate(week)) notFound();
  const id = await requireProfileId();
  const a = await analyzeProfile(id);
  if (!a) redirect("/perfiles");
  const start = startOfWeek(week);
  if (start > startOfWeek(a.ctx.today)) notFound();

  const w = computeWeek(a.ctx, start, a.timeline);
  const prev = computeWeek(a.ctx, addDays(start, -7), a.timeline);
  const s = a.snapshot;
  const unit = s.settings.weight_unit;
  const days = weekDays(start).map((d) => evaluateDay(d, a.ctx));
  const next = addDays(start, 7);
  const met = w.objectives.filter((o) => o.met).length;
  const inWeek = (x: { date: string }) => x.date >= start && x.date <= addDays(start, 6);

  return (
    <Page>
      <Link href="/progreso?tab=semanas" className="mb-3 inline-flex h-8 items-center gap-1 text-[13px] text-ink-3 hover:text-ink">
        <ChevronLeft className="size-4" /> Semanas
      </Link>
      <PageHeader
        eyebrow={formatWeekRange(start)}
        title={`Semana ${isoWeekNumber(start)}`}
        action={
          <div className="flex gap-1">
            <Link aria-label="Semana anterior" href={`/progreso/semanas/${addDays(start, -7)}`} className="flex size-9 items-center justify-center rounded-lg border border-line text-ink-2 hover:bg-hover">
              <ChevronLeft className="size-4" />
            </Link>
            {next <= startOfWeek(a.ctx.today) && (
              <Link aria-label="Semana siguiente" href={`/progreso/semanas/${next}`} className="flex size-9 items-center justify-center rounded-lg border border-line text-ink-2 hover:bg-hover">
                <ChevronRight className="size-4" />
              </Link>
            )}
          </div>
        }
      />

      <div className="grid gap-3 md:gap-4">
        <Card>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="tabular text-[44px] font-semibold leading-none tracking-tight">{w.adherence}%</p>
              <p className="mt-1 text-xs text-ink-3">{w.isClosed ? "Cumplimiento final" : `Cumplimiento (día ${w.elapsedDays} de 7)`}</p>
            </div>
            <p className="rounded-lg bg-field px-2.5 py-1 text-[13px] font-medium text-ink-2">
              {met === w.objectives.length && w.objectives.length > 0 ? "✅ Semana completada" : `${met} / ${w.objectives.length} objetivos`}
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ProgressRow label="Entrenos" value={w.workouts.count} max={w.workouts.target} />
            {w.cardio.mode !== "days" && <ProgressRow label="Cardio" value={w.cardio.minutes} max={w.cardio.minutesTarget} unit="min" />}
            {w.cardio.mode !== "minutes" && <ProgressRow label="Días de cardio" value={w.cardio.days} max={w.cardio.daysTarget} />}
            <ProgressRow label="Hábitos (%)" value={Math.round(w.habits.percent ?? 0)} max={100} />
          </div>
          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <div>
              <dt className="text-ink-3">Peso medio</dt>
              <dd className="tabular mt-0.5 text-sm font-medium">{formatWeight(w.avgWeight, unit)}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Días completos</dt>
              <dd className="tabular mt-0.5 text-sm font-medium">{w.completedDays} / 7</dd>
            </div>
            <div>
              <dt className="text-ink-3">Racha al cierre</dt>
              <dd className="tabular mt-0.5 text-sm font-medium">🔥 {w.streakAtEnd}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Hábitos</dt>
              <dd className="tabular mt-0.5 text-sm font-medium">
                {w.habits.done}/{w.habits.total} · {formatPercent(w.habits.percent)}
              </dd>
            </div>
          </dl>
          {w.objectives.some((o) => o.missing) && (
            <ul className="mt-4 flex flex-col gap-1 border-t border-line pt-3">
              {w.objectives
                .filter((o) => o.missing)
                .map((o) => (
                  <li key={o.key} className="flex items-center gap-2 text-[13px] text-ink-2">
                    <Target className="size-3.5 text-ink-3" /> {o.missing}
                  </li>
                ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader icon={<GitCompareArrows />} title="Vs. semana anterior" />
          <div className="flex flex-wrap gap-1.5">
            {comparePeriods(asCompare(w), asCompare(prev), unit, s.settings.goal).map((c) => (
              <MetricChip key={c.key} label={c.label} value={c.value} tone={c.tone} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader icon={<CalendarDays />} title="Día a día" subtitle="Puedes completar hábitos olvidados de días pasados." />
          <DayBreakdown days={days} workouts={s.workouts.filter(inWeek)} cardio={s.cardio.filter(inWeek)} today={a.ctx.today} />
        </Card>
      </div>
    </Page>
  );
}
