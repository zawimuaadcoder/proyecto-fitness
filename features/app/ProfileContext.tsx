"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ISODate } from "@/lib/dates";
import type { HabitKind, PublicProfile, WeightUnit } from "@/types/db";

export interface QuickHabit {
  id: string;
  name: string;
  icon: string;
  kind: HabitKind;
  target: number | null;
  unit: string | null;
  value: number | null;
  done: boolean;
  scheduledToday: boolean;
}

export interface AppProfile {
  profile: PublicProfile;
  profiles: PublicProfile[];
  today: ISODate;
  timezone: string;
  weightUnit: WeightUnit;
  workoutTypes: string[];
  cardioTypes: string[];
  customTypes: { id: string; category: "workout" | "cardio"; name: string }[];
  habits: QuickHabit[];
  lastWeight: number | null;
  lastWorkoutType: string | null;
  lastCardioType: string | null;
}

const Ctx = createContext<AppProfile | null>(null);

export function ProfileProvider({ value, children }: { value: AppProfile; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppProfile(): AppProfile {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppProfile fuera de ProfileProvider");
  return v;
}
