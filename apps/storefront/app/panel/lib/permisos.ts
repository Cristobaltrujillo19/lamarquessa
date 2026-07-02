import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { secreto } from "./auth";

// ¿La sesión (uid) puede ver Finanzas? El master siempre; los demás por su flag.
export async function puedeVerCuentas(uid: string): Promise<boolean> {
  if (uid === "master") return true;
  const u = await fetchQuery(api.admin.usuarioPorId, {
    secret: secreto(),
    usuarioId: uid as Id<"usuarios">,
  });
  return !!u?.puedeVerCuentas;
}
