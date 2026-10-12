import { Activity, CalendarCheck2, Dumbbell, Flame, House, LineChart, Medal, Settings, Target, Trophy, UserRound, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: string[];
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/hoy", label: "Hoy", icon: House },
  { href: "/progreso", label: "Progreso", icon: LineChart, match: ["/progreso"] },
  { href: "/entrenamiento", label: "Entrenamiento", icon: Dumbbell },
  { href: "/cardio", label: "Cardio", icon: Activity },
  { href: "/habitos", label: "Hábitos", icon: Target },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/racha", label: "Racha", icon: Flame },
  { href: "/cumplimiento", label: "Cumplimiento semanal", icon: CalendarCheck2 },
  { href: "/liga", label: "Liga", icon: Trophy },
  { href: "/torneos", label: "Torneos", icon: Medal },
];

export const FOOTER_NAV: NavItem[] = [{ href: "/ajustes", label: "Ajustes", icon: Settings }];

export const MOBILE_NAV: NavItem[] = [
  { href: "/hoy", label: "Hoy", icon: House },
  { href: "/progreso", label: "Progreso", icon: LineChart, match: ["/progreso", "/cumplimiento", "/racha"] },
  { href: "/entrenamiento", label: "Entreno", icon: Dumbbell, match: ["/entrenamiento", "/cardio"] },
  { href: "/habitos", label: "Hábitos", icon: Target },
  { href: "/liga", label: "Liga", icon: Trophy, match: ["/liga", "/torneos"] },
  { href: "/perfil", label: "Perfil", icon: UserRound, match: ["/perfil", "/ajustes", "/historial"] },
];

export function isActive(pathname: string, item: NavItem): boolean {
  const prefixes = item.match ?? [item.href];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
