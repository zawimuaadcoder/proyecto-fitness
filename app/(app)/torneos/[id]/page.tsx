import { ArrowLeft, Crown, ListOrdered, Swords, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Page, PageHeader } from "@/components/layout/Page";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateWithYear, formatShortDate } from "@/lib/dates";
import { getTournament } from "@/lib/domain/tournaments";
import { requireProfileId } from "@/lib/server/session";
import { loadTournament } from "@/services/tournaments";
import { ChallengeList, FinalDuel, statusLabel, TournamentTable } from "@/features/tournaments/TournamentViews";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" } as const;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: getTournament(id)?.name ?? "Torneo" };
}

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id: tournamentId }, me] = await Promise.all([params, requireProfileId()]);
  if (!getTournament(tournamentId)) notFound();
  const view = await loadTournament(me, tournamentId);
  if (!view) redirect("/perfiles");
  const { def, status } = view;
  const started = status !== "upcoming";

  return (
    <Page wide>
      <Link href="/torneos" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
        <ArrowLeft className="size-3.5" /> Torneos
      </Link>
      <PageHeader
        eyebrow={`${formatShortDate(def.start)} – ${formatDateWithYear(def.end)}`}
        title={`${def.emoji} ${def.name}`}
        description={def.tagline}
        action={
          <span className="rounded-[10px] bg-surface px-3 py-1.5 text-[13px] font-medium text-ink shadow-card">
            {statusLabel(status, view.daysLeft)}
          </span>
        }
      />
      {def.note && <p className="-mt-2 mb-3 text-xs text-ink-3">{def.note}</p>}

      {!view.meParticipates && (
        <Card className="mb-3 md:mb-4">
          <p className="text-[13px] text-ink-2">
            Juegan los torneos quienes participan en la liga. Puedes apuntarte desde{" "}
            <Link href="/ajustes" className="font-medium text-accent hover:underline">
              Ajustes
            </Link>
            .
          </p>
        </Card>
      )}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-4">
        <div className="flex min-w-0 flex-col gap-3 lg:gap-4">
          {view.final.length > 0 && (
            <Card className="animate-fade-up">
              <CardHeader
                icon={<Swords />}
                title={status === "finished" ? "La Final" : "La Final está en juego"}
                subtitle={`Solo cuentan los puntos desde el ${formatShortDate(view.finalStart!)}`}
              />
              <FinalDuel view={view} />
            </Card>
          )}

          {started && view.podium.length > 0 && (
            <Card className="animate-fade-up" style={{ animationDelay: "40ms" }}>
              <CardHeader icon={status === "finished" ? <Trophy /> : <Crown />} title={status === "finished" ? "Podio final" : "Podio provisional"} />
              <ul className="flex flex-col gap-2">
                {view.podium.map((p) => (
                  <li key={p.profile.id} className="flex items-center gap-2.5">
                    <span aria-hidden className="w-6 text-center text-[18px]">
                      {MEDALS[p.place]}
                    </span>
                    <Avatar name={p.profile.name} color={p.profile.color} emoji={p.profile.avatarEmoji} url={p.profile.avatarUrl} size={28} rounded="full" />
                    <span className="flex-1 truncate text-[14px] font-medium">
                      {p.profile.name}
                      {p.isMe && <span className="text-xs font-normal text-ink-3"> tú</span>}
                    </span>
                    <span className="tabular text-[13px] text-ink-2">{p.points} pts</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="animate-fade-up" style={{ animationDelay: "80ms" }}>
            <CardHeader
              icon={<ListOrdered />}
              title={view.finalStart ? "Fase regular" : "Clasificación"}
              subtitle={
                view.finalStart
                  ? status === "regular"
                    ? `Los ${def.finalists} primeros juegan la Final desde el ${formatShortDate(view.finalStart)}`
                    : `Hasta el ${formatShortDate(view.finalStart)}`
                  : undefined
              }
            />
            {started && view.members.length ? (
              <TournamentTable view={view} />
            ) : (
              <EmptyState
                icon={<Trophy />}
                title={started ? "Aún no hay nadie" : "Todo por decidir"}
                description={started ? "Cuando alguien puntúe aparecerá aquí." : `Arranca el ${formatShortDate(def.start)}. Ve preparándote.`}
              />
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:gap-4">
          <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <CardHeader icon={<Target />} title={started && view.myChallenges ? "Tus retos" : "Retos"} subtitle="Se suman a los puntos de liga de cada día" />
            <ChallengeList
              challenges={view.myChallenges ?? def.challenges.map((c) => ({ challenge: c, times: 0, points: 0, current: 0, goal: 1 }))}
              showProgress={started && Boolean(view.myChallenges)}
            />
            {def.eventHabits?.length ? (
              <p className="mt-4 border-t border-line pt-3 text-xs text-ink-3">
                Hábitos del torneo: {def.eventHabits.map((h) => h.name).join(", ")}. Aparecen solos en Hábitos una semana antes y en Hoy durante el torneo. Son opcionales: no rompen la racha.
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </Page>
  );
}
