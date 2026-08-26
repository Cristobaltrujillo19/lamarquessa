"use client";

import { useEffect, useRef, useState } from "react";
import Foto from "@/components/Foto";
import { type Color, type Producto, coloresConFoto, muestraColor } from "@/lib/productos";
import styles from "./ConfiguradorPieza.module.css";

/**
 * Selector de acabado: radiogroup de cinco colores con navegación por flechas
 * y un panel de referencia que se asoma al pasar el cursor, al recibir foco o
 * al tocar una muestra.
 *
 * EL ACABADO Y EL COLOR SON COSAS DISTINTAS. El acabado es el relieve Nácar,
 * común a las cinco variantes y a todas las piezas. El color es lo que se
 * elige aquí. Hasta agosto de 2026 el código llamaba "acabado" al color y era
 * una confusión de raíz: no reintroducirla.
 *
 * La elección viaja en ?color= para poder compartir un enlace y sobrevivir a
 * un refresco. NO se lee con useSearchParams: eso haría que la ruta bailara a
 * render dinámico y perdería el prerender. Se lee de window.location dentro
 * de un efecto y se escribe con history.replaceState —replace y no push para
 * no llenar el historial de clics con cada color tanteado.
 */
export default function SelectorColor({
  producto,
  elegido,
  onElegir,
}: {
  producto: Producto;
  elegido: Color;
  onElegir: (c: Color) => void;
}) {
  // Color que el visitante está "asomando". Es independiente del elegido: se
  // puede mirar Marea sin dejar de tener Amanecer seleccionado.
  const [asomado, setAsomado] = useState<string | null>(null);
  const bloqueColores = useRef<HTMLDivElement | null>(null);
  const contenedorOpciones = useRef<HTMLDivElement | null>(null);

  // En táctil no hay mouseleave: la vista previa se queda hasta que el dedo
  // toca en otro sitio. Escape también la cierra, para quien navega con
  // teclado y no quiere mover el foco solo para quitarla de en medio.
  useEffect(() => {
    if (!asomado) return;
    const fuera = (e: Event) => {
      if (!bloqueColores.current?.contains(e.target as Node)) setAsomado(null);
    };
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAsomado(null);
    };
    document.addEventListener("touchstart", fuera, { passive: true });
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", alTecla);
    return () => {
      document.removeEventListener("touchstart", fuera);
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", alTecla);
    };
  }, [asomado]);

  const orden = producto.colores;
  const iActual = orden.findIndex((c) => c.id === elegido.id);

  const focoA = (id: string) => {
    contenedorOpciones.current
      ?.querySelector<HTMLButtonElement>(`[data-color="${id}"]`)
      ?.focus();
  };

  const mover = (delta: number) => {
    const sig = orden[(iActual + delta + orden.length) % orden.length];
    onElegir(sig);
    focoA(sig.id);
  };

  const alTeclado = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      mover(1);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      mover(-1);
    }
    if (e.key === "Home") {
      e.preventDefault();
      onElegir(orden[0]);
      focoA(orden[0].id);
    }
    if (e.key === "End") {
      e.preventDefault();
      const u = orden[orden.length - 1];
      onElegir(u);
      focoA(u.id);
    }
  };

  // Acabados de los que existe foto de ESTA pieza, para avisar cuando el que
  // se asoma no tiene ninguna toma.
  const conFoto = coloresConFoto(producto);
  const vista = asomado ? orden.find((c) => c.id === asomado) : null;
  const vistaTieneFoto = vista ? conFoto.some((c) => c.id === vista.id) : false;

  return (
    <div ref={bloqueColores}>
      <p id="titulo-color" className="eyebrow eyebrow-seccion">
        Color
      </p>

      {/* Envoltorio posicionado: la vista previa se ancla a la fila de
          muestras, no al bloque entero. El mouseleave va AQUÍ y no en cada
          botón — si estuviera en los botones, cruzar de una muestra a la
          vecina apagaría y encendería el panel en cada paso. */}
      <div className={styles.zonaColores} onMouseLeave={() => setAsomado(null)}>
        <div
          ref={contenedorOpciones}
          role="radiogroup"
          aria-labelledby="titulo-color"
          className={styles.opciones}
          onKeyDown={alTeclado}
        >
          {orden.map((c) => {
            const activo = c.id === elegido.id;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={activo}
                data-color={c.id}
                tabIndex={activo ? 0 : -1}
                onClick={() => onElegir(c)}
                onMouseEnter={() => setAsomado(c.id)}
                onFocus={() => setAsomado(c.id)}
                onTouchStart={() => setAsomado(c.id)}
                aria-describedby={asomado === c.id ? "vista-color" : undefined}
                className={`${styles.opcion} ${activo ? styles.opcionActiva : ""}`}
              >
                {/* Amanecer mide 1.35:1 contra la superficie y sin contorno
                    reforzado desaparece. Los otros cuatro van de 3.15:1 a
                    15.04:1 y no lo necesitan. */}
                <span
                  className={styles.muestra}
                  aria-hidden="true"
                  style={{
                    background: muestraColor(c),
                    ...(c.id === "amanecer"
                      ? { borderColor: "var(--tinta-70)" }
                      : {}),
                  }}
                />
                {c.nombre}
              </button>
            );
          })}
        </div>

        {/* Vista previa del color. Se asoma sin clic y sin modal que tape la
            pieza. Va en position:absolute para no empujar el CTA hacia abajo
            cada vez que el cursor roza una muestra, y con pointer-events:none
            en el CSS para no robarse su propio hover. */}
        {vista && (
          <div id="vista-color" role="tooltip" className={styles.vistaColor}>
            {vista.fotoReferencia ? (
              <div className={styles.vistaMarco}>
                <Foto
                  src={vista.fotoReferencia}
                  alt={`La colección completa en color ${vista.nombre}`}
                  ancho={840}
                  alto={1050}
                />
              </div>
            ) : (
              <div className={`${styles.vistaMarco} foto-pendiente`}>
                <span>Referencia pendiente</span>
              </div>
            )}
            <p className={styles.vistaNombre}>{vista.nombre}</p>
            {vista.descripcion && (
              <p className={styles.vistaTexto}>{vista.descripcion}</p>
            )}
            {!vistaTieneFoto && (
              <p className={styles.vistaAviso}>
                No hay ninguna foto de {producto.nombre} en este color.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
