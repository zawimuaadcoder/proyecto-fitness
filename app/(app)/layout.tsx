import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SIDEBAR_COOKIE } from "@/lib/constants";
import { SetupScreen } from "@/components/layout/SetupScreen";
import { requireProfileId } from "@/lib/server/session";
import { analyzeProfile } from "@/services/analysis";
import { buildAppProfile } from "@/services/app-profile";
import { listProfiles } from "@/services/profiles";
import { checkSetup } from "@/services/setup";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const setup = await checkSetup();
  if (!setup.ok) return <SetupScreen status={setup} />;
  const profileId = await requireProfileId();
  const [analysis, profiles, jar] = await Promise.all([analyzeProfile(profileId), listProfiles(), cookies()]);
  if (!analysis) redirect("/perfiles");

  const s = analysis.snapshot;
  const empty = !s.settings.onboarded && s.habits.length === 0 && s.weights.length === 0 && s.workouts.length === 0;
  if (empty) redirect("/onboarding");

  return (
    <AppShell value={buildAppProfile(analysis, profiles)} initialCollapsed={jar.get(SIDEBAR_COOKIE)?.value === "1"}>
      {children}
    </AppShell>
  );
}
