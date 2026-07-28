"use client";

import { useEffect } from "react";
import { useCarrito } from "@/lib/carrito";

// El carrito se vacía aquí y no antes de pagar: si el cliente abandona el pago
// o se cae la pasarela, vuelve a la tienda y encuentra su pedido tal como lo
// dejó. Solo cuando Mercado Pago lo devuelve a /gracias damos la compra por
// cerrada.
export default function VaciarCarrito() {
  const { vaciar, hidratado } = useCarrito();

  useEffect(() => {
    // Hay que esperar a que el proveedor haya leído localStorage: los efectos
    // de los hijos corren antes que los del padre, así que vaciar de inmediato
    // se perdería cuando la hidratación restaure el carrito guardado.
    if (hidratado) vaciar();
  }, [hidratado, vaciar]);

  return null;
}
