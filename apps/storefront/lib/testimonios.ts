/**
 * Testimonios reales. NUNCA se inventan.
 *
 * Cada entrada va firmada con la pieza concreta que compro esa persona, no
 * con estrellas ni contadores: atribuir una frase a una pieza la convierte
 * en un hecho verificable. Tampoco se emite `Review` ni `AggregateRating`
 * en el JSON-LD — marcar reseñas que no existen es exactamente lo que
 * Google penaliza y lo que la regla de la casa prohibe.
 *
 * Comportamiento segun entorno:
 *   · En PRODUCCION, con el arreglo vacio, `getTestimonios()` devuelve []
 *     y la seccion entera no se renderiza. Ausencia mejor que placeholder.
 *   · En DESARROLLO devuelve andamiaje visiblemente marcado como PENDIENTE,
 *     para poder revisar la maqueta sin publicar nada falso.
 *
 * Anade una entrada aqui SOLO cuando el testimonio este aprobado por
 * escrito por quien lo dijo.
 */

export type Testimonio = {
  /** Frase concreta sobre la pieza: tres o cuatro lineas, no un elogio general. */
  cita: string;
  autor: string;
  ciudad: string;
  /** Slug del producto tal como esta en el catalogo de Convex. */
  piezaSlug: string;
};

/* --- Formato de referencia. Nunca activar sin autorizacion escrita.
{
  cita: "Frase concreta sobre la pieza, tres o cuatro lineas.",
  autor: "Maria C.",
  ciudad: "Bogota",
  piezaSlug: "menorca",
}
--- */

/** Testimonios reales. Vacio = la seccion no existe en produccion. */
export const TESTIMONIOS: Testimonio[] = [];

/** Andamiaje solo para desarrollo: deja la seccion visible para revisarla. */
const ANDAMIAJE_DEV: Testimonio[] = [
  {
    cita: "Aquí va una cita real de tres o cuatro líneas, una idea concreta sobre la pieza, no un elogio general.",
    autor: "TEXTO PENDIENTE",
    ciudad: "CIUDAD PENDIENTE",
    piezaSlug: "menorca",
  },
  {
    cita: "Segunda cita del mismo largo. Idealmente menciona la espera de dos semanas o el color.",
    autor: "TEXTO PENDIENTE",
    ciudad: "CIUDAD PENDIENTE",
    piezaSlug: "mallorca",
  },
  {
    cita: "Tercera cita. Si viene de fuera de Colombia, mejor: sostiene la línea de exportación.",
    autor: "TEXTO PENDIENTE",
    ciudad: "CIUDAD PENDIENTE",
    piezaSlug: "kruta",
  },
];

/** Testimonios efectivos segun entorno. En produccion, solo los reales. */
export function getTestimonios(): Testimonio[] {
  if (TESTIMONIOS.length > 0) return TESTIMONIOS;
  if (process.env.NODE_ENV === "development") return ANDAMIAJE_DEV;
  return [];
}
