"use client";

import { useEffect, useRef } from "react";

export const HERO_POSTER = "/assets/video/hero-poster.jpg";

/** Dos codificaciones del mismo plano. Se elige por ancho de ventana, no por
 *  densidad de pantalla: en un teléfono el vídeo va detrás del velo y del
 *  titular, y ahorrarle 1,1 MB de datos móviles vale más que una nitidez que
 *  a ese tamaño casi nadie distingue. */
const HERO_VIDEO_ANCHO = "/assets/video/hero-1280.mp4"; // 1280×720 · 2,4 MB
const HERO_VIDEO_ESTRECHO = "/assets/video/hero-720.mp4"; // 720×406 · 1,2 MB
const CORTE_ANCHO = "(min-width: 768px)";

/**
 * Vídeo de fondo del hero.
 *
 * El original venía en HEVC (hvc1) a 2560×1440 y 117 MB: Chrome en Windows
 * no reproduce HEVC en MP4, así que tal cual habría dejado un hueco negro a
 * la mayoría de visitantes. Se sirve transcodificado a H.264 High, 24 fps,
 * sin pista de audio y con faststart, que reproduce todo.
 *
 * ⚠️ El plano es una PERSONA sobre follaje denso, que es de lo más caro que
 * existe de codificar. Un CRF fijo se dispara: a CRF 30 el fichero salía MÁS
 * grande que el de partida. Por eso ambas versiones van con tope de bitrate.
 * Y por eso tampoco se puede apretar más: a CRF 36 el follaje se empasta y
 * la cara se ablanda, y la cara cae justo en la franja donde el velo aún es
 * casi transparente.
 *
 * ⚠️ El vídeo NO se pide al montar. Medido el 2 de septiembre de 2026 (§15
 * del ESTADO): este elemento era el LCP de la home con 4,4 s, porque el
 * fichero empezaba a bajar justo cuando la página intentaba pintar y le
 * disputaba el ancho de banda al póster, al CSS y a las fuentes. Ahora el
 * elemento nace sin `src` —solo con el póster, que es lo que se ve— y la
 * fuente se asigna cuando la página ya cargó y el hilo está ocioso. El vídeo
 * es decoración: no puede ir por delante de la pieza que la gente vino a ver.
 *
 * Decisiones de reproducción:
 * - muted + playsInline son OBLIGATORIOS para que el autoplay no lo bloqueen
 *   los navegadores. Sin muted, Chrome y Safari rechazan play().
 * - El póster se pinta mientras el vídeo carga, así el hero nunca aparece
 *   vacío ni provoca un salto de maquetación.
 * - Con prefers-reduced-motion el vídeo NO se descarga siquiera: se queda el
 *   póster. Un fondo en bucle es exactamente el tipo de movimiento que esa
 *   preferencia existe para evitar, y bajar megas para no reproducirlos sería
 *   el peor de los dos mundos.
 * - Con "ahorro de datos" activado tampoco se descarga. Quien pide ahorrar
 *   datos no está pidiendo un fondo animado.
 * - Se pausa cuando la pestaña se oculta, para no gastar batería decodificando
 *   algo que nadie ve.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)");

    // `saveData` no existe en el tipo estándar de Navigator y no lo trae todo
    // navegador. Se lee defensivamente: si no está, se asume que no se pidió
    // ahorrar datos.
    const ahorroDeDatos =
      (
        navigator as Navigator & {
          connection?: { saveData?: boolean };
        }
      ).connection?.saveData === true;

    const arrancar = () => {
      if (quieto.matches || document.hidden || !v.src) return;
      // play() devuelve una promesa que se rechaza si el navegador bloquea el
      // autoplay. Se ignora a propósito: en ese caso queda el póster, que es
      // una degradación aceptable y no algo que merezca romper nada.
      v.play().catch(() => {});
    };
    const parar = () => v.pause();

    /** Asigna la fuente por primera vez. Idempotente: si ya hay src, no hace
     *  nada, porque volver a asignarla reiniciaría la descarga. */
    const cargarVideo = () => {
      if (v.src || quieto.matches || ahorroDeDatos) return;
      // Se decide aquí, y no en el servidor, porque el HTML de la home se
      // sirve igual a todo el mundo: elegirlo al renderizar obligaría a
      // variar la respuesta por dispositivo y perdería la caché del CDN.
      v.src = window.matchMedia(CORTE_ANCHO).matches
        ? HERO_VIDEO_ANCHO
        : HERO_VIDEO_ESTRECHO;
      v.load();
      arrancar();
    };

    const alCambiarVisibilidad = () => (document.hidden ? parar() : arrancar());
    const alCambiarMotion = () => {
      if (quieto.matches) parar();
      else {
        // Quien apaga la preferencia a mitad de sesión nunca llegó a
        // descargar el vídeo: hay que pedirlo ahora.
        cargarVideo();
        arrancar();
      }
    };

    // Esperar a que la página termine de cargar y ADEMÁS a que el hilo esté
    // ocioso. Lo primero deja pasar al contenido; lo segundo evita arrancar
    // la descarga en medio de la hidratación.
    let cancelarOcio: (() => void) | undefined;
    const cuandoOcioso = () => {
      // `typeof` y no `"x" in window`: con el `in`, TypeScript estrecha
      // `window` a `never` en la rama else, porque sus tipos dan la API por
      // existente aunque Safari viejo no la traiga.
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(cargarVideo, { timeout: 3000 });
        cancelarOcio = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(cargarVideo, 1200);
        cancelarOcio = () => window.clearTimeout(id);
      }
    };

    // `document.readyState` puede ser "complete" ya en el primer efecto si el
    // usuario llegó por navegación de cliente. En ese caso no habrá evento
    // `load` que esperar y quedaría un vídeo que nunca carga.
    if (document.readyState === "complete") cuandoOcioso();
    else window.addEventListener("load", cuandoOcioso, { once: true });

    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    quieto.addEventListener("change", alCambiarMotion);
    return () => {
      cancelarOcio?.();
      window.removeEventListener("load", cuandoOcioso);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      quieto.removeEventListener("change", alCambiarMotion);
    };
  }, []);

  return (
    <>
      {/* El póster es lo que pinta el LCP de la home, así que se pide con
          prioridad y cuanto antes. React iza este <link> al <head>, de modo
          que el escáner de precarga del navegador lo ve antes de llegar al
          <video> que está más abajo en el cuerpo. */}
      <link
        rel="preload"
        as="image"
        href={HERO_POSTER}
        fetchPriority="high"
      />
      <video
        ref={ref}
        // Sin autoPlay y sin <source>: la fuente la pone el efecto cuando la
        // página ya cargó. Con un <source> aquí el navegador empezaría la
        // descarga durante el primer pintado, que es justo lo que se corrigió.
        muted
        loop
        playsInline
        preload="none"
        poster={HERO_POSTER}
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  );
}
