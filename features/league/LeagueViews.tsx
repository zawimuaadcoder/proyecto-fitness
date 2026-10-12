import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Flame } from "@/components/ui/Flame";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/dates";
import type { LeagueMember } from "@/services/league";

const MEDALS = ["🥇", "🥈", "🥉"];

function pts(n: number) {
  return `${n} ${n === 1 ? "pt" : "pts"}`;
}

/** Podio top 3 (orden visual 2 · 1 · 3). */
export function Podium({ members }: { members: LeagueMember[] }) {
  const top = members.filter((m) => m.position <= 3).slice(0, 3);
  const order = [top[1], top[0], top[2]];
  const heights = ["h-14", "h-20", "h-10"];
  return (
    <ol className="grid grid-cols-3 items-end gap-2 sm:gap-4" aria-label="Podio">
      {order.map((m, i) =>
        m ? (
          <li key={m.profile.id} className="flex min-w-0 flex-col items-center gap-1.5 text-center">
            <span className="relative">
              <Avatar
                name={m.profile.name}
                color={m.profile.color}
                emoji={m.profile.avatarEmoji}
                url={m.profile.avatarUrl}
                size={i === 1 ? 56 : 44}
                rounded="full"
                className={cn(m.isMe && "ring-2 ring-accent ring-offset-2 ring-offset-surface")}
              />
              <span aria-hidden className="absolute -bottom-1 -right-1 text-[18px] leading-none">
                {MEDALS[m.position - 1]}
              </span>
            </span>
            <span className="w-full truncate text-[13px] font-medium text-ink">
              {m.profile.name}
              {m.isMe && <span className="text-ink-3"> (tú)</span>}
            </span>
            <span className="tabular text-xs text-ink-3">{pts(m.points)}</span>
            <span
              className={cn(
                "tabular flex w-full items-start justify-center rounded-t-[10px] pt-1.5 text-[15px] font-semibold",
                heights[i],
                m.position === 1 ? "bg-orange-tint text-orange" : "bg-field text-ink-2",
              )}
            >
              {m.position}
            </span>
          </li>
        ) : (
          <li key={`empty-${i}`} aria-hidden />
        ),
      )}
    </ol>
  );
}

function Movement({ member }: { member: LeagueMember }) {
  if (member.previousPosition == null) return <span className="text-[11px] text-ink-3">–</span>;
  const diff = member.previousPosition - member.position;
  if (diff === 0)
    return (
      <span className="flex items-center text-ink-3" title="Sin cambios vs semana anterior">
        <Minus className="size-3" aria-label="Sin cambios" />
      </span>
    );
  const up = diff > 0;
  return (
    <span
      className={cn("tabular flex items-center gap-px text-[11px] font-medium", up ? "text-green" : "text-red")}
      title={`${up ? "Sube" : "Baja"} ${Math.abs(diff)} vs semana anterior`}
    >
      {up ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />}
      <span className="sr-only">{up ? "Sube" : "Baja"}</span>
      {Math.abs(diff)}
    </span>
  );
}

/** Mini barras de puntos de los últimos 7 días (0–3+). */
function Last7({ days }: { days: LeagueMember["last7"] }) {
  const total = days.reduce((s, d) => s + d.points, 0);
  return (
    <span className="flex h-5 items-end gap-[3px]" role="img" aria-label={`Últimos 7 días: ${pts(total)}`}>
      {days.map((d) => (
        <span
          key={d.date}
          title={`${formatShortDate(d.date)}: ${pts(d.points)}`}
          className={cn("w-[5px] rounded-[2px]", d.points > 0 ? "bg-accent" : "bg-field")}
          style={{ height: d.points > 0 ? `${Math.min(100, 30 + (d.points / 4) * 70)}%` : 3 }}
        />
      ))}
    </span>
  );
}

/** Clasificación del mes. En móvil, los detalles van en una segunda línea. */
export function LeagueTable({ members }: { members: LeagueMember[] }) {
  return (
    <div role="table" aria-label="Clasificación del mes" className="-mx-1">
      <div role="row" className="hidden items-center gap-3 px-1 pb-2 text-[11px] font-medium text-ink-3 sm:flex">
        <span role="columnheader" className="w-6 text-center">#</span>
        <span role="columnheader" className="flex-1">Persona</span>
        <span role="columnheader" className="w-12 text-right">Cumpl.</span>
        <span role="columnheader" className="w-14 text-right">Racha</span>
        <span role="columnheader" className="w-[52px] text-center">7 días</span>
        <span role="columnheader" className="w-16 text-right">Puntos</span>
      </div>
      <ul className="flex flex-col">
        {members.map((m) => (
          <li
            key={m.profile.id}
            role="row"
            className={cn(
              "flex items-center gap-3 rounded-[8px] px-1 py-2 [&+&]:border-t [&+&]:border-line",
              m.isMe && "bg-accent-tint/60",
            )}
          >
            <span role="cell" className="flex w-6 shrink-0 flex-col items-center gap-0.5">
              <span className="tabular text-[13px] font-semibold text-ink">{m.position}</span>
              <Movement member={m} />
            </span>
            <span role="cell" className="flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar name={m.profile.name} color={m.profile.color} emoji={m.profile.avatarEmoji} url={m.profile.avatarUrl} size={32} rounded="full" />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 truncate text-[14px] font-medium text-ink">
                  <span className="truncate">{m.profile.name}</span>
                  {m.isMe && <span className="text-xs font-normal text-ink-3">tú</span>}
                  {m.titles > 0 && (
                    <span className="tabular shrink-0 text-xs font-normal text-ink-2" title={`${m.titles} ${m.titles === 1 ? "título" : "títulos"}`}>
                      🏆{m.titles > 1 && `×${m.titles}`}
                    </span>
                  )}
                </span>
                {/* Móvil: detalles bajo el nombre */}
                <span className="mt-0.5 flex items-center gap-2.5 text-xs text-ink-3 sm:hidden">
                  <span className="tabular">{m.adherence}%</span>
                  <span className="flex items-center gap-1">
                    <Flame size={13} state={m.activeToday ? "on" : "off"} />
                    <span className="tabular">{m.streak}</span>
                  </span>
                  <Last7 days={m.last7} />
                </span>
              </span>
            </span>
            <span role="cell" className="tabular hidden w-12 text-right text-[13px] text-ink-2 sm:block">
              {m.adherence}%
            </span>
            <span role="cell" className="hidden w-14 items-center justify-end gap-1 sm:flex">
              <Flame size={16} state={m.activeToday ? "on" : "off"} />
              <span className="tabular text-[13px] text-ink-2">{m.streak}</span>
            </span>
            <span role="cell" className="hidden w-[52px] justify-center sm:flex">
              <Last7 days={m.last7} />
            </span>
            <span role="cell" className="tabular w-16 shrink-0 text-right text-[17px] font-semibold text-ink">
              {m.points}
              <span className="ml-0.5 text-[11px] font-normal text-ink-3">pts</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const LEVELS = [
  { min: 4, cls: "bg-accent", label: "4+" },
  { min: 3, cls: "bg-accent/75", label: "3" },
  { min: 2, cls: "bg-accent/50", label: "2" },
  { min: 1, cls: "bg-accent/25", label: "1" },
];

function cellClass(points: number | null) {
  if (points == null) return "border border-dashed border-line";
  return LEVELS.find((l) => points >= l.min)?.cls ?? "bg-field";
}

/** Heatmap del mes: una fila por persona, un cuadradito por día. */
export function LeagueHeatmap({ members, today }: { members: LeagueMember[]; today: string }) {
  const days = members[0]?.month ?? [];
  return (
    <div>
      <div className="no-scrollbar overflow-x-auto">
        <table className="border-separate border-spacing-[3px]" aria-label="Puntos por día del mes">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-surface" aria-label="Persona" />
              {days.map((d) => {
                const n = Number(d.date.slice(8));
                return (
                  <th key={d.date} scope="col" className={cn("w-3.5 text-[9px] font-normal leading-none", d.date === today ? "font-semibold text-ink" : "text-ink-3")}>
                    {n === 1 || n % 5 === 0 || d.date === today ? n : ""}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.profile.id}>
                <th scope="row" className="sticky left-0 z-10 bg-surface pr-2 text-left">
                  <span className="flex items-center gap-1.5">
                    <Avatar name={m.profile.name} color={m.profile.color} emoji={m.profile.avatarEmoji} url={m.profile.avatarUrl} size={18} rounded="full" />
                    <span className="max-w-[72px] truncate text-xs font-medium text-ink-2">{m.profile.name}</span>
                  </span>
                </th>
                {m.month.map((d) => (
                  <td key={d.date} className="p-0">
                    <span
                      title={d.points == null ? formatShortDate(d.date) : `${formatShortDate(d.date)}: ${pts(d.points)}`}
                      aria-label={d.points == null ? `${formatShortDate(d.date)}: por jugar` : `${formatShortDate(d.date)}: ${pts(d.points)}`}
                      className={cn("block size-3.5 rounded-[3px]", cellClass(d.points), d.date === today && "ring-1 ring-ink/60")}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-3">
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-[2px] bg-field" />0
        </span>
        {[...LEVELS].reverse().map((l) => (
          <span key={l.label} className="flex items-center gap-1">
            <span className={cn("size-2.5 rounded-[2px]", l.cls)} />
            {l.label}
          </span>
        ))}
        <span>puntos al día</span>
      </div>
    </div>
  );
}
