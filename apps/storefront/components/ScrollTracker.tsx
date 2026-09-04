"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackScroll } from "@/lib/analytics";

/** A partir de qué fracción del documento se considera "leyó". */
const UMBRAL = 0.5;

/**
 * Dispara `scroll_50` una vez por página.
 *
 * DOS DECISIONES QUE IMPORTAN:
 *
 * 1. **El listener se quita a sí mismo** en cuanto dispara. El sitio ya tiene
 *    1,2 s de bloqueo del hilo principal (§15 del ESTADO) y no vamos a
 *    añadirle un handler de scroll permanente. Va `passive` para que no pueda
 *    retrasar el desplazamiento ni aunque tarde.
 *
 * 2. **No se comprueba al montar.** En una página corta, media pantalla ya es
 *    más del 50% del documento sin que nadie haya hecho nada, y eso mandaría
 *    un `scroll_50` por cada visita rebotada — exactamente el dato que este
 *    evento existe para distinguir. Hace falta un desplazamiento real.
 *
 * Se remonta con cada cambio de ruta: en una navegación de cliente la página
 * es otra y vuelve a contar desde cero.
 */
export default function ScrollTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let disparado = false;

    const alDesplazar = () => {
      if (disparado) return;
      const alto = document.documentElement.scrollHeight;
      if (alto <= 0) return;
      const leido = (window.scrollY + window.innerHeight) / alto;
      if (leido < UMBRAL) return;
      disparado = true;
      trackScroll(Math.round(UMBRAL * 100));
      window.removeEventListener("scroll", alDesplazar);
    };

    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => window.removeEventListener("scroll", alDesplazar);
  }, [pathname]);

  return null;
}
