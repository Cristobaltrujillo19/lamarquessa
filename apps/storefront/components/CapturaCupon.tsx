"use client";

import { useEffect } from "react";

/** Dónde vive el código mientras la clienta elige su pieza. */
export const CLAVE_CUPON = "lm_cupon";

/**
 * Recoge `?cupon=` de CUALQUIER página y lo guarda hasta el checkout.
 *
 * Nació para los premios de la feria (§24 del ESTADO). El enlace de un mensaje
 * de WhatsApp no puede llevar a `/checkout`: con el carrito vacío ahí no hay
 * nada que pagar. Tiene que llevar a la tienda, para que primero elija su
 * bolso — y entonces el código tiene que sobrevivir ese trayecto.
 *
 * `sessionStorage` y no `localStorage` a propósito: un código de un solo uso no
 * debe quedarse pegado al navegador para siempre. Si la persona vuelve otro
 * día sin el enlace, lo escribe a mano, que es lo correcto.
 *
 * Falla en silencio si el navegador bloquea el almacenamiento: el campo del
 * checkout se queda vacío y se puede teclear. Nunca rompe la compra.
 */
export default function CapturaCupon() {
  useEffect(() => {
    try {
      const c = new URLSearchParams(window.location.search).get("cupon");
      if (!c) return;
      const limpio = c.trim().toUpperCase().slice(0, 40);
      if (limpio) window.sessionStorage.setItem(CLAVE_CUPON, limpio);
    } catch {
      // Sin almacenamiento no se recuerda. Se teclea en el checkout.
    }
  }, []);

  return null;
}
