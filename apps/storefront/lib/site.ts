// Datos de marca y configuración del sitio.

export const MARCA = "La Marquessa";
/** Variante ortográfica con una sola "s". Solo se usa en el schema
 *  (alternateName) para que quien la busque así también encuentre la marca. */
export const MARCA_VARIANTE = "La Marquesa";
export const TAGLINE = "Un sueño tejido por las olas";

/** Descripción canónica de la marca: se repite igual en el schema, en el
 *  meta description y en el footer para que buscadores y modelos de IA
 *  reconozcan la entidad de forma consistente. */
export const DESCRIPCION_MARCA =
  "La Marquessa es una marca colombiana de bolsos de autor. Cada pieza se fabrica una por una combinando impresión 3D con acabado artesanal a mano, así que no existen dos iguales.";

// WhatsApp de la marca en formato internacional (Colombia: 57 + celular).
export const WHATSAPP = "573332779109";
/** El mismo número en el formato en que se le enseña a una persona. Los
 *  correos transaccionales lo duplican como constante propia porque, con
 *  "use node", Convex no puede importar de este módulo. Si cambia, hay que
 *  tocarlo también en convex/correoCliente.ts y convex/correoEnvio.ts. */
export const WHATSAPP_VISIBLE = "333 277 9109";
export const INSTAGRAM_URL = "https://www.instagram.com/lamarquessa.co/";
export const INSTAGRAM_HANDLE = "@lamarquessa.co";
export const EMAIL = "info.lamarquessa@gmail.com";

/** URL pública del sitio. Se lee de NEXT_PUBLIC_SITE_URL en cada entorno; el
 *  fallback es el dominio en vivo por si la variable llegara a faltar. Un
 *  middleware en la raíz redirige 301 al canónico cualquier host distinto. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lamarquessa.co"
).replace(/\/$/, "");

/** Semanas de fabricación de un BOLSO. Se conserva porque lo usan las
 *  páginas de texto general (/envios, metadatos de la home), donde hablar de
 *  días sería más preciso y peor de leer. */
export const PRODUCCION_SEMANAS = 2;

/** El mismo plazo en días, que es la unidad en la que piensan los productos:
 *  un charm sale en 4, no en media semana. */
export const PRODUCCION_DIAS = PRODUCCION_SEMANAS * 7;

/** Plazo de un PEDIDO: el MAYOR de sus líneas.
 *
 *  Un carrito con un bolso y un charm sale cuando esté el bolso, no cuando
 *  esté el charm. Por eso el carrito y los correos siguen diciendo un solo
 *  plazo y sigue siendo cierto — y por eso NO se puede promediar ni sumar.
 *
 *  Sin líneas devuelve el plazo del bolso, que es el que llevaba el sitio
 *  antes de que existieran los accesorios. */
export function plazoPedidoDias(
  lineas: Array<{ produccionDias?: number }>,
): number {
  return lineas.reduce(
    (max, l) => Math.max(max, l.produccionDias ?? PRODUCCION_DIAS),
    0,
  ) || PRODUCCION_DIAS;
}

/** Días a texto. En semanas cuando cae justo, porque "2 semanas" se lee mejor
 *  que "14 días"; en días cuando no, porque "0,6 semanas" no significa nada. */
export function formatPlazo(dias: number): string {
  if (dias >= 7 && dias % 7 === 0) {
    const s = dias / 7;
    return s === 1 ? "1 semana" : `${s} semanas`;
  }
  return dias === 1 ? "1 día" : `${dias} días`;
}

/** Envío: tarifa plana nacional (confirmada). */
export const SHIPPING_COP = 16_500;

/** Días hábiles que tarda la transportadora, ya fabricado el bolso. */
export const ENVIO_DIAS = 2;
/** Umbral de envío gratis, CONFIRMADO por el dueño el 4 de septiembre de 2026.
 *
 *  Bajado de 350.000 a 250.000 con un motivo medido: a 350.000 no lo alcanzaba
 *  ningún bolso solo —el más caro es Mallorca a 255.000— así que el umbral no
 *  empujaba nada. A 250.000 cada bolso queda a un accesorio de distancia, que
 *  es el trabajo que hace un accesorio aquí: subir el valor del pedido, no
 *  venderse suelto con un envío que cuesta dos tercios de su precio.
 *
 *  Se compara contra el SUBTOTAL de las piezas, nunca contra el total: si se
 *  comparara con el total, el propio envío ayudaría a alcanzar el umbral que
 *  lo elimina, y el cálculo se muerde la cola. */
export const ENVIO_GRATIS_DESDE = 250_000;

/** Envío de un pedido según su subtotal. UNA sola función: lo que muestra la
 *  tienda y lo que cobra el checkout no pueden separarse nunca. */
export function envioCop(subtotalCop: number): number {
  return subtotalCop >= ENVIO_GRATIS_DESDE ? 0 : SHIPPING_COP;
}

export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}

/** Cada punto de contacto usa un mensaje distinto para saber de dónde viene. */
export const MENSAJES = {
  general: "Hola La Marquessa, quiero conocer más de los bolsos 🐚",
  producto: "Hola, me interesa este bolso y quiero preguntarles algo ✨",
  pedido: "Hola, quiero hacer un pedido ✨",
} as const;

/** URL absoluta a partir de una ruta interna (para canonical, OG y sitemap). */
export function urlAbsoluta(ruta = "/"): string {
  return `${SITE_URL}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
}
