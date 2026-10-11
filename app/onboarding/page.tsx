import { switchProfile } from "@/features/auth/actions";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";
import { requireProfileId } from "@/lib/server/session";
import { getProfile } from "@/services/profiles";

export const metadata = { title: "Configura tu perfil" };

export default async function OnboardingPage() {
  const id = await requireProfileId();
  const profile = await getProfile(id);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-[max(32px,env(safe-area-inset-top))]">
      <form action={switchProfile} className="mb-8 self-end">
        <button type="submit" className="text-[13px] text-ink-3 hover:text-ink">
          Cambiar perfil
        </button>
      </form>
      <OnboardingWizard name={profile?.name ?? ""} />
    </main>
  );
}
