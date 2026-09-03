"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TEXTO_COOKIES,
  type DecisionCookies,
  aplicarDecision,
  guardarDecision,
  leerDecision,
} from "@/lib/cookies";
import styles from "./BannerCookies.module.css";

/**
 * Aviso informativo de cookies. Ver `lib/cookies.ts` para por qué es
 * informativo y no opt-in.
 *
 * No se renderiza en el servidor: la decisión vive en `localStorage`, que solo
 * existe en el navegador. Pintarlo en el HTML y esconderlo después daría un
 * parpadeo a quien ya decidió, y un salto de maquetación. El sitio tiene CLS
 * en 0 y eso no se rompe por un banner.
 */
export default function BannerCookies() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  // El panel no lleva analítica (ver Analitica.tsx), así que tampoco tiene
  // sentido preguntarle por cookies a quien entra a administrar.
  const esPanel = pathname?.startsWith("/panel") ?? false;

  useEffect(() => {
    if (esPanel) return;
    const previa = leerDecision();
    if (previa) {
      // Ya decidió en otra visita. Se vuelve a aplicar porque los proveedores
      // arrancan concedidos en cada carga: sin esto, quien rechazó volvería a
      // ser medido al día siguiente.
      aplicarDecision(previa);
      return;
    }
    setVisible(true);
  }, [esPanel]);

  const decidir = (d: DecisionCookies) => {
    guardarDecision(d);
    aplicarDecision(d);
    setVisible(false);
  };

  if (!visible || esPanel) return null;

  return (
    <div
      className={styles.banner}
      role="region"
      aria-label="Aviso sobre cookies"
    >
      <p className={styles.texto}>
        {TEXTO_COOKIES}{" "}
        <Link href="/privacidad" className={styles.enlace}>
          Ver la política de datos
        </Link>
      </p>
      <div className={styles.acciones}>
        <button
          type="button"
          className={styles.rechazar}
          onClick={() => decidir("rechazado")}
        >
          Rechazar
        </button>
        <button
          type="button"
          className={styles.aceptar}
          onClick={() => decidir("aceptado")}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
