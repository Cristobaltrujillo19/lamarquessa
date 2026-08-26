"use client";

import { useEffect, useRef, useState } from "react";
import Foto, { altDeFoto } from "@/components/Foto";
import { type Producto, rotuloColorDeFoto } from "@/lib/productos";
import styles from "./ConfiguradorPieza.module.css";

/** Milisegundos que se queda cada foto. Cinco segundos es el umbral de la
 *  WCAG 2.2.2 para contenido en movimiento: por encima hace falta un control
 *  de parada, y aquí lo es que el visitante navegue a mano, que detiene el
 *  automático para siempre. Tampoco se gana nada yendo más rápido: una foto
 *  de producto necesita mirarse. */
const INTERVALO = 5000;

/**
 * Carrusel de las fotos de la pieza. Scroll horizontal nativo con
 * scroll-snap, sin ninguna librería: el gesto del dedo, el trackpad y el
 * teclado los resuelve el navegador, y las flechas solo llaman a scrollTo.
 *
 * TRES TRAMPAS QUE COSTARON DEPURACIÓN Y NO HAY QUE REINTRODUCIR:
 *
 * 1. El temporizador NO puede depender del índice observado. La primera
 *    versión encadenaba setTimeout con `indice` en las dependencias, e
 *    `indice` se deduce del scroll real. Si un desplazamiento no cuajaba
 *    —pestaña oculta, gesto que lo interrumpe— el índice no cambiaba, el
 *    efecto no se re-ejecutaba y el carrusel se paraba PARA SIEMPRE. Ahora
 *    es un setInterval que lee la posición del DOM en cada disparo.
 *
 * 2. Las flechas leen la posición del DOM, no el estado, por lo mismo: un
 *    reflejo que va un tic por detrás hace que "el siguiente" salte mal.
 *
 * 3. overflow-y: hidden va declarado a mano en la pista (en el CSS). Con
 *    solo overflow-x, el eje vertical pasa a `auto` y la pista se convierte
 *    en un scroller anidado que en táctil se traga los gestos verticales.
 *
 * PARADA: navegar a mano (flecha, punto o deslizar) detiene el automático
 * para siempre — es el único mecanismo de parada que queda desde que se
 * retiró el botón de pausa, y es lo que cumple la WCAG 2.2.2. Hover, foco y
 * pestaña oculta lo pausan solo mientras duran.
 */
export default function GaleriaPieza({
  producto,
  fotos,
  colorId,
}: {
  producto: Producto;
  /** Ya reordenadas: las del color elegido van delante. */
  fotos: string[];
  /** Solo para reiniciar el carrusel cuando cambia la elección. */
  colorId: string;
}) {
  const pista = useRef<HTMLDivElement | null>(null);
  const [indice, setIndice] = useState(0);

  /** El visitante tomó el control. A partir de ahí no vuelve a moverse solo. */
  const [detenido, setDetenido] = useState(false);
  /** Pausa implícita: cursor encima o foco dentro. Mirar una foto no debería
   *  ser una carrera contra el temporizador. */
  const [rozado, setRozado] = useState(false);
  const [movimientoReducido, setMovimientoReducido] = useState(false);
  /** El navegador no anima scroll suave en una pestaña oculta, así que el
   *  auto-avance se quedaría lanzando desplazamientos al vacío. */
  const [oculto, setOculto] = useState(false);

  const total = fotos.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const leer = () => setMovimientoReducido(mq.matches);
    leer();
    mq.addEventListener("change", leer);
    return () => mq.removeEventListener("change", leer);
  }, []);

  useEffect(() => {
    const leer = () => setOculto(document.visibilityState === "hidden");
    leer();
    document.addEventListener("visibilitychange", leer);
    return () => document.removeEventListener("visibilitychange", leer);
  }, []);

  /** Lleva el carrusel a una diapositiva. */
  const irA = (i: number, suave = true) => {
    const el = pista.current;
    if (!el) return;
    el.scrollTo({
      left: i * el.clientWidth,
      behavior: suave && !movimientoReducido ? "smooth" : "auto",
    });
  };

  /** Posición real leída del DOM. Es la fuente de verdad para navegar. */
  const indiceReal = () => {
    const el = pista.current;
    if (!el || el.clientWidth === 0) return indice;
    return Math.round(el.scrollLeft / el.clientWidth);
  };

  /** El índice se deduce del scroll real, no de un contador propio: así un
   *  deslizamiento con el dedo actualiza los puntos igual que las flechas,
   *  sin dos fuentes de verdad que se desincronicen. */
  const alDesplazar = () => {
    const el = pista.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndice((prev) => (prev === i ? prev : i));
  };

  // Auto-avance. Intervalo, no cadena de timeouts. Ver trampa 1.
  useEffect(() => {
    if (detenido || rozado || oculto || movimientoReducido || total < 2) return;
    const id = window.setInterval(() => {
      irA((indiceReal() + 1) % total);
    }, INTERVALO);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detenido, rozado, oculto, movimientoReducido, total]);

  // Al cambiar de color la galería se reordena y la primera foto pasa a ser
  // la de ese color. Sin esto el visitante elige Caribe y se queda mirando la
  // diapositiva 3, que es de otro acabado.
  useEffect(() => {
    setIndice(0);
    irA(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorId]);

  return (
    <div
      className={styles.galeria}
      role="group"
      aria-roledescription="carrusel"
      aria-label={`Fotos de ${producto.nombre}`}
      onMouseEnter={() => setRozado(true)}
      onMouseLeave={() => setRozado(false)}
      onFocusCapture={() => setRozado(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setRozado(false);
      }}
    >
      <div
        ref={pista}
        className={styles.pista}
        onScroll={alDesplazar}
        onTouchStart={() => setDetenido(true)}
      >
        {fotos.map((src, i) => (
          <div
            key={src}
            className={styles.diapositiva}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${total}`}
          >
            <div className={styles.marcoFoto}>
              <Foto
                src={src}
                alt={altDeFoto(src, producto.nombre)}
                ancho={1600}
                alto={2000}
                prioridad={i === 0}
              />
              {/* Marca de agua: dice el color QUE ENSEÑA ESTA FOTO, no el que
                  esté seleccionado. Si siguiera al selector, elegir Marea
                  estamparía "Marea" sobre un bolso beige. Va en CSS sobre la
                  imagen, nunca quemada en el JPG: se corrige, se traduce y no
                  toca los originales. */}
              <span className={styles.marcaAgua} aria-hidden="true">
                {rotuloColorDeFoto(producto, src)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {total > 1 && (
        <div className={styles.mandos}>
          <button
            type="button"
            className={styles.flecha}
            onClick={() => {
              setDetenido(true);
              irA((indiceReal() - 1 + total) % total);
            }}
            aria-label="Foto anterior"
          >
            ‹
          </button>

          {/* Los puntos son botones, no adornos: son la única forma de saltar
              a una foto concreta con el teclado sin recorrer el carrusel. */}
          <div className={styles.puntos}>
            {fotos.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`${styles.punto} ${i === indice ? styles.puntoActivo : ""}`}
                onClick={() => {
                  setDetenido(true);
                  irA(i);
                }}
                aria-label={`Ir a la foto ${i + 1} de ${total}`}
                aria-current={i === indice ? "true" : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.flecha}
            onClick={() => {
              setDetenido(true);
              irA((indiceReal() + 1) % total);
            }}
            aria-label="Foto siguiente"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
