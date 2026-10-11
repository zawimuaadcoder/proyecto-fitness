import { redirect } from "next/navigation";
import { getActiveProfileId, hasAccess } from "@/lib/server/session";
import { checkSetup } from "@/services/setup";
import { SetupScreen } from "@/components/layout/SetupScreen";

export default async function Home() {
  const setup = await checkSetup();
  if (!setup.ok) return <SetupScreen status={setup} />;
  if (!(await hasAccess())) redirect("/acceso");
  if (await getActiveProfileId()) redirect("/hoy");
  redirect("/perfiles");
}
