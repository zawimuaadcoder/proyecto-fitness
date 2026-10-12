import { Award, CalendarRange, Info } from "lucide-react";
import { redirect } from "next/navigation";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { requireProfileId } from "@/lib/server/session";
import { loadSnapshot } from "@/services/snapshot";
import { listTournaments, loadPalmares } from "@/services/tournaments";
import { PalmaresList, TournamentLink } from "@/features/tournaments/TournamentViews";

export const metadata = { title: "Torneos" };

export default async function TournamentsPage() {
  const id = await requireProfileId();
  const [snapshot, palmares] = await Promise.all([loadSnapshot(id), loadPalmares(id)]);
  if (!snapshot) redirect("/perfiles");
  const tournaments = listTournaments(snapshot.today);
  const live = tournaments.filter((t) => t.status !== "finished");
  const past = tournaments.filter((t) => t.status === "finished");

  return (
    <Page wide>
      <PageHeader
        eyebrow="Temporadas especiales"
        title="Torneos"
        description="Épocas con nombre propio y retos especiales, en paralelo a la liga del mes. El campeón se lo lleva a su palmarés."
      />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-4">
        <div className="flex min-w-0 flex-col gap-3 lg:gap-4">
          <Card className="animate-fade-up">
            <CardHeader icon={<CalendarRange />} title="Calendario" />
            <div className="flex flex-col gap-2.5">
              {live.length ? (
                live.map((t) => <TournamentLink key={t.def.id} summary={t} />)
              ) : (
                <p className="text-[13px] text-ink-3">No hay torneos a la vista.</p>
              )}
            </div>
            {past.length > 0 && (
              <>
                <h3 className="mb-2 mt-5 text-xs font-medium text-ink-3">Terminados</h3>
                <div className="flex flex-col gap-2.5">
                  {past.map((t) => (
                    <TournamentLink key={t.def.id} summary={t} compact />
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:gap-4">
          <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <CardHeader icon={<Award />} title="Palmarés" subtitle="Títulos de liga y podios de torneos" />
            <PalmaresList entries={palmares} meId={id} />
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            <CardHeader icon={<Info />} title="Cómo funcionan" />
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[13px] text-ink-2 marker:text-ink-3">
              <li>Cada día suma los mismos puntos que en la liga, más los de los retos del torneo.</li>
              <li>Fase regular por puntos. La última semana, los 2 primeros juegan la Final: solo cuentan los puntos de esa semana.</li>
              <li>Empate en la Final: gana el mejor de la fase regular. El bronce es para el mejor del resto en el total.</li>
              <li>Algunos torneos traen hábitos propios (p. ej. Ayuno en Ramadán): aparecen solos, son opcionales y no rompen tu racha.</li>
              <li>Participa quien está en la liga. Mismas reglas antitrampas: solo puntúa lo registrado hoy o ayer.</li>
            </ul>
          </Card>
        </div>
      </div>
    </Page>
  );
}
