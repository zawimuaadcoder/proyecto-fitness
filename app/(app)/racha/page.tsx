import { CalendarDays, Flag, Info, Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { STREAK_MILESTONES } from "@/lib/constants";
import { formatShortDate } from "@/lib/dates";
import { recentDays } from "@/lib/domain/streak";
import { requireProfileId } from "@/lib/server/session";
import { analyzeProfile } from "@/services/analysis";
import { StreakCard } from "@/features/streak/StreakCard";
import { StreakHeatmap } from "@/features/streak/StreakHeatmap";

export const metadata = { title: "Racha" };

export default async function StreakPage() {
  const id = await requireProfileId();
  const a = await analyzeProfile(id);
  if (!a) redirect("/perfiles");
  const { streak, timeline } = a;

  // Rachas pasadas (tramos entre fallos)
  type Run = { start: string; end: string; length: number };
  const runs: Run[] = [];
  let open: Run | undefined;
  for (const d of timeline) {
    if (d.status === "completed") {
      if (open) {
        open.end = d.date;
        open.length = d.run;
      } else {
        open = { start: d.date, end: d.date, length: d.run };
        runs.push(open);
      }
    } else if (d.status === "failed") {
      open = undefined;
    }
  }
  const best = [...runs].sort((x, y) => y.length - x.length).slice(0, 5);

  return (
    <Page>
      <PageHeader title="Racha" description="Motivación inmediata: un día cuenta cuando cumples todos tus obligatorios." />
      <div className="grid gap-3 md:gap-4">
        <StreakCard streak={streak} today={a.ctx.today} />

        <Card>
          <CardHeader icon={<CalendarDays />} title="Últimas 16 semanas" />
          <StreakHeatmap days={recentDays(timeline, a.ctx.today, 112)} />
        </Card>

        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <Card>
            <CardHeader icon={<Flag />} title="Hitos" />
            <ul className="flex flex-col gap-1.5">
              {STREAK_MILESTONES.slice(0, 6).map((m) => {
                const reached = streak.longest >= m;
                return (
                  <li key={m} className="flex items-center gap-3 text-[13px]">
                    <span className={cn("tabular flex h-6 w-11 items-center justify-center rounded-md text-xs font-semibold", reached ? "bg-orange-tint text-orange" : "bg-field text-ink-3")}>
                      {m}
                    </span>
                    <span className={reached ? "text-ink" : "text-ink-3"}>{m} días seguidos</span>
                    <span className="ml-auto text-xs text-ink-3">{reached ? "Conseguido" : streak.nextMilestone === m ? `Faltan ${m - streak.current}` : ""}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <CardHeader icon={<Trophy />} title="Mejores rachas" />
            {best.length ? (
              <ol className="flex flex-col gap-1.5">
                {best.map((r, i) => (
                  <li key={r.start} className="flex items-center gap-3 text-[13px]">
                    <span className="tabular w-4 text-ink-3">{i + 1}</span>
                    <span className="tabular font-semibold">🔥 {r.length}</span>
                    <span className="ml-auto text-xs text-ink-3">
                      {formatShortDate(r.start)} – {formatShortDate(r.end)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[13px] text-ink-3">Completa tu primer día para empezar.</p>
            )}
          </Card>
        </div>

        <Card>
          <CardHeader icon={<Info />} title="Cómo se calcula" />
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[13px] text-ink-2 marker:text-ink-3">
            <li>Un día se completa cuando cumples todos los hábitos obligatorios programados para ese día.</li>
            <li>Los hábitos no programados ese día y los opcionales no cuentan.</li>
            <li>Los días sin obligatorios y los descansos planificados no rompen la racha (tampoco suman).</li>
            <li>Si termina el día con un obligatorio sin cumplir, la racha vuelve a 0.</li>
            <li>El «día» usa tu zona horaria ({a.snapshot.settings.timezone}). La racha se recalcula siempre desde tu historial.</li>
          </ul>
        </Card>
      </div>
    </Page>
  );
}
