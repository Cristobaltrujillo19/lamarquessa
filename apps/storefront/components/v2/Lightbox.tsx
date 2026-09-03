"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Foto from "@/components/Foto";
import styles from "./Lightbox.module.css";

export type LightboxFoto = { src: string; alt: string };

type Props = {
  fotos: LightboxFoto[];
  indiceInicial: number;
  abierto: boolean;
  onCerrar: () => void;
};

/**
 * Lightbox modal para ver una foto grande, con navegacion anterior/siguiente.
 * Escape cierra, las flechas del teclado navegan. El foco vuelve al elemento
 * que abrio el modal (lo maneja el consumidor al recibir `onCerrar`).
 * Cero libreria: la logica cabe en un archivo.
 *
 * Portado de LM_MOCKUP/components/Lightbox.tsx. Unico cambio: pinta con
 * <Foto> en vez de next/image, para servir AVIF con respaldo JPEG como el
 * resto de las fotos de producto del sitio.
 */
export default function Lightbox({
  fotos,
  indiceInicial,
  abierto,
  onCerrar,
}: Props) {
  const [i, setI] = useState(indiceInicial);
  const botonCerrar = useRef<HTMLButtonElement | null>(null);
  /** La caja del diálogo, para poder retener el tabulador dentro. */
  const dialogo = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setI(indiceInicial);
  }, [indiceInicial, abierto]);

  const cerrar = useCallback(() => onCerrar(), [onCerrar]);
  const anterior = useCallback(
    () => setI((x) => (x - 1 + fotos.length) % fotos.length),
    [fotos.length],
  );
  const siguiente = useCallback(
    () => setI((x) => (x + 1) % fotos.length),
    [fotos.length],
  );

  useEffect(() => {
    if (!abierto) return;
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        anterior();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        siguiente();
      }
      // Retener el tabulador dentro del diálogo. `aria-modal` le dice al
      // lector de pantalla que ignore el fondo, pero NO impide que el
      // tabulador salga: sin esto se recorría a ciegas la ficha que está
      // debajo, tapada por el modal a pantalla completa.
      if (e.key === "Tab") {
        const caja = dialogo.current;
        if (!caja) return;
        const focos = caja.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (focos.length === 0) return;
        const primero = focos[0];
        const ultimo = focos[focos.length - 1];
        // Si el foco se salió del diálogo (o nunca entró), volverlo a meter.
        if (!caja.contains(document.activeElement)) {
          e.preventDefault();
          primero.focus();
          return;
        }
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };
    document.addEventListener("keydown", alTecla);
    // Bloquea el desplazamiento del fondo mientras el modal esta abierto.
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botonCerrar.current?.focus();
    return () => {
      document.removeEventListener("keydown", alTecla);
      document.body.style.overflow = original;
    };
  }, [abierto, cerrar, anterior, siguiente]);

  if (!abierto || fotos.length === 0) return null;

  const foto = fotos[i];

  return (
    <div
      ref={dialogo}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ampliada: ${foto.alt}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <button
        ref={botonCerrar}
        type="button"
        className={styles.cerrar}
        onClick={cerrar}
        aria-label="Cerrar foto ampliada"
      >
        ×
      </button>

      <div className={styles.marco}>
        <Foto
          key={foto.src}
          src={foto.src}
          alt={foto.alt}
          ancho={1600}
          alto={2000}
          prioridad
        />
      </div>

      {fotos.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.flecha} ${styles.flechaIzq}`}
            onClick={anterior}
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.flecha} ${styles.flechaDer}`}
            onClick={siguiente}
            aria-label="Foto siguiente"
          >
            ›
          </button>
          <p className={styles.contador} aria-live="polite">
            {i + 1} / {fotos.length}
          </p>
        </>
      )}
    </div>
  );
}
