"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

/**
 * Puente entre el carrito del navegador y Convex.
 *
 * Va por el servidor de Next, igual que el checkout, y NO por un cliente de
 * Convex en el navegador. Montar un ConvexProvider solo para esto abriria un
 * WebSocket a cada visitante del sitio, y lo unico que hace falta es una
 * escritura ocasional.
 *
 * Como el checkout: el navegador manda QUE variante y CUANTAS, nunca precios.
 */

export type LineaRegistro = {
  slug: string;
  colorId: string;
  tamanoId: string;
  cantidad: number;
  personalizacion?: {
    iniciales?: { texto: string; fuenteId: string };
    colorPersonalizado?: { descripcion: string };
  };
};

export async function registrarCarrito(datos: {
  sesionId: string;
  items: LineaRegistro[];
  paso: "carrito" | "checkout" | "enviado";
  contacto?: { nombre?: string; email?: string; whatsapp?: string };
  consentimiento?: { otorgado: boolean };
}): Promise<void> {
  try {
    await fetchMutation(api.carritos.registrar, datos);
  } catch (e) {
    // Falla en silencio a proposito. Esto es telemetria para nosotros: si
    // Convex no responde, la compra del visitante tiene que seguir su curso
    // como si nada.
    console.error("registrarCarrito fallo:", e);
  }
}
