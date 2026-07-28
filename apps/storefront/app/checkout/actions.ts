"use server";

import { fetchAction, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

// Puente entre el formulario del navegador y Convex. Va por el servidor de Next
// (no hay cliente de Convex en el navegador) y, sobre todo, el navegador nunca
// manda precios: solo qué variante y cuántas.

export type LineaCheckout = {
  slug: string;
  colorId: string;
  tamanoId: string;
  cantidad: number;
};

export type ResultadoCheckout =
  | { ok: true; initPoint: string }
  | { ok: false; error: string };

/** Mensaje de error legible. Convex envuelve los throw del servidor con su
 *  propio prefijo; aquí se rescata solo la frase que escribimos nosotros. */
function mensajeLegible(e: unknown): string {
  const bruto = e instanceof Error ? e.message : String(e);
  const limpio = bruto.split("Uncaught Error:").pop()?.split("\n")[0]?.trim();
  return limpio && limpio.length < 200
    ? limpio
    : "No pudimos iniciar el pago. Vuelve a intentarlo o escríbenos por WhatsApp.";
}

export async function iniciarCheckout(datos: {
  nombre: string;
  email: string;
  whatsapp?: string;
  calle: string;
  ciudad: string;
  departamento: string;
  notas?: string;
  codigo?: string;
  items: LineaCheckout[];
}): Promise<ResultadoCheckout> {
  const nombre = datos.nombre.trim();
  const email = datos.email.trim().toLowerCase();

  if (!nombre) return { ok: false, error: "Necesitamos tu nombre." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Revisa el correo: no parece válido." };
  }
  if (!datos.calle.trim() || !datos.ciudad.trim() || !datos.departamento.trim()) {
    return { ok: false, error: "Falta la dirección de envío." };
  }
  if (datos.items.length === 0) {
    return { ok: false, error: "Tu carrito está vacío." };
  }

  try {
    const { initPoint } = await fetchAction(api.orders.createCheckout, {
      cliente: {
        nombre,
        email,
        whatsapp: datos.whatsapp?.trim() || undefined,
      },
      items: datos.items,
      direccion: {
        calle: datos.calle.trim(),
        ciudad: datos.ciudad.trim(),
        departamento: datos.departamento.trim(),
        notas: datos.notas?.trim() || undefined,
      },
      codigo: datos.codigo?.trim() || undefined,
    });
    return { ok: true, initPoint };
  } catch (e) {
    console.error("createCheckout falló:", e);
    return { ok: false, error: mensajeLegible(e) };
  }
}

/** Valida un cupón para mostrar el descuento antes de pagar. El descuento real
 *  se vuelve a calcular en el servidor al crear el pago: esto es solo la vista
 *  previa. */
export async function revisarCupon(
  codigo: string,
  subtotalCop: number,
  envioCop: number,
) {
  if (!codigo.trim()) return { valido: false as const, mensaje: "Escribe un código." };
  try {
    return await fetchQuery(api.cupones.validarCupon, {
      codigo,
      subtotalCop,
      envioCop,
    });
  } catch {
    return { valido: false as const, mensaje: "No pudimos validar el código." };
  }
}
