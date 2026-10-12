import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { EntityChip } from "@/components/ui/Pills";
import { ProgressBar } from "@/components/ui/Progress";
import { cn } from "@/lib/cn";
import { formatDateWithYear, formatMonthYear, formatShortDate } from "@/lib/dates";
import type { ChallengeProgress, TournamentStatus } from "@/lib/domain/tournaments";
import type { PalmaresEntry, TournamentSummary, TournamentView, Trophy } from "@/services/tournaments";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" } as const;
const PLACE_LABEL = { 1: "Campeón", 2: "Subcampeón", 3: "Bronce" } as const;

function pts(n: number) {
  return `${n} ${n === 1 ? "pt" : "pts"}`;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function days(n: number) {
  return `${n} ${n === 1 ? "día" : "días"}`;
}

export function statusLabel(status: TournamentStatus, daysLeft: number): string {
  switch (status) {
    case "upcoming":
      return daysLeft === 1 ? "Empieza mañana" : `Empieza en ${days(daysLeft)}`;
    case "regular":
      return `Fase regular · quedan ${days(daysLeft)}`;
    case "final":
      return `🔥 La Final · quedan ${days(daysLeft)}`;
    case "finished":
      return "Terminado";
  }
}

function StatusChip({ status, daysLeft }: { status: TournamentStatus; daysLeft: number }) {
  const color = status === "final" ? "var(--orange)" : status === "regular" ? "var(--green)" : status === "upcoming" ? "var(--accent)" : undefined;
  return <EntityChip color={color}>{statusLabel(status, daysLeft)}</EntityChip>;
}

/** Tarjeta-enlace de un torneo (en /torneos y como aviso en /liga). */
export function TournamentLink({ summary, compact }: { summary: TournamentSummary; compact?: boolean }) {
  const { def, status, daysLeft } = summary;
  return (
    <Link
      href={`/torneos/${def.id}`}
      className={cn(
        "group flex items-center gap-3 rounded-[12px] bg-surface p-3.5 shadow-card transition-colors hover:bg-hover",
        status === "finished" && "opacity-80",
      )}
    >
      <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-field text-[24px]">
        {def.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[15px] font-semibold text-ink">{def.name}</span>
          <StatusChip status={status} daysLeft={daysLeft} />
        </span>
        <span className="mt-0.5 block text-xs text-ink-3">
          {formatShortDate(def.start)} – {formatDateWithYear(def.end)}
          {!compact && ` · ${def.challenges.length} retos`}
        </span>
        {!compact && <span className="mt-1 line-clamp-2 block text-[13px] text-ink-2">{def.tagline}</span>}
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Retos del perfil con su progreso. */
export function ChallengeList({ challenges, showProgress }: { challenges: ChallengeProgress[]; showProgress: boolean }) {
  return (
    <ul className="flex flex-col gap-3">
      {challenges.map(({ challenge: c, times, points, current, goal }) => {
        const repeatable = c.rule.kind !== "total";
        const done = c.rule.kind === "total" && times > 0;
        return (
          <li key={c.id} className="flex items-start gap-3">
            <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-field text-[18px]">
              {c.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="truncate text-[14px] font-medium text-ink">{c.name}</span>
                <span className="tabular ml-auto shrink-0 text-xs font-medium text-accent">
                  +{c.points}
                  {repeatable && c.rule.kind !== "daily" ? " cada vez" : c.rule.kind === "daily" ? " / día" : ""}
                </span>
              </span>
              <span className="block text-xs text-ink-3">{c.description}</span>
              {showProgress && (
                <>
                  {c.rule.kind !== "daily" && !done && (
                    <span className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={current / goal} height={4} label={`${c.name}: ${current} de ${goal}`} />
                      <span className="tabular shrink-0 text-[11px] text-ink-3">
                        {current}/{goal}
                        {c.rule.kind === "weekly" ? " esta semana" : c.rule.kind === "streak" ? " seguidos" : ""}
                      </span>
                    </span>
                  )}
                  {(times > 0 || done) && (
                    <span className="mt-1 block text-[11px] font-medium text-green">
                      {done ? "✓ Conseguido" : `✓ ${times} ${times === 1 ? "vez" : "veces"}`} · {pts(points)}
                    </span>
                  )}
                </>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Duelo de la Final. */
export function FinalDuel({ view }: { view: TournamentView }) {
  const [a, b] = view.final;
  if (!a) return null;
  return (
    <div className="flex items-center gap-2">
      {[a, b].map((f, i) =>
        f ? (
          <div key={f.profile.id} className={cn("flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center", i === 1 && "order-3")}>
            <Avatar
              name={f.profile.name}
              color={f.profile.color}
              emoji={f.profile.avatarEmoji}
              url={f.profile.avatarUrl}
              size={52}
              rounded="full"
              className={cn(f.isMe && "ring-2 ring-accent ring-offset-2 ring-offset-surface")}
            />
            <span className="w-full truncate text-[13px] font-medium text-ink">
              {f.profile.name}
              {f.isMe && <span className="text-ink-3"> (tú)</span>}
            </span>
            <span className="tabular text-[22px] font-semibold leading-none text-ink">{f.points}</span>
            <span className="text-[11px] text-ink-3">{f.seed}.º en la fase regular</span>
          </div>
        ) : null,
      )}
      <span aria-hidden className="order-2 shrink-0 text-[13px] font-semibold text-ink-3">
        VS
      </span>
    </div>
  );
}

/** Clasificación del torneo. */
export function TournamentTable({ view }: { view: TournamentView }) {
  const finalists = new Set(view.final.map((f) => f.profile.id));
  const zone = view.def.finalists;
  const showZone = view.finalStart && view.status === "regular";
  return (
    <ul className="-mx-1 flex flex-col">
      {view.members.map((m, i) => (
        <li
          key={m.profile.id}
          className={cn(
            "flex items-center gap-3 rounded-[8px] px-1 py-2 [&+&]:border-t [&+&]:border-line",
            m.isMe && "bg-accent-tint/60",
            showZone && i === zone && "!border-t-2 !border-dashed",
          )}
        >
          <span className="tabular w-6 shrink-0 text-center text-[13px] font-semibold text-ink">{m.position}</span>
          <Avatar name={m.profile.name} color={m.profile.color} emoji={m.profile.avatarEmoji} url={m.profile.avatarUrl} size={32} rounded="full" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[14px] font-medium text-ink">
              <span className="truncate">{m.profile.name}</span>
              {m.isMe && <span className="text-xs font-normal text-ink-3">tú</span>}
              {finalists.has(m.profile.id) && <span title="Finalista">⚔️</span>}
            </span>
            <span className="tabular block text-xs text-ink-3">
              {m.adherence}% · {pts(m.challengePoints)} de retos
              {view.finalStart && m.total !== m.points && ` · ${pts(m.total)} en total`}
            </span>
          </span>
          <span className="tabular w-16 shrink-0 text-right text-[17px] font-semibold text-ink">
            {m.points}
            <span className="ml-0.5 text-[11px] font-normal text-ink-3">pts</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function trophyLabel(t: Trophy): { icon: string; title: string; detail: string } {
  if (t.kind === "league") return { icon: "🏆", title: "Liga", detail: cap(formatMonthYear(t.month)) };
  return {
    icon: t.place === 1 ? t.tournament.emoji : MEDALS[t.place],
    title: `${t.tournament.name} ${t.tournament.end.slice(0, 4)}`,
    detail: PLACE_LABEL[t.place],
  };
}

/** Vitrina de un perfil: títulos primero, luego el resto de podios. */
export function TrophyShelf({ trophies }: { trophies: Trophy[] }) {
  if (!trophies.length) return <p className="text-[13px] text-ink-3">Aún sin trofeos. El primero está a un torneo de distancia.</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {trophies.map((t, i) => {
        const l = trophyLabel(t);
        const gold = t.kind === "league" || t.place === 1;
        return (
          <li
            key={i}
            className={cn("flex items-center gap-2 rounded-full py-1 pl-1.5 pr-3", gold ? "bg-orange-tint" : "bg-field")}
            title={`${l.title} · ${l.detail} · ${pts(t.points)}`}
          >
            <span aria-hidden className="text-[16px] leading-none">
              {l.icon}
            </span>
            <span className="text-xs">
              <span className="font-medium text-ink">{l.title}</span>
              <span className="text-ink-3"> · {l.detail}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Palmarés del grupo. */
export function PalmaresList({ entries, meId }: { entries: PalmaresEntry[]; meId: string }) {
  if (!entries.length) return <p className="text-[13px] text-ink-3">Nadie tiene trofeos todavía. Los campeones de liga y de cada torneo aparecerán aquí.</p>;
  return (
    <ul className="flex flex-col gap-4">
      {entries.map((e) => (
        <li key={e.profile.id} className="flex flex-col gap-2">
          <span className="flex items-center gap-2.5">
            <Avatar name={e.profile.name} color={e.profile.color} emoji={e.profile.avatarEmoji} url={e.profile.avatarUrl} size={28} rounded="full" />
            <span className="flex-1 truncate text-[14px] font-medium text-ink">
              {e.profile.name}
              {e.profile.id === meId && <span className="text-xs font-normal text-ink-3"> tú</span>}
            </span>
            <span className="tabular text-xs text-ink-3">
              {e.titles} {e.titles === 1 ? "título" : "títulos"}
            </span>
          </span>
          <TrophyShelf trophies={e.trophies} />
        </li>
      ))}
    </ul>
  );
}
