"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Foto from "@/components/Foto";
import { useCarrito } from "@/lib/carrito";
import { formatCop } from "@/lib/productos";
import { trackRemoveFromCart, trackViewCart } from "@/lib/analytics";
import { addOnsPorUnidad, nombreFuente } from "@/lib/personalizacion";
import { PRODUCCION_SEMANAS, SHIPPING_COP } from "@/lib/site";
import styles from "./carrito.module.css";

// Carrito con el lenguaje visual de la interfaz nueva.
//
// El carrito del mockup es una cáscara que lee la elección de la URL: no
// tiene cantidades, ni personalización, ni forma de quitar una línea. Aquí
// se conserva el carrito real —estado en localStorage, cantidades,
// personalización— y solo cambian los estilos.
//
// Los dos eventos de esta ruta se mantienen en el mismo punto del embudo:
// view_cart al llegar con líneas, y remove_from_cart al quitar una.
export default function CarritoPage() {
  const { lineas, cambiarCantidad, quitar, subtotal, hidratado } = useCarrito();

  // view_cart una sola vez al llegar, y DESPUÉS de hidratar el carrito de
  // localStorage: si se dispara antes, manda un carrito vacío aunque el
  // visitante traiga cosas guardadas de la visita anterior.
  const disparado = useRef(false);
  useEffect(() => {
    if (hidratado && !disparado.current && lineas.length > 0) {
      trackViewCart(lineas, subtotal);
      disparado.current = true;
    }
  }, [hidratado, lineas, subtotal]);

  function quitarLinea(key: string) {
    const linea = lineas.find((x) => x.key === key);
    if (linea) trackRemoveFromCart(linea);
    quitar(key);
  }

  if (lineas.length === 0) {
    return (
      <div>
        <section className="seccion-base">
          <div className="contenedor">
            <div className={styles.vacio}>
              <h1 className="h1">Todavía no has elegido pieza.</h1>
              <p className="cuerpo aire-arriba">
                Cada una se fabrica cuando ya tiene dueña, así que nada se
                queda esperando en una bodega.
              </p>
              <div className="aire-arriba-lg">
                <Link href="/tienda" className="btn btn-primario">
                  Ver la colección
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const total = subtotal + SHIPPING_COP;

  return (
    <div>
      <section className="seccion-base" aria-labelledby="titular-carrito">
        <div className="contenedor">
          <p className="eyebrow eyebrow-seccion">Tu selección</p>
          <h1 id="titular-carrito" className="h1 aire-arriba">
            {lineas.length === 1 ? "Una pieza." : `${lineas.length} piezas.`}
          </h1>

          <div className={styles.disposicion}>
            <div>
              {lineas.map((l) => {
                const efectivo = l.precioCop + addOnsPorUnidad(l.personalizacion);
                return (
                  <div key={l.key} className={styles.linea}>
                    <div className={styles.lineaFoto}>
                      <Foto
                        src={l.foto}
                        alt={`Bolso ${l.nombre}`}
                        ancho={400}
                        alto={500}
                      />
                    </div>

                    <div className={styles.lineaDatos}>
                      <p className="h3">{l.nombre}</p>
                      <p className="eyebrow eyebrow-dato">
                        {l.colorNombre} · {l.tamanoNombre}
                      </p>

                      {l.personalizacion?.iniciales && (
                        <p className={styles.personalizacion}>
                          Iniciales {l.personalizacion.iniciales.texto} ·{" "}
                          {nombreFuente(l.personalizacion.iniciales.fuenteId)}
                        </p>
                      )}
                      {l.personalizacion?.colorPersonalizado && (
                        <p className={styles.personalizacion}>
                          Color personalizado ·{" "}
                          {l.personalizacion.colorPersonalizado.descripcion}
                        </p>
                      )}

                      <div className={styles.lineaAcciones}>
                        <div className={styles.cantidad}>
                          <button
                            type="button"
                            className={styles.cantidadBoton}
                            onClick={() => cambiarCantidad(l.key, l.cantidad - 1)}
                            aria-label={`Quitar una unidad de ${l.nombre}`}
                          >
                            −
                          </button>
                          <span className={styles.cantidadValor}>{l.cantidad}</span>
                          <button
                            type="button"
                            className={styles.cantidadBoton}
                            onClick={() => cambiarCantidad(l.key, l.cantidad + 1)}
                            aria-label={`Añadir una unidad de ${l.nombre}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className={styles.quitar}
                          onClick={() => quitarLinea(l.key)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>

                    <p className="precio">{formatCop(efectivo * l.cantidad)}</p>
                  </div>
                );
              })}
            </div>

            <aside className={styles.resumen}>
              <div className={styles.resumenFila}>
                <span className="texto-suave">Subtotal</span>
                <span>{formatCop(subtotal)}</span>
              </div>
              <div className={styles.resumenFila}>
                <span className="texto-suave">Envío</span>
                <span>{formatCop(SHIPPING_COP)}</span>
              </div>
              <div className={`${styles.resumenFila} ${styles.resumenTotal}`}>
                <span className="h3">Total</span>
                <span className="precio">{formatCop(total)}</span>
              </div>

              <Link
                href="/checkout"
                className={`btn btn-primario ${styles.btnAncho}`}
              >
                Ir a pagar
              </Link>

              <p className={`texto-suave ${styles.plazo}`}>
                Se fabrica a pedido: {PRODUCCION_SEMANAS} semanas antes del
                envío.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
