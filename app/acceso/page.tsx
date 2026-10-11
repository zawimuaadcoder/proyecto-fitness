import { redirect } from "next/navigation";
import { SetupScreen } from "@/components/layout/SetupScreen";
import { PasswordForm } from "@/features/auth/PasswordForm";
import { getGroupPasswordHash, hasAccess } from "@/lib/server/session";
import { checkSetup } from "@/services/setup";

export const metadata = { title: "Acceso" };

export default async function AccessPage() {
  const setup = await checkSetup();
  if (!setup.ok) return <SetupScreen status={setup} />;
  if (await hasAccess()) redirect("/perfiles");
  const configured = Boolean(await getGroupPasswordHash());
  return <PasswordForm mode={configured ? "login" : "setup"} needsToken={!configured && Boolean(process.env.SETUP_TOKEN)} />;
}
