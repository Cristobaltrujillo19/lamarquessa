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

/** Semanas de fabricación: cada bolso se hace a pedido. */
export const PRODUCCION_SEMANAS = 2;

/** Envío: tarifa plana nacional (confirmada). */
export const SHIPPING_COP = 16_500;

/** Días hábiles que tarda la transportadora, ya fabricado el bolso. */
export const ENVIO_DIAS = 2;
/** Umbral de envío gratis. ⚠️ [PENDIENTE: confirmar] */
export const ENVIO_GRATIS_DESDE = 350_000;

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
