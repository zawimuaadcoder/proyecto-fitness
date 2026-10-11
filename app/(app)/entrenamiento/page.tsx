import { redirect } from "next/navigation";
import { Page, PageHeader } from "@/components/layout/Page";
import { LinkTabs } from "@/components/ui/LinkTabs";
import { addDays, startOfWeek } from "@/lib/dates";
import { requireProfileId } from "@/lib/server/session";
import { analyzeProfile } from "@/services/analysis";
import { QuickAddButton } from "@/features/quick-add/QuickAddButton";
import { GoalsCard } from "@/features/settings/GoalsCard";
import { TrainingDaysCard } from "@/features/settings/TrainingDaysCard";
import { SessionList } from "@/features/workouts/SessionList";
import { WorkoutCard } from "@/features/workouts/WorkoutCard";

export const metadata = { title: "Entrenamiento" };

const ACTIVITY_TABS = [
  { key: "entreno", label: "Entreno", href: "/entrenamiento" },
  { key: "cardio", label: "Cardio", href: "/cardio" },
];

export default async function WorkoutPage() {
  const id = await requireProfileId();
  const a = await analyzeProfile(id);
  if (!a) redirect("/perfiles");
  const s = a.snapshot;
  const weekStart = startOfWeek(s.today);

  return (
    <Page wide>
      <PageHeader title="Entrenamiento" description="Sesiones, descansos planificados y objetivo semanal." action={<QuickAddButton kind="workout" label="Registrar" />} />
      <div className="mb-4 md:hidden">
        <LinkTabs tabs={ACTIVITY_TABS} active="entreno" label="Actividad" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="flex flex-col gap-4">
          <WorkoutCard
            todayEntries={s.workouts.filter((w) => w.date === s.today)}
            weekEntries={s.workouts.filter((w) => w.date >= weekStart && w.date <= addDays(weekStart, 6))}
            weekStart={weekStart}
            target={a.currentWeek.workouts.target}
            plannedDays={s.settings.workout_days}
            today={s.today}
          />
          <SessionList kind="workout" workouts={s.workouts} today={s.today} />
        </div>
        <div className="flex flex-col gap-4">
          <GoalsCard goals={a.currentWeek.goals} compact="workout" />
          <TrainingDaysCard days={s.settings.workout_days} />
        </div>
      </div>
    </Page>
  );
}
