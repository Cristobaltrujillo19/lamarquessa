// Datos de contacto y mensajes de WhatsApp de La Marquessa.
// ⚠️ PLACEHOLDER: reemplazar con los datos reales de la marca.

export const MARCA = 'La Marquessa';
export const TAGLINE = 'Un sueño tejido por las olas';

export const WHATSAPP = '573000000000'; // ⚠️ poner número real (formato 57XXXXXXXXXX)
export const INSTAGRAM_URL = 'https://www.instagram.com/lamarquessa'; // ⚠️ confirmar usuario
export const INSTAGRAM_HANDLE = '@lamarquessa';
export const EMAIL = 'hola@lamarquessa.co'; // ⚠️ poner correo real

// Endpoint para la lista de espera (captura de correos).
// Vacío = sin backend aún: el formulario abre WhatsApp con el correo para no
// perder el lead. Cuando exista, poner aquí la URL de Formspree o (fase 2) Convex.
export const WAITLIST_ENDPOINT = '';

export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}

// URL del storefront (tienda). En local: PUBLIC_SHOP_URL=http://localhost:3000.
// Si no está configurada (p. ej. en prod antes de desplegar la tienda), los CTAs
// de tienda caen al ancla de la colección para no romper.
export const SHOP_URL = import.meta.env.PUBLIC_SHOP_URL ?? '';
export const enlaceTienda = (): string =>
  SHOP_URL ? `${SHOP_URL}/tienda` : '/#coleccion';
export const enlaceProducto = (slug: string): string =>
  SHOP_URL ? `${SHOP_URL}/producto/${slug}` : '/#coleccion';

// Cada botón usa un mensaje distinto para saber desde dónde escribió la clienta.
export const MENSAJES = {
  general: 'Hola La Marquessa, quiero conocer más de los bolsos 🐚',
  reserva: 'Hola, quiero reservar un bolso de La Marquessa 🐚',
  coleccion: 'Hola, me encantó un bolso de la colección y quiero saber más 🐚',
  pedido: 'Hola, quiero hacer un pedido ✨',
} as const;
