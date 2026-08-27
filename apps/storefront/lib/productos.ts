// Tipos y utilidades de producto. El catálogo real vive en Convex (tabla
// `productos`, editable desde el panel); aquí solo quedan el tipo que comparten
// los componentes y los formateadores de precio.

import { SHIPPING_COP } from "./site";

export type Color = {
  id: string;
  nombre: string;
  /** Muestra de color para el selector. */
  hex: string;
  /** Segundo color, solo en los acabados bicolor (Horizonte: rojo y negro). */
  hex2?: string;
  /** Frase de marca que describe el color, para el configurador de la ficha.
   *  Opcional: los productos sembrados antes de agosto de 2026 no la traen. */
  descripcion?: string;
  /** Foto de referencia del acabado, para el panel del selector. Ausente
   *  significa que ese acabado todavía no se ha fotografiado. */
  fotoReferencia?: string;
};

/** Valor CSS de la muestra de un acabado. Un acabado bicolor se pinta partido
 *  en diagonal; uno normal, plano. Vive aquí para que el selector de la ficha,
 *  la tarjeta del catálogo y el inventario del panel pinten siempre igual. */
export function muestraColor(c: Pick<Color, "hex" | "hex2">): string {
  if (!c.hex2) return c.hex;
  return `linear-gradient(135deg, ${c.hex} 0 50%, ${c.hex2} 50% 100%)`;
}

export type Tamano = {
  id: string;
  nombre: string;
  /** Precio en COP (entero, sin centavos). */
  precioCop: number;
};

/** Forma mínima que necesitan los componentes de tienda. Encaja con el
 *  documento de Convex, que además trae _id, medidas y material. */
export type Producto = {
  slug: string;
  nombre: string;
  /** Número de serie de la pieza. Todavía no se pinta: falta decidir desde
   *  qué número arranca el contador. */
  serie?: number;
  /** Qué color enseña cada foto, por ruta. Una ruta ausente significa color
   *  no identificado — se rotula pendiente, nunca se adivina. */
  fotoColores?: Record<string, string>;
  /** Vista de rayos X: la pieza en translucido con lo que cabe dentro.
   *  Ausente = la seccion del deslizador no se renderiza. */
  fotoRayosX?: string;
  /** Frase corta bajo el H1 (H2 en la ficha). Opcional: productos que aún no
   *  tienen subtitulo renderizan solo el nombre. */
  subtitulo?: string;
  descripcion: string;
  colores: Color[];
  tamanos: Tamano[];
  fotos: string[];
  insignia?: string;
};

/** Envío: tarifa plana nacional.
 *  Alias de SHIPPING_COP para el código que ya lo importaba con este nombre.
 *  Un solo valor: lo que muestra la tienda y lo que cobra el checkout no pueden
 *  separarse nunca. */
export const ENVIO_COP = SHIPPING_COP;

/** Color que enseña una foto concreta, o null si no está declarado.
 *  Null NO significa que la foto no tenga color: significa que nadie lo
 *  registró, y rotularla de memoria sería inventar. */
export function colorDeFoto(p: Producto, src: string): Color | null {
  const id = p.fotoColores?.[src];
  if (!id) return null;
  return p.colores.find((c) => c.id === id) ?? null;
}

/** Los acabados de los que existe al menos una foto de esta pieza.
 *
 *  Es lo que alimenta el filtro de la colección. Se filtra por colores
 *  FOTOGRAFIADOS, no por colores en los que la pieza se fabrica: las cuatro
 *  se hacen en los cinco, así que filtrar por pertenencia devolvería o todo
 *  o nada, y el filtro no diría nada. */
export function coloresConFoto(p: Producto): Color[] {
  const ids = new Set(Object.values(p.fotoColores ?? {}));
  return p.colores.filter((c) => ids.has(c.id));
}

/** Rótulo del color de una foto, listo para pintar. Trae ya la palabra
 *  "Color" cuando lo hay, porque el marcador de ausencia no la lleva y
 *  anteponerla fuera daría "Color COLOR PENDIENTE". */
export function rotuloColorDeFoto(p: Producto, src: string): string {
  const c = colorDeFoto(p, src);
  return c ? `Color ${c.nombre}` : "COLOR PENDIENTE";
}

/** Las fotos de la pieza con las del color elegido delante.
 *
 *  REORDENA, NO FILTRA. La ficha enseña siempre todas las fotos que existen,
 *  en cualquier acabado; elegir un color solo cambia el orden. Filtrar
 *  escondería tomas que sí tenemos, y con un acabado sin fotografiar dejaría
 *  la galería vacía — que es enseñar menos que nada.
 *
 *  La honestidad la sostienen la marca de agua de cada foto, que dice el
 *  color que esa foto enseña, y el panel de referencia del selector, que
 *  avisa cuando el acabado elegido no tiene ninguna toma. */
export function galeriaOrdenada(p: Producto, colorId: string): string[] {
  const delColor = p.fotos.filter((f) => p.fotoColores?.[f] === colorId);
  const resto = p.fotos.filter((f) => p.fotoColores?.[f] !== colorId);
  return [...delColor, ...resto];
}

/** Precio de la pieza (el más bajo si hubiera varias tallas). */
export function precioDesde(p: Pick<Producto, "tamanos">): number {
  return Math.min(...p.tamanos.map((t) => t.precioCop));
}

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCop(precioCop: number): string {
  return copFormatter.format(precioCop);
}

const cmFormatter = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

/** Medida en centímetros con la coma decimal del español (19,2 — no 19.2). */
export function formatCm(cm: number): string {
  return `${cmFormatter.format(cm)} cm`;
}
