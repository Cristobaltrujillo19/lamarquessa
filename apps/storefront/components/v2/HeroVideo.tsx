"use client";

import { useEffect, useRef } from "react";

/**
 * Vídeo de fondo del hero.
 *
 * El original venía en HEVC (hvc1) a 2560×1440 y 117 MB: Chrome en Windows
 * no reproduce HEVC en MP4, así que tal cual habría dejado un hueco negro a
 * la mayoría de visitantes. Aquí se sirve ya transcodificado a H.264 High
 * (1440×810, 24 fps, sin pista de audio, faststart), que reproduce todo.
 *
 * Decisiones de reproducción:
 * - muted + playsInline son OBLIGATORIOS para que el autoplay no lo bloqueen
 *   los navegadores. Sin muted, Chrome y Safari rechazan play().
 * - El póster se pinta mientras el vídeo carga, así el hero nunca aparece
 *   vacío ni provoca un salto de maquetación.
 * - Con prefers-reduced-motion el vídeo NO se reproduce: se queda el póster.
 *   Un fondo en bucle es exactamente el tipo de movimiento que esa
 *   preferencia existe para evitar.
 * - Se pausa cuando la pestaña se oculta, para no gastar batería decodificando
 *   algo que nadie ve.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)");

    const arrancar = () => {
      if (quieto.matches || document.hidden) return;
      // play() devuelve una promesa que se rechaza si el navegador bloquea el
      // autoplay. Se ignora a propósito: en ese caso queda el póster, que es
      // una degradación aceptable y no algo que merezca romper nada.
      v.play().catch(() => {});
    };
    const parar = () => v.pause();

    const alCambiarVisibilidad = () => (document.hidden ? parar() : arrancar());
    const alCambiarMotion = () => (quieto.matches ? parar() : arrancar());

    arrancar();
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    quieto.addEventListener("change", alCambiarMotion);
    return () => {
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      quieto.removeEventListener("change", alCambiarMotion);
    };
  }, []);

  return (
    <video
      ref={ref}
      // No lleva autoPlay como atributo: lo arranca el efecto, que es quien
      // sabe si hay que respetar prefers-reduced-motion.
      muted
      loop
      playsInline
      preload="metadata"
      poster="/assets/video/hero-poster.jpg"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/assets/video/hero.mp4" type="video/mp4" />
    </video>
  );
}
