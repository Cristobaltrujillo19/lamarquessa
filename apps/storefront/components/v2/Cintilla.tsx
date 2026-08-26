import { getDestinos } from "@/lib/destinos";
import styles from "./Cintilla.module.css";

/**
 * Cintilla de marca: palabras y frases que definen a La Marquessa,
 * desfilando en bucle a ancho completo.
 *
 * Reglas de copy que respeta:
 * - No menciona impresión 3D (decisión del cliente para este bloque).
 * - No usa "taller": su cuota de dos apariciones está gastada en
 *   /nosotros y /confirmacion.
 * - No usa "Nácar": el nombre propio se reserva para donde carga
 *   significado (selector de color, paso 03 del proceso, intro de
 *   colección), y aquí se degradaría a muletilla.
 * - Sin exclamaciones, igual que el resto del sitio.
 * - "Hecho en Medellín" y no "Medellín, Colombia": al integrar los destinos,
 *   la ciudad aparece también como lugar de llegada, y sin el verbo las dos
 *   apariciones se confundían. Así una dice origen y la otra destino.
 */
const FRASES_MARCA = [
  "Piezas únicas",
  "No hay dos iguales",
  "Acabado a mano",
  "Cada pieza lleva su número",
  "Se empieza cuando ya es tuya",
  "Hecho en Medellín",
  "Inspirada en el mar Caribe",
];

/** Promesa genérica. Solo se usa mientras no haya destinos reales que
 *  enseñar: una lista de ciudades a las que de verdad ha salido una pieza
 *  dice lo mismo y además es verificable. */
const PROMESA_ENVIOS = "Envíos a todo el mundo";

/**
 * Compone la cinta. Si hay al menos tres ciudades reales, la promesa
 * genérica cede su sitio a la prueba concreta.
 *
 * El umbral de tres viene de data/destinos.ts y se respeta aquí: menos de
 * tres ciudades no leen como red, leen como excepción.
 */
function componerFrases(): string[] {
  const destinos = getDestinos();
  if (destinos.length < 3) return [...FRASES_MARCA, PROMESA_ENVIOS];
  return [...FRASES_MARCA, "Han salido piezas hacia", ...destinos];
}

function Grupo({ frases, oculto = false }: { frases: string[]; oculto?: boolean }) {
  return (
    <ul className={styles.grupo} aria-hidden={oculto || undefined}>
      {frases.map((f) => (
        <li key={f} className={styles.pieza}>
          <span className={styles.frase}>{f}</span>
          <span className={styles.punto} aria-hidden="true">
            ·
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Cintilla() {
  const frases = componerFrases();

  return (
    <section className={styles.cintilla} aria-label="Lo que define a La Marquessa">
      {/* Dos copias idénticas: la pista se desplaza el 50% de su ancho y al
          reiniciar el ciclo la segunda copia está exactamente donde estaba la
          primera, así que el bucle no tiene costura. La copia duplicada va
          fuera del árbol de accesibilidad para no leer las frases dos veces. */}
      <div className={styles.pista}>
        <Grupo frases={frases} />
        <Grupo frases={frases} oculto />
      </div>
    </section>
  );
}
