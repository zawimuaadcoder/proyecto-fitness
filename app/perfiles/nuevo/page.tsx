import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { CreateProfile } from "@/features/profiles/CreateProfile";
import { requireAccess } from "@/lib/server/session";

export const metadata = { title: "Nuevo perfil" };

export default async function NewProfilePage() {
  await requireAccess();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-[max(24px,env(safe-area-inset-top))]">
      <Link href="/perfiles" className="mb-6 inline-flex h-9 w-fit items-center gap-1 rounded-lg pr-3 text-sm text-ink-3 hover:text-ink">
        <ChevronLeft className="size-4" /> Perfiles
      </Link>
      <h1 className="animate-fade-up text-2xl font-semibold tracking-tight">Nuevo perfil</h1>
      <p className="animate-fade-up mt-1 text-sm text-ink-3">Después configurarás tus objetivos en un minuto.</p>
      <div className="animate-fade-up mt-8">
        <CreateProfile />
      </div>
    </main>
  );
}
