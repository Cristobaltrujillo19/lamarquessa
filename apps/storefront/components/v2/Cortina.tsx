"use client";

import { useEffect, useState } from "react";
import styles from "./Cortina.module.css";

/**
 * Cortina de entrada. Solo se monta en la home.
 *
 * Presupuesto de tiempo (~2.2s en total):
 *   0ms     el logo entra (fade 900ms desde opacity 0 / scale .97)
 *   1500ms  empieza a salir (la capa se ha sostenido ~1400ms)
 *   2200ms  desmontada
 *
 * Se salta con cualquier clic, tecla o scroll. Una vez por sesión.
 * Con prefers-reduced-motion no aparece.
 *
 * Para desactivarla y medir su costo en conversión: ACTIVA = false.
 */
const ACTIVA = true;
const BANDERA = "lm:cortina-vista";
const ENTRADA_MS = 40;
const SALIDA_MS = 1500;
const FIN_MS = 2200;

export default function Cortina() {
  // Arranca en false para que el HTML servido no incluya la cortina:
  // el contenido se renderiza normal y la capa se añade en el cliente.
  const [montada, setMontada] = useState(false);
  const [dentro, setDentro] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    if (!ACTIVA) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // La bandera se ESCRIBE al cerrar, no aquí: en desarrollo React monta el
    // efecto dos veces, y escribirla al entrar hacía que el segundo montaje
    // abortara dejando la capa pegada en pantalla.
    if (sessionStorage.getItem(BANDERA)) return;

    setMontada(true);

    const temporizadores: number[] = [];
    const cerrar = () => setMontada(false);

    temporizadores.push(
      window.setTimeout(() => {
        // Marcamos aquí, no al entrar en el efecto: el desmontaje inmediato de
        // StrictMode cancela este temporizador, así que el remontaje sigue
        // encontrando la bandera limpia y la cortina corre una sola vez.
        sessionStorage.setItem(BANDERA, "1");
        setDentro(true);
      }, ENTRADA_MS)
    );
    temporizadores.push(window.setTimeout(() => setSaliendo(true), SALIDA_MS));
    temporizadores.push(window.setTimeout(cerrar, FIN_MS));

    const saltar = () => {
      temporizadores.forEach(window.clearTimeout);
      setSaliendo(true);
      temporizadores.push(window.setTimeout(cerrar, 700));
    };

    window.addEventListener("pointerdown", saltar, { once: true });
    window.addEventListener("keydown", saltar, { once: true });
    window.addEventListener("wheel", saltar, { once: true, passive: true });
    window.addEventListener("touchmove", saltar, { once: true, passive: true });

    return () => {
      temporizadores.forEach(window.clearTimeout);
      window.removeEventListener("pointerdown", saltar);
      window.removeEventListener("keydown", saltar);
      window.removeEventListener("wheel", saltar);
      window.removeEventListener("touchmove", saltar);
    };
  }, []);

  if (!montada) return null;

  return (
    <div
      className={`${styles.cortina} ${saliendo ? styles.saliendo : ""}`}
      // Es decoración de marca: el lector de pantalla no debe anunciarla,
      // y el contenido real ya está montado debajo.
      aria-hidden="true"
    >
      <img
        src="/marca/logo-claro.png"
        alt=""
        className={`${styles.logo} ${dentro ? styles.logoDentro : ""}`}
      />
    </div>
  );
}
