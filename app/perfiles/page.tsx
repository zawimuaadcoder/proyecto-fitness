import { SetupScreen } from "@/components/layout/SetupScreen";
import { ProfileGrid } from "@/features/profiles/ProfileGrid";
import { requireAccess } from "@/lib/server/session";
import { listProfiles } from "@/services/profiles";
import { checkSetup } from "@/services/setup";

export const metadata = { title: "Perfiles" };

export default async function ProfilesPage({ searchParams }: { searchParams: Promise<{ abrir?: string }> }) {
  const setup = await checkSetup();
  if (!setup.ok) return <SetupScreen status={setup} />;
  await requireAccess();
  const [profiles, params] = await Promise.all([listProfiles(), searchParams]);
  const demoDisabled = process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO !== "true";
  const demoAvailable = !demoDisabled && !profiles.some((p) => ["Alex", "Marta", "Leo"].includes(p.name));
  return <ProfileGrid profiles={profiles} autoOpen={params.abrir ?? null} demoAvailable={demoAvailable} />;
}
