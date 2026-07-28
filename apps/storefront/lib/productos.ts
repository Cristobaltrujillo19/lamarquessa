// Tipos y utilidades de producto. El catálogo real vive en Convex (tabla
// `productos`, editable desde el panel); aquí solo quedan el tipo que comparten
// los componentes y los formateadores de precio.

export type Color = {
  id: string;
  nombre: string;
  /** Muestra de color para el selector. */
  hex: string;
  /** Segundo color, solo en los acabados bicolor (Horizonte: negro y rojo). */
  hex2?: string;
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
  descripcion: string;
  colores: Color[];
  tamanos: Tamano[];
  fotos: string[];
  insignia?: string;
};

/** Envío: tarifa plana nacional. ⚠️ [PENDIENTE: tarifa real] */
export const ENVIO_COP = 16_500;

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
