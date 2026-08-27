// Reglas de personalización de bolsos. Único sitio con los precios de los
// add-ons, la lista de fuentes válidas y los validadores. Se importa tanto
// desde el frontend (ficha, carrito, checkout) como desde Convex (server
// re-validación en createCheckout) — no puede haber dos fuentes de verdad
// sobre cuánto cuesta grabar unas iniciales.

/** Costo de grabar hasta 3 iniciales en un bolso. */
export const PERSONALIZACION_INICIALES_COP = 30_000;
/** Costo de un color personalizado (fuera de los acabados de catalogo). */
export const PERSONALIZACION_COLOR_COP = 60_000;

/** Fuentes válidas para las iniciales. Ambas son serifs con trazos gruesos
 *  suficientes para imprimir/embosar bien (los scripts se descartaron por
 *  ilegibilidad en la pieza fabricada). */
export const FUENTES_INICIALES = [
  { id: "queen", nombre: "Queen Serif" },
  { id: "cormorant", nombre: "Cormorant" },
] as const;
export type FuenteInicialesId = (typeof FUENTES_INICIALES)[number]["id"];

const FUENTE_IDS: readonly string[] = FUENTES_INICIALES.map((f) => f.id);
const REGEX_INICIALES = /^[A-ZÑ]{1,3}$/;
const COLOR_LEN_MIN = 3;
const COLOR_LEN_MAX = 60;

/** Deja solo letras, en mayúsculas, y recorta a 3. Espejo de la lógica que
 *  aplica el input del cliente — el server la corre otra vez por seguridad. */
export function normalizarIniciales(texto: string): string {
  return texto
    .toUpperCase()
    .replace(/[^A-ZÑ]/g, "")
    .slice(0, 3);
}

export function esFuenteValida(id: string): id is FuenteInicialesId {
  return FUENTE_IDS.includes(id);
}

export type IniInput = { texto: string; fuenteId: string };
export type ColorInput = { descripcion: string };

/** Forma tal como se persiste (Convex almacena fuenteId como string). El
 *  input del cliente pasa por `validarPersonalizacion` que garantiza que
 *  fuenteId caiga en la lista, pero el TIPO se mantiene laxo para no pelear
 *  con datos leídos de la base. Los consumidores que quieren la garantía
 *  estricta pueden estrechar con esFuenteValida(). */
export type Personalizacion = {
  iniciales?: { texto: string; fuenteId: string };
  colorPersonalizado?: { descripcion: string };
};

/** Recibe la personalización tal como llega del cliente y la devuelve
 *  saneada y validada, o lanza un mensaje humano si algo está mal. Al
 *  final el resultado puede tener 0, 1 o 2 add-ons. */
export function validarPersonalizacion(entrada: {
  iniciales?: IniInput;
  colorPersonalizado?: ColorInput;
}): Personalizacion {
  const salida: Personalizacion = {};

  if (entrada.iniciales) {
    const texto = normalizarIniciales(entrada.iniciales.texto ?? "");
    if (!REGEX_INICIALES.test(texto)) {
      throw new Error("Las iniciales solo aceptan de 1 a 3 letras.");
    }
    if (!esFuenteValida(entrada.iniciales.fuenteId)) {
      throw new Error("Elige una fuente válida para las iniciales.");
    }
    salida.iniciales = { texto, fuenteId: entrada.iniciales.fuenteId };
  }

  if (entrada.colorPersonalizado) {
    const descripcion = (entrada.colorPersonalizado.descripcion ?? "").trim();
    if (descripcion.length < COLOR_LEN_MIN || descripcion.length > COLOR_LEN_MAX) {
      throw new Error(
        `Describe el color que quieres (entre ${COLOR_LEN_MIN} y ${COLOR_LEN_MAX} caracteres).`,
      );
    }
    salida.colorPersonalizado = { descripcion };
  }

  return salida;
}

/** Suma en COP de los add-ons de UNA unidad. Cada bolso se personaliza por
 *  separado, así que dos unidades cobran los add-ons dos veces. */
export function addOnsPorUnidad(personalizacion?: Personalizacion): number {
  let suma = 0;
  if (personalizacion?.iniciales) suma += PERSONALIZACION_INICIALES_COP;
  if (personalizacion?.colorPersonalizado) suma += PERSONALIZACION_COLOR_COP;
  return suma;
}

/** Precio efectivo unitario (base del bolso + sus add-ons). */
export function precioUnitarioEfectivo(
  precioBaseCop: number,
  personalizacion?: Personalizacion,
): number {
  return precioBaseCop + addOnsPorUnidad(personalizacion);
}

/** Hash corto y estable para diferenciar líneas de carrito con el mismo
 *  bolso+color+tamaño pero personalización distinta (dos regalos con
 *  iniciales distintas cuentan como líneas separadas). Cadena vacía si no
 *  hay personalización, para preservar la clave antigua slug|color|tamaño. */
export function hashPersonalizacion(p?: Personalizacion): string {
  if (!p) return "";
  const partes: string[] = [];
  if (p.iniciales) partes.push(`i:${p.iniciales.texto}-${p.iniciales.fuenteId}`);
  if (p.colorPersonalizado) {
    partes.push(`c:${p.colorPersonalizado.descripcion.toLowerCase().replace(/\s+/g, "_")}`);
  }
  return partes.join("|");
}

/** Nombre humano de la fuente por id. Devuelve el id si no está en la lista
 *  (defensivo — evita romper la ficha del pedido si algún día se retira). */
export function nombreFuente(id: string): string {
  return FUENTES_INICIALES.find((f) => f.id === id)?.nombre ?? id;
}
