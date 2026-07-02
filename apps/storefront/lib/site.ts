// Datos de marca y config de la tienda. ⚠️ PLACEHOLDER: reemplazar por los reales.

export const MARCA = "La Marquessa";
export const TAGLINE = "Un sueño tejido por las olas";

export const WHATSAPP = "573000000000"; // ⚠️ número real (57XXXXXXXXXX)
export const INSTAGRAM_URL = "https://www.instagram.com/lamarquessa";
export const INSTAGRAM_HANDLE = "@lamarquessa";
export const EMAIL = "hola@lamarquessa.co";

/** URL del sitio de marca (landing). En prod: https://lamarquessa.co */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4321";

/** Envío: tarifa plana nacional (placeholder). */
export const SHIPPING_COP = 16_500;
/** Umbral de envío gratis (placeholder). */
export const ENVIO_GRATIS_DESDE = 350_000;

export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}
