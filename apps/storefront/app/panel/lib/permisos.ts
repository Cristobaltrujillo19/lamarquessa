import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { secreto } from "./auth";

// Una sola lectura del usuario, para no pedir el mismo documento dos veces
// cuando una página necesita resolver más de un permiso.
async function usuario(uid: string) {
  return await fetchQuery(api.admin.usuarioPorId, {
    secret: secreto(),
    usuarioId: uid as Id<"usuarios">,
  });
}

// ¿La sesión (uid) puede ver Finanzas? El master siempre; los demás por su flag.
export async function puedeVerCuentas(uid: string): Promise<boolean> {
  if (uid === "master") return true;
  return !!(await usuario(uid))?.puedeVerCuentas;
}

/** ¿Puede borrar un pedido SIN cancelarlo antes, en cualquier estado?
 *
 *  Es un permiso aparte del de Finanzas a propósito: ver la plata y borrar el
 *  registro de una venta no son la misma confianza, y juntarlos obligaría a
 *  dar una para conceder la otra. */
export async function puedeBorrarPedidos(uid: string): Promise<boolean> {
  if (uid === "master") return true;
  return !!(await usuario(uid))?.puedeBorrarPedidos;
}
