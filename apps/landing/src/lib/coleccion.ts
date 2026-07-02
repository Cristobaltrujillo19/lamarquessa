// ⚠️ PLACEHOLDER — bolsos de muestra para ver el diseño con la cara de la marca.
// La marca aún no tiene piezas a la venta: esto es para mostrar la estructura.
// Reemplazar con los bolsos reales (nombre, foto, precio y variantes reales).
// Cuando montemos el storefront, esta será la fuente de precios del servidor.

export type Bolso = {
  /** Identificador estable (también para la URL de la tienda). */
  slug: string;
  nombre: string;
  /** Una línea que vende: estilo + para qué/quién. */
  descripcion: string;
  /** Acabados/colores disponibles. Se elegirán en la tienda. */
  variantes: string;
  /** Precio en pesos colombianos (COP), entero. Rango objetivo: $200k–$350k. */
  precioCop: number;
  /** Foto del producto en /public/fotos. Si falta, se muestra el símbolo. */
  foto?: string;
  /** Fallback cuando no hay foto: uno de los símbolos de marca. */
  simbolo: 'concha' | 'velero' | 'hibisco';
  /** Etiqueta opcional (p. ej. "Edición limitada"). */
  insignia?: string;
};

export const coleccion: Bolso[] = [
  {
    slug: 'bolso-venera',
    nombre: 'Bolso Venera',
    descripcion: 'Clutch de noche con textura de concha. Tu pieza statement frente al mar.',
    variantes: 'Arena · Marfil · Cobre',
    precioCop: 299_000,
    foto: '/fotos/bolso-venera.jpg',
    simbolo: 'concha',
    insignia: 'La primera pieza',
  },
  {
    slug: 'bolso-marea',
    nombre: 'Bolso Marea',
    descripcion: 'Tote amplio y liviano para el día, la playa o la ciudad sin esfuerzo.',
    variantes: 'Arena · Caramelo',
    precioCop: 259_000,
    foto: '/fotos/bolso-marea.jpg',
    simbolo: 'velero',
  },
  {
    slug: 'bolso-brisa',
    nombre: 'Bolso Brisa',
    descripcion: 'Crossbody compacto, manos libres, para llevar contigo lo esencial.',
    variantes: 'Marfil · Cobre',
    precioCop: 219_000,
    foto: '/fotos/bolso-brisa.jpg',
    simbolo: 'hibisco',
  },
  {
    slug: 'bolso-coral',
    nombre: 'Bolso Coral',
    descripcion: 'Bucket bag con caída suave y carácter; el favorito para todos los días.',
    variantes: 'Arena · Marfil',
    precioCop: 279_000,
    foto: '/fotos/bolso-coral.jpg',
    simbolo: 'concha',
  },
];

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCop(precioCop: number): string {
  return copFormatter.format(precioCop);
}
