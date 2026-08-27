"use client";

import { useState } from "react";
import Foto from "@/components/Foto";
import styles from "./DeslizadorRayosX.module.css";

/**
 * Deslizador de barrido entre la foto normal de la pieza y su vista de
 * rayos X, que ensena lo que cabe dentro.
 *
 * NO ES DECORACION. La FAQ tiene que decir hoy por escrito que en Menorca no
 * cabe un celular, porque "que llegue y no quepa el telefono es justo el tipo
 * de sorpresa que termina en devolucion". Esta imagen responde esa objecion
 * antes de la compra, y por eso lo que se ve dentro de cada bolso tiene que
 * ser cierto: si Menorca apareciera con un celular, la imagen contradiria la
 * ficha y provocaria la devolucion que intenta evitar.
 *
 * DOS DECISIONES DE CONSTRUCCION, Y POR QUE:
 *
 * 1. El control es un <input type="range"> invisible que cubre el marco, no
 *    un arrastre escrito a mano. Asi el componente hereda gratis el rol de
 *    deslizador, el valor anunciado, las teclas de flecha, Inicio/Fin y el
 *    soporte tactil. Reimplementarlo a mano habria costado todo eso y habria
 *    dejado la funcion fuera del alcance de quien no usa raton.
 *
 * 2. La capa de arriba se recorta con clip-path, no con `width`. Recortar por
 *    ancho encogeria la imagen y las dos dejarian de coincidir; el barrido
 *    solo resulta creible mientras las dos capas esten exactamente alineadas.
 *    Por lo mismo, los dos renders deben salir de la MISMA camara.
 *
 * Vive en seccion propia y no dentro del carrusel: alli el gesto horizontal
 * del tirador competiria con el desplazamiento con anclaje de la galeria.
 */
export default function DeslizadorRayosX({
  normal,
  rayosX,
  nombre,
}: {
  /** Ruta de la foto normal. */
  normal: string;
  /** Ruta de la vista de rayos X. Mismo encuadre y mismo tamano. */
  rayosX: string;
  nombre: string;
}) {
  const [valor, setValor] = useState(50);

  return (
    <div
      className={styles.marco}
      style={{ ["--corte" as string]: `${valor}%` }}
    >
      {/* Debajo, la pieza como se ve. */}
      <div className={styles.capa}>
        <Foto
          src={normal}
          alt={`Bolso ${nombre} de La Marquessa visto de frente`}
          ancho={2000}
          alto={2000}
        />
      </div>

      {/* Encima, recortada, la vista de rayos X. Lleva alt propio: la imagen
          aporta informacion que no esta en la de abajo. */}
      <div className={`${styles.capa} ${styles.capaRayos}`}>
        <Foto
          src={rayosX}
          alt={`Vista de rayos X del bolso ${nombre}: lo que cabe dentro`}
          ancho={2000}
          alto={2000}
        />
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        className={styles.rango}
        aria-label={`Descubrir la vista de rayos X del bolso ${nombre}`}
        aria-valuetext={`${Math.round(valor)}% de la vista de rayos X`}
      />

      <div className={styles.linea} aria-hidden="true">
        <span className={styles.tirador}>
          <span className={styles.flechas}>&#9666;&#9656;</span>
        </span>
      </div>

      <span className={`${styles.rotulo} ${styles.rotuloIzq}`} aria-hidden="true">
        La pieza
      </span>
      <span className={`${styles.rotulo} ${styles.rotuloDer}`} aria-hidden="true">
        Rayos X
      </span>
    </div>
  );
}
