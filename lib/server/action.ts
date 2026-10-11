import "server-only";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import type { ActionResult } from "@/types/domain";
import { requireProfileId } from "./session";

function message(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Error inesperado";
}

/**
 * Envoltorio común de server actions con perfil:
 *  1. valida la sesión en servidor (contraseña de grupo + perfil)
 *  2. valida la entrada con zod
 *  3. ejecuta y revalida la UI
 */
export async function profileAction<S extends z.ZodType, T = undefined>(
  schema: S,
  input: unknown,
  run: (profileId: string, data: z.infer<S>) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const profileId = await requireProfileId();
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
    }
    const data = await run(profileId, parsed.data);
    revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[action]", error);
    return { ok: false, error: message(error) };
  }
}
