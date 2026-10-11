import { redirect } from "next/navigation";
import { Page, PageHeader } from "@/components/layout/Page";
import { LinkTabs } from "@/components/ui/LinkTabs";
import { requireProfileId } from "@/lib/server/session";
import { analyzeProfile } from "@/services/analysis";
import { CardioCard } from "@/features/cardio/CardioCard";
import { QuickAddButton } from "@/features/quick-add/QuickAddButton";
import { GoalsCard } from "@/features/settings/GoalsCard";
import { SessionList } from "@/features/workouts/SessionList";

export const metadata = { title: "Cardio" };

const TABS = [
  { key: "entreno", label: "Entreno", href: "/entrenamiento" },
  { key: "cardio", label: "Cardio", href: "/cardio" },
];

export default async function CardioPage() {
  const id = await requireProfileId();
  const a = await analyzeProfile(id);
  if (!a) redirect("/perfiles");
  const s = a.snapshot;

  return (
    <Page wide>
      <PageHeader title="Cardio" description="Días y minutos de la semana." action={<QuickAddButton kind="cardio" label="Añadir" />} />
      <div className="mb-4 md:hidden">
        <LinkTabs tabs={TABS} active="cardio" label="Actividad" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="flex flex-col gap-4">
          <CardioCard week={a.currentWeek} today={s.today} />
          <SessionList kind="cardio" cardio={s.cardio} today={s.today} />
        </div>
        <GoalsCard goals={a.currentWeek.goals} compact="cardio" />
      </div>
    </Page>
  );
}
