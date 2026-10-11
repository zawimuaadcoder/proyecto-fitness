import { Activity, CalendarCheck2, ChevronRight, Flame, History, Pencil, Settings, Table2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Page } from "@/components/layout/Page";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { requireProfileId } from "@/lib/server/session";
import { analyzeProfile } from "@/services/analysis";
import { SessionCard } from "@/features/settings/AccountCards";
import { ThemeCard } from "@/features/settings/PreferencesCard";

export const metadata = { title: "Perfil" };

const LINKS = [
  { href: "/racha", label: "Racha", icon: Flame },
  { href: "/cumplimiento", label: "Cumplimiento semanal", icon: CalendarCheck2 },
  { href: "/cardio", label: "Cardio", icon: Activity },
  { href: "/progreso?tab=semanas", label: "Semanas", icon: History },
  { href: "/progreso?tab=historial", label: "Historial avanzado", icon: Table2 },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

/** Pestaña "Perfil" en móvil: opciones secundarias y cuenta. */
export default async function ProfilePage() {
  const id = await requireProfileId();
  const a = await analyzeProfile(id);
  if (!a) redirect("/perfiles");
  const p = a.snapshot.profile;

  return (
    <Page>
      <div className="animate-fade-up mb-5 flex items-center gap-4">
        <Avatar name={p.name} color={p.color} emoji={p.avatarEmoji} url={p.avatarUrl} size={56} rounded="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight">{p.name}</h1>
          <p className="tabular text-[13px] text-ink-3">
            🔥 {a.streak.current} días · mejor {a.streak.longest} · semana {a.currentWeek.adherence}%
          </p>
        </div>
        <Link href="/ajustes#perfil" aria-label="Editar perfil" className="flex size-9 items-center justify-center rounded-full text-ink-2 shadow-btn hover:bg-hover">
          <Pencil className="size-4" />
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        <Card padded={false}>
          <ul className="divide-y divide-line">
            {LINKS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="flex h-13 items-center gap-3 px-4 py-3.5 text-sm text-ink transition-colors hover:bg-hover">
                  <Icon className="size-4 text-ink-3" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="size-4 text-ink-3" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <ThemeCard />
        <SessionCard />
      </div>
    </Page>
  );
}
