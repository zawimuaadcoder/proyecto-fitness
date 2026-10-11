import { redirect } from "next/navigation";
import { Page, PageHeader } from "@/components/layout/Page";
import { SectionTitle } from "@/components/ui/Card";
import { requireProfileId } from "@/lib/server/session";
import { analyzeProfile } from "@/services/analysis";
import { CustomTypesCard, DangerCard, PasswordCard, ProfileSettingsCard, SessionCard } from "@/features/settings/AccountCards";
import { AdherenceWeightsCard } from "@/features/settings/AdherenceWeightsCard";
import { GoalsCard } from "@/features/settings/GoalsCard";
import { PreferencesCard, ThemeCard } from "@/features/settings/PreferencesCard";
import { TrainingDaysCard } from "@/features/settings/TrainingDaysCard";

export const metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const id = await requireProfileId();
  const a = await analyzeProfile(id);
  if (!a) redirect("/perfiles");
  const st = a.snapshot.settings;

  return (
    <Page>
      <PageHeader title="Ajustes" />
      <div className="grid gap-3 md:grid-cols-2 md:items-start md:gap-4">
        <div className="flex flex-col gap-3 md:gap-4">
          <SectionTitle>Objetivos</SectionTitle>
          <GoalsCard goals={a.currentWeek.goals} />
          <TrainingDaysCard days={st.workout_days} />
          <AdherenceWeightsCard weights={{ habits: st.weight_habits, workouts: st.weight_workouts, cardio: st.weight_cardio }} habitsGoal={st.habits_goal_percent} />
          <SectionTitle>Preferencias</SectionTitle>
          <PreferencesCard unit={st.weight_unit} timezone={st.timezone} goal={st.goal} targetWeight={st.target_weight} />
          <ThemeCard />
          <CustomTypesCard />
        </div>
        <div className="flex flex-col gap-3 md:gap-4">
          <SectionTitle>Cuenta</SectionTitle>
          <ProfileSettingsCard />
          <PasswordCard />
          <SessionCard />
          <DangerCard />
        </div>
      </div>
    </Page>
  );
}
