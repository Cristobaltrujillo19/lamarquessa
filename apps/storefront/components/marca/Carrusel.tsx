"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import css from "./Carrusel.module.css";

type Slide = {
  src: string;
  alt: string;
  ancho: number;
  alto: number;
  /** Dónde está el bolso en la foto (object-position). El hero es muy ancho y
   *  las fotos son verticales: sin esto el recorte deja el producto fuera. */
  enfoque?: string;
};

// Carrusel de fotos del hero. Sin librerías: es una pista con translateX.
// La primera foto carga con prioridad (es el LCP de la home); el resto, lazy.
// `ajuste`: "cover" recorta para llenar; "contain" muestra la foto completa
// (lo que queremos con los renders de colección, para no cortar piezas).
export default function Carrusel({
  slides,
  ajuste = "cover",
}: {
  slides: Slide[];
  ajuste?: "cover" | "contain";
}) {
  const [activa, setActiva] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const n = slides.length;

  const reprogramar = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearInterval(timer.current);
    timer.current = setInterval(() => setActiva((i) => (i + 1) % n), 5000);
  }, [n]);

  useEffect(() => {
    reprogramar();
    return () => clearInterval(timer.current);
  }, [reprogramar]);

  const ir = (k: number) => {
    setActiva(((k % n) + n) % n);
    reprogramar();
  };

  return (
    <div className={css.carrusel} aria-roledescription="carrusel">
      <div className={css.viewport}>
        <div
          className={css.pista}
          style={{ transform: `translateX(-${activa * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={s.src} className={css.slide}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.alt}
                width={s.ancho}
                height={s.alto}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                decoding="async"
                style={{ objectFit: ajuste, objectPosition: s.enfoque ?? "center" }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={css.controles}>
        <button
          type="button"
          className={css.flecha}
          onClick={() => ir(activa - 1)}
          aria-label="Foto anterior"
        >
          ‹
        </button>
        <div className={css.puntos}>
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className={`${css.punto} ${i === activa ? css.activo : ""}`}
              onClick={() => ir(i)}
              aria-label={`Ir a la foto ${i + 1}`}
              aria-current={i === activa}
            />
          ))}
        </div>
        <button
          type="button"
          className={css.flecha}
          onClick={() => ir(activa + 1)}
          aria-label="Foto siguiente"
        >
          ›
        </button>
      </div>
    </div>
  );
}
