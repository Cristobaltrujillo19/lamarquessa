"use client";

import type { ReactNode } from "react";
import { trackFaqOpen } from "@/lib/analytics";
import css from "./preguntas.module.css";

// <details> con tracking de apertura. Extraído a un componente cliente para
// no tener que convertir la página entera del FAQ (server + fetchQuery a
// Convex + JSON-LD del schema FAQPage). Cada pregunta se ocupa de sí misma.
export default function Pregunta({
  id,
  pregunta,
  respuesta,
  extra,
  abierta,
}: {
  id: string;
  pregunta: string;
  respuesta: string[];
  extra?: ReactNode;
  abierta?: boolean;
}) {
  return (
    <details
      id={id}
      className={css.item}
      open={abierta}
      onToggle={(e) => {
        // Solo el evento de APERTURA. El cierre no interesa: si mandamos
        // ambos, GA4 empieza a contar "engagement" ficticio en cada plegado.
        if ((e.currentTarget as HTMLDetailsElement).open) {
          trackFaqOpen(id, pregunta);
        }
      }}
    >
      <summary className={css.pregunta}>
        <h3 className={css.textoPregunta}>{pregunta}</h3>
        <span className={css.signo} aria-hidden="true" />
      </summary>
      <div className={css.respuesta}>
        {respuesta.map((parrafo, j) => (
          <p key={j}>{parrafo}</p>
        ))}
        {extra}
      </div>
    </details>
  );
}
