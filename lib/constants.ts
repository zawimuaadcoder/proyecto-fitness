import type { Goal, HabitKind } from "@/types/db";

export const APP_NAME = "Constancia";

export const PROFILE_COLORS = [
  "#7C8CFF",
  "#9B7CFF",
  "#D27CC0",
  "#E57F72",
  "#E3A25C",
  "#CDB660",
  "#5DBB8C",
  "#58AFC9",
] as const;

export const AVATAR_EMOJIS = ["🏃", "🏋️", "🚴", "🧘", "🥗", "⚡", "🌿", "🦊", "🐻", "🌊", "☀️", "🎯"];

export const DEFAULT_WORKOUT_TYPES = [
  "Pecho / tríceps",
  "Espalda / bíceps",
  "Pierna",
  "Full body",
  "Cardio",
  "Descanso",
  "Otro",
] as const;

export const REST_WORKOUT_TYPE = "Descanso";

export const DEFAULT_CARDIO_TYPES = [
  "Caminar",
  "Correr",
  "Bici",
  "Elíptica",
  "Escaleras",
  "Natación",
  "Otro",
] as const;

export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 150, 200, 365] as const;

export const GOAL_LABELS: Record<Goal, string> = {
  lose_fat: "Perder grasa",
  gain_muscle: "Ganar masa",
  maintain: "Mantener",
  habits: "Mejorar hábitos",
  other: "Otro",
};

export const HABIT_KIND_LABELS: Record<HabitKind, string> = {
  check: "Sí / no",
  quantity: "Cantidad",
  weight: "Registrar peso",
  workout: "Entrenamiento",
  cardio: "Cardio (min)",
};

export const HABIT_KIND_HINTS: Record<HabitKind, string> = {
  check: "Lo marcas manualmente.",
  quantity: "Registras un valor hasta llegar al objetivo.",
  weight: "Se completa solo al registrar tu peso.",
  workout: "Se completa al registrar un entreno. Un descanso planificado no rompe la racha.",
  cardio: "Se completa al llegar a los minutos objetivo.",
};

/** Iconos disponibles para hábitos (nombres de lucide). */
export const HABIT_ICONS = [
  "check",
  "droplet",
  "scale",
  "dumbbell",
  "footprints",
  "moon",
  "apple",
  "book-open",
  "brain",
  "salad",
  "pill",
  "sun",
  "heart",
  "coffee",
  "bike",
  "timer",
] as const;

export type HabitIconName = (typeof HABIT_ICONS)[number];

export const DEFAULT_ADHERENCE_WEIGHTS = { habits: 40, workouts: 30, cardio: 30 };

export const LOCAL_PREFS = {
  lastProfile: "fs.lastProfile",
  sidebarCollapsed: "fs.sidebarCollapsed",
  theme: "fs.theme",
  offlineQueue: "fs.offlineQueue",
  tableColumns: "fs.tableColumns",
} as const;

export const SIDEBAR_COOKIE = "fs_sidebar";

/** Primer mes de la liga: los meses anteriores no reparten títulos. */
export const LEAGUE_START_MONTH = "2026-10-01";
