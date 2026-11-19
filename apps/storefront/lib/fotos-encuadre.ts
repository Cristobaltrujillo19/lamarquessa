/**
 * Por dónde recortar una foto cuando no cabe entera en su marco.
 *
 * Los marcos del sitio son cuadrados (la galería de la ficha) o 4/5 (las
 * tarjetas de colección), y las fotos vienen en 1:1, 3:4, 4:5 y apaisadas. Lo
 * que no cabe se recorta; por defecto `object-fit: cover` lo quita MITAD
 * ARRIBA Y MITAD ABAJO, que es lo correcto cuando el motivo está en el centro.
 *
 * ⚠️ Aquí viven las excepciones: las fotos donde el bolso NO está en el
 * centro. Sin esto, el recorte centrado se come justo lo que se viene a ver.
 * Revisadas las 17 fotos de bolso una por una (§31 del ESTADO); solo estas
 * cuatro lo necesitan.
 *
 * El valor es el segundo de `object-position`: `0%` ancla ARRIBA (se ve el
 * borde superior del original y el motivo baja), `100%` ancla ABAJO.
 *
 * La clave es la ruta tal cual se guarda en el producto. Una foto que no esté
 * en el mapa se recorta centrada, que es lo que quiere la mayoría.
 */
const ENCUADRES: Record<string, string> = {
  // El bolso va en alto, sobre la cabeza: centrado le cortaba el asa.
  "/fotos/bolso-mallorca-en-uso.jpg": "0%",

  // El bolso está apoyado abajo a la izquierda y es pequeño en el encuadre:
  // centrado desaparecía casi entero de la foto.
  "/fotos/bolso-kruta-en-uso.jpg": "100%",

  // Colgando de la mano, abajo a la derecha: centrado le cortaba los flecos.
  "/fotos/bolso-montt-en-uso.jpg": "100%",

  // Apoyado en el muro, con el asa alta: centrado la dejaba pegada al borde.
  "/fotos/bolso-montt-ambiente.jpg": "0%",
};

/** `object-position` de una foto, o `undefined` si va centrada. */
export function encuadreDeFoto(src: string): string | undefined {
  const y = ENCUADRES[src];
  return y ? `50% ${y}` : undefined;
}
