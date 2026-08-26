"use client";

import { useMemo, useState } from "react";
import Aparece from "./Aparece";
import TarjetaProducto from "./TarjetaProducto";
import { type Producto, coloresConFoto } from "@/lib/productos";
import styles from "./FiltroColeccion.module.css";

/**
 * Filtro por color sobre la colección.
 *
 * Filtra por los colores de los que EXISTE FOTO de cada pieza, no por un color
 * que la pieza "sea": las cuatro se fabrican en los cinco acabados, así que
 * filtrar por pertenencia devolvía o todo o nada y el filtro no decía nada.
 *
 * Además, las opciones que se ofrecen son solo los colores fotografiados en
 * TODO el catálogo. Manglar y Marea no tienen ni una sola toma todavía, así
 * que no aparecen como chip: un filtro que sabes de antemano que devuelve
 * vacío es un callejón sin salida, no una función.
 *
 * Cliente puro, no toca la URL para no competir con el configurador de la
 * ficha, que sí usa ?color= como estado compartido.
 */
export default function FiltroColeccion({ piezas }: { piezas: Producto[] }) {
  const [filtro, setFiltro] = useState<string>("Todas");

  // Un chip por acabado que tenga foto en alguna pieza, en el orden del
  // catálogo (que ya es el del sistema de diseño).
  const opciones = useMemo(() => {
    const vistos = new Map<string, string>();
    for (const p of piezas) {
      for (const c of coloresConFoto(p)) {
        if (!vistos.has(c.id)) vistos.set(c.id, c.nombre);
      }
    }
    return ["Todas", ...vistos.values()];
  }, [piezas]);

  const visibles = useMemo(
    () =>
      filtro === "Todas"
        ? piezas
        : piezas.filter((p) => coloresConFoto(p).some((c) => c.nombre === filtro)),
    [filtro, piezas],
  );

  return (
    <>
      {/* Con una sola opción el filtro sobra: solo añadiría ruido. */}
      {opciones.length > 2 && (
        <div
          role="radiogroup"
          aria-label="Filtrar por color"
          className={styles.filtro}
        >
          {opciones.map((op) => {
            const activo = filtro === op;
            return (
              <button
                key={op}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => setFiltro(op)}
                className={`${styles.chip} ${activo ? styles.chipActivo : ""}`}
              >
                {op}
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.grilla}>
        {visibles.map((p, i) => (
          <Aparece key={p.slug} paso={i}>
            <TarjetaProducto producto={p} prioridad={i < 2} />
          </Aparece>
        ))}
      </div>
    </>
  );
}
