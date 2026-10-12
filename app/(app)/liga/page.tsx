import { CalendarRange, Crown, Info, ListOrdered, Trophy } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Page, PageHeader } from "@/components/layout/Page";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { currentTimeInTimeZone, diffDays, formatMonthYear, formatWeekRange } from "@/lib/dates";
import { POINTS } from "@/lib/domain/points";
import { requireProfileId } from "@/lib/server/session";
import { loadLeague } from "@/services/league";
import { loadSnapshot } from "@/services/snapshot";
import { featuredTournament } from "@/services/tournaments";
import { TournamentLink } from "@/features/tournaments/TournamentViews";
import { Countdown } from "@/features/league/Countdown";
import { LeagueHeatmap, LeagueTable, Podium } from "@/features/league/LeagueViews";

export const metadata = { title: "Liga" };

export default async function LeaguePage() {
  const id = await requireProfileId();
  const [league, snapshot] = await Promise.all([loadLeague(id), loadSnapshot(id)]);
  if (!league || !snapshot) redirect("/perfiles");

  const [h, m] = currentTimeInTimeZone(snapshot.settings.timezone).split(":").map(Number);
  const remainingMs = ((diffDays(league.monthEnd, league.today) + 1) * 1440 - (h * 60 + m)) * 60_000;
  const { members, matchday } = league;
  const leader = members[0];
  const tournament = featuredTournament(league.today);

  return (
    <Page wide>
      <PageHeader
        eyebrow={formatMonthYear(league.monthStart)}
        title="Liga del mes"
        description="Gana quien es más constante con sus propios objetivos, no quien entrena más."
        action={
          <span className="flex flex-col items-end rounded-[10px] bg-surface px-3 py-1.5 shadow-card">
            <span className="text-[11px] text-ink-3">Cierra en</span>
            <span className="text-[15px] font-semibold text-ink">
              <Countdown remainingMs={remainingMs} />
            </span>
          </span>
        }
      />

      {tournament && (
        <div className="animate-fade-up mb-3 md:mb-4">
          <TournamentLink summary={tournament} compact />
        </div>
      )}

      {!league.meParticipates && (
        <Card className="mb-3 md:mb-4">
          <p className="text-[13px] text-ink-2">
            No participas en la liga este mes. Puedes volver cuando quieras desde{" "}
            <Link href="/ajustes" className="font-medium text-accent hover:underline">
              Ajustes
            </Link>
            .
          </p>
        </Card>
      )}

      {members.length === 0 ? (
        <EmptyState
          icon={<Trophy />}
          title="Aún no hay nadie en la liga"
          description="Cuando alguien del grupo registre entrenos, cardio o hábitos aparecerá aquí."
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-4">
          <div className="flex min-w-0 flex-col gap-3 lg:gap-4">
            <Card className="animate-fade-up">
              <CardHeader
                icon={<Crown />}
                title="Podio"
                subtitle={leader && leader.points > 0 ? `${leader.profile.name} lidera con ${leader.points} pts` : "Todo por decidir"}
              />
              <Podium members={members} />
            </Card>

            <Card className="animate-fade-up" style={{ animationDelay: "40ms" }}>
              <CardHeader icon={<ListOrdered />} title="Clasificación" subtitle="Flechas: cambio de puesto desde el domingo pasado" />
              <LeagueTable members={members} />
            </Card>

            <Card className="animate-fade-up" style={{ animationDelay: "80ms" }}>
              <CardHeader icon={<CalendarRange />} title="Día a día" subtitle={formatMonthYear(league.monthStart)} />
              <LeagueHeatmap members={members} today={league.today} />
            </Card>
          </div>

          <div className="flex min-w-0 flex-col gap-3 lg:gap-4">
            {matchday && (
              <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
                <CardHeader icon={<Trophy />} title="Última jornada" subtitle={formatWeekRange(matchday.weekStart)} />
                {matchday.winners.length ? (
                  <ul className="flex flex-col gap-2">
                    {matchday.winners.map((w) => (
                      <li key={w.profile.id} className="flex items-center gap-2.5">
                        <Avatar name={w.profile.name} color={w.profile.color} emoji={w.profile.avatarEmoji} url={w.profile.avatarUrl} size={28} rounded="full" />
                        <span className="flex-1 truncate text-[14px] font-medium">{w.profile.name}</span>
                        <span className="tabular text-[13px] text-ink-2">{w.points} pts</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-ink-3">Nadie puntuó la semana pasada.</p>
                )}
                {matchday.me && (
                  <p className="mt-3 border-t border-line pt-3 text-[13px] text-ink-2">
                    Tu puesto: <span className="tabular font-semibold text-ink">{matchday.me.position}.º</span> de {matchday.me.of} ·{" "}
                    <span className="tabular">{matchday.me.points} pts</span>
                  </p>
                )}
              </Card>
            )}

            <Card className="animate-fade-up" style={{ animationDelay: "100ms" }}>
              <CardHeader
                icon={<Trophy />}
                title="Títulos"
                action={
                  <Link href="/torneos" className="text-[13px] font-medium text-accent hover:underline">
                    Palmarés
                  </Link>
                }
              />
              {league.titles.length ? (
                <ul className="flex flex-col gap-2">
                  {league.titles.map((t) => (
                    <li key={t.month} className="flex items-center gap-2.5 text-[13px]">
                      <span aria-hidden>🏆</span>
                      <span className="w-28 shrink-0 text-ink-3 first-letter:uppercase">{formatMonthYear(t.month)}</span>
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">{t.profiles.map((p) => p.name).join(" y ")}</span>
                      <span className="tabular text-ink-3">{t.points} pts</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-ink-3">El primer campeón se coronará al cerrar este mes.</p>
              )}
            </Card>

            <Card className="animate-fade-up" style={{ animationDelay: "140ms" }}>
              <CardHeader icon={<Info />} title="Cómo se puntúa" />
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[13px] text-ink-2 marker:text-ink-3">
                <li>
                  Entreno {POINTS.workout} · cardio {POINTS.cardio} · día con todos tus hábitos {POINTS.habits}: máximo {POINTS.dailyCap} al día.
                </li>
                <li>Entrenos y cardio por encima de tu objetivo semanal no suman: compites contra tus objetivos, no por volumen.</li>
                <li>
                  Semana con ≥ {POINTS.weekThreshold}% de cumplimiento: +{POINTS.weekBonus}. Cada {POINTS.streakEvery} días seguidos de racha: +{POINTS.streakBonus}.
                </li>
                <li>Solo puntúa lo registrado el mismo día o al siguiente. Los descansos planificados no restan.</li>
                <li>El peso no cuenta ni se muestra. Empate: gana el mejor cumplimiento medio del mes.</li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </Page>
  );
}
