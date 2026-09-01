"use client";

import Link from "next/link";
import Foto from "@/components/Foto";
import {
  type Producto,
  formatCop,
  precioDesde,
  rotuloColorDeFoto,
  colorDeFoto,
} from "@/lib/productos";
import { trackSelectItem } from "@/lib/analytics";
import styles from "./TarjetaProducto.module.css";

// Tarjeta de pieza de la interfaz nueva. Portada del mockup, con dos cambios.
//
// 1. Conserva el trackSelectItem que ya tenía ProductCard en producción. El
//    mockup no tiene analítica, así que si se portara literal se perdería
//    select_item —y SelectItem en Meta— en el paso donde el visitante elige
//    qué pieza mirar.
//
// 2. No pinta el sello con el número de serie. El elemento existe en el
//    mockup y está en la lista de "no tocar", pero se alimenta de un dato que
//    producción no tiene: falta decidir desde qué número arranca el contador.
//    El campo `serie` ya está en el schema para activarlo sin migración.
//
// El rótulo de color describe la FOTO DE PORTADA, no el color destacado de la
// pieza: las cuatro se fabrican en los cinco acabados, y decir "Color Amanecer"
// bajo una toma en azul sería falso. Cuando el color de la portada no está
// declarado, el rótulo lo dice en vez de inventarlo.
export default function TarjetaProducto({
  producto,
  prioridad = false,
  mostrarPrecio = true,
  listName = "Colección",
  nivel = 3,
}: {
  producto: Producto;
  prioridad?: boolean;
  /** La home no muestra precio: ahí la tarjeta invita a entrar en la pieza,
   *  y el precio se encuentra en la ficha y en la colección. Está en la lista
   *  de "no tocar" del handoff. */
  mostrarPrecio?: boolean;
  listName?: string;
  /** Nivel del encabezado del nombre. Tiene que colgar del titular que la
   *  seccion ya puso encima: en la coleccion ese titular es el H1 de la
   *  pagina, asi que las piezas son H2; en la home y en "Tambien te puede
   *  gustar" hay un H2 de seccion, y entonces son H3.
   *
   *  El tamano visual NO cambia con el nivel: lo fija la clase `h3` del
   *  sistema. Saltarse un nivel para conseguir el tamano correcto es lo que
   *  produjo el hueco que esto arregla. */
  nivel?: 2 | 3;
}) {
  const Titular = (`h${nivel}`) as "h2" | "h3";
  const portada = producto.fotos[0];
  // La segunda foto hace el cross-fade. Si la pieza solo tiene una, se
  // reutiliza la portada y el efecto simplemente no se nota.
  const hover = producto.fotos[1] ?? portada;
  const colorPortada = colorDeFoto(producto, portada);

  return (
    <Link
      href={`/producto/${producto.slug}`}
      className={styles.tarjeta}
      onClick={() =>
        trackSelectItem(
          {
            slug: producto.slug,
            nombre: producto.nombre,
            precioDesde: precioDesde(producto),
          },
          listName,
        )
      }
    >
      <div className={styles.marco}>
        {portada && (
          <Foto
            src={portada}
            alt={`Bolso ${producto.nombre} de La Marquessa${colorPortada ? `, color ${colorPortada.nombre}` : ""}`}
            ancho={1600}
            alto={2000}
            prioridad={prioridad}
            className={`${styles.foto} ${styles.principal}`}
          />
        )}
        {hover && hover !== portada && (
          <Foto
            src={hover}
            alt=""
            ancho={1600}
            alto={2000}
            className={`${styles.foto} ${styles.hover}`}
          />
        )}
      </div>

      <div className={styles.datos}>
        <Titular className={`h3 ${styles.nombre}`}>{producto.nombre}</Titular>
        <p className={`eyebrow eyebrow-dato ${styles.color}`}>
          {rotuloColorDeFoto(producto, portada)}
        </p>
        {mostrarPrecio && (
          <p className={`precio ${styles.precio}`}>
            {formatCop(precioDesde(producto))}
          </p>
        )}
      </div>
    </Link>
  );
}
