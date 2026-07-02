// Catálogo PLACEHOLDER de La Marquessa. Fuente de verdad de precios (como en SER):
// tanto la UI como el servidor leen precios de aquí. Reemplazar por Convex + datos
// reales cuando estén. Cada bolso tiene 2 ejes de variante: Color × Tamaño (Mid/Mini).

export type Color = {
  id: string;
  nombre: string;
  /** Muestra de color para el selector (hex del manual por ahora). */
  hex: string;
};

export type Tamano = {
  id: string;
  nombre: string;
  /** Precio en COP (entero, sin centavos). El Mid es más grande y más caro. */
  precioCop: number;
};

export type Producto = {
  /** Identificador estable, también en la URL: /producto/[slug]. */
  slug: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  /** 3–4 colores. Los exactos se definen después. */
  colores: Color[];
  /** Mid y Mini: misma cartera, distinto tamaño y precio. */
  tamanos: Tamano[];
  /** Galería (en /public/fotos). Placeholder por ahora. */
  fotos: string[];
  insignia?: string;
  activo: boolean;
};

// Colores placeholder tomados del manual. ⚠️ Reemplazar por los reales.
const COLORES: Color[] = [
  { id: "arena", nombre: "Arena", hex: "#c1ab99" },
  { id: "marfil", nombre: "Marfil", hex: "#efe6d9" },
  { id: "cobre", nombre: "Cobre", hex: "#b38561" },
  { id: "cacao", nombre: "Cacao", hex: "#6f5a48" },
];

const tamanos = (mid: number, mini: number): Tamano[] => [
  { id: "mid", nombre: "Mid", precioCop: mid },
  { id: "mini", nombre: "Mini", precioCop: mini },
];

export const productos: Producto[] = [
  {
    slug: "bolso-venera",
    nombre: "Bolso Venera",
    descripcion:
      "Clutch de noche con textura de concha, impreso en 3D y terminado a mano. Tu pieza statement frente al mar.",
    categoria: "Bolsos",
    colores: COLORES,
    tamanos: tamanos(299_000, 219_000),
    fotos: ["/fotos/bolso-venera.jpg", "/fotos/hero-3.jpg", "/fotos/hero-1.jpg"],
    insignia: "La primera pieza",
    activo: true,
  },
  {
    slug: "bolso-marea",
    nombre: "Bolso Marea",
    descripcion:
      "Tote amplio y liviano para el día, la playa o la ciudad sin esfuerzo. Materiales colombianos.",
    categoria: "Bolsos",
    colores: COLORES.slice(0, 3),
    tamanos: tamanos(259_000, 189_000),
    fotos: ["/fotos/bolso-marea.jpg", "/fotos/hero-1.jpg", "/fotos/hero-4.jpg"],
    activo: true,
  },
  {
    slug: "bolso-brisa",
    nombre: "Bolso Brisa",
    descripcion:
      "Crossbody compacto, manos libres, para llevar contigo lo esencial con la pureza del mar.",
    categoria: "Bolsos",
    colores: COLORES.slice(1, 4),
    tamanos: tamanos(219_000, 159_000),
    fotos: ["/fotos/bolso-brisa.jpg", "/fotos/hero-2.jpg"],
    activo: true,
  },
  {
    slug: "bolso-coral",
    nombre: "Bolso Coral",
    descripcion:
      "Bucket bag con caída suave y carácter; el favorito para todos los días, hecho para durar.",
    categoria: "Bolsos",
    colores: COLORES,
    tamanos: tamanos(279_000, 199_000),
    fotos: ["/fotos/bolso-coral.jpg", "/fotos/hero-4.jpg", "/fotos/hero-2.jpg"],
    activo: true,
  },
];

const porSlug = new Map(productos.map((p) => [p.slug, p]));

export function obtenerProducto(slug: string): Producto | undefined {
  return porSlug.get(slug);
}

/** Precio "desde" (el más bajo = Mini) para las tarjetas del catálogo. */
export function precioDesde(p: Producto): number {
  return Math.min(...p.tamanos.map((t) => t.precioCop));
}

/** Envío: tarifa plana nacional (placeholder — ajústalo con la tarifa real). */
export const ENVIO_COP = 16_500;

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCop(precioCop: number): string {
  return copFormatter.format(precioCop);
}
