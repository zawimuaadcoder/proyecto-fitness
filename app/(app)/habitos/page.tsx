import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Page, PageHeader } from "@/components/layout/Page";
import { requireProfileId } from "@/lib/server/session";
import { analyzeProfile } from "@/services/analysis";
import { HabitManager } from "@/features/habits/HabitManager";
import { TodayHabitsCard } from "@/features/habits/TodayHabitsCard";

export const metadata = { title: "Hábitos" };

export default async function HabitsPage() {
  const id = await requireProfileId();
  const a = await analyzeProfile(id);
  if (!a) redirect("/perfiles");
  const pct = a.currentWeek.habits.percent;

  return (
    <Page wide>
      <PageHeader
        title="Hábitos"
        description={pct != null ? `Adherencia esta semana: ${Math.round(pct)}%` : "Configura tus hábitos diarios."}
      />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <TodayHabitsCard habits={a.today.habits} />
        <Suspense>
          <HabitManager
            // Los hábitos de un torneo terminado dejan de mostrarse (su historial se conserva).
            habits={a.snapshot.habits.filter((h) => !h.end_date || h.end_date >= a.snapshot.today)}
            workoutDays={a.snapshot.settings.workout_days} />
        </Suspense>
      </div>
    </Page>
  );
}
