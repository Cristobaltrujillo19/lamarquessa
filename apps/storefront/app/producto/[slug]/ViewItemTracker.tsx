"use client";

import { useEffect, useRef } from "react";
import { trackViewItem } from "@/lib/analytics";
import type { Producto } from "@/lib/productos";

// Dispara view_item una sola vez por slug con la primera variante (color y
// tamaño por defecto) que se muestra al llegar. Un cambio de color en el
// selector NO vuelve a disparar: es la misma pieza, no otra.
//
// El ref evita el doble disparo de React Strict Mode (dev) sin depender de
// que StrictMode esté o no activo — en prod suma la garantía de que un
// re-render inesperado tampoco doble-cuente la vista.
export default function ViewItemTracker({ producto }: { producto: Producto }) {
  const disparadoPara = useRef<string | null>(null);

  useEffect(() => {
    if (disparadoPara.current === producto.slug) return;
    const color = producto.colores[0];
    const tamano = producto.tamanos[0];
    if (!color || !tamano) return;
    disparadoPara.current = producto.slug;
    trackViewItem({
      slug: producto.slug,
      nombre: producto.nombre,
      colorId: color.id,
      colorNombre: color.nombre,
      tamanoId: tamano.id,
      tamanoNombre: tamano.nombre,
      precioCop: tamano.precioCop,
    });
  }, [producto]);

  return null;
}
