// Helpers de presentación del panel (puro, sin estado de servidor).

export const ESTADOS = {
  pendiente: { label: "Pendiente", clase: "bg-[#f0e6d8] text-[#8a6d2f]" },
  pagado: { label: "Pagado", clase: "bg-[#e6efe6] text-[#3f6b3f]" },
  enviado: { label: "Enviado", clase: "bg-[#e3e9ef] text-[#3a5a78]" },
  entregado: { label: "Entregado", clase: "bg-[#e8decd] text-[#5a4f45]" },
  cancelado: { label: "Cancelado", clase: "bg-[#f5e3e1] text-[#8a3b32]" },
} as const;

export type EstadoPedido = keyof typeof ESTADOS;

/** Hasta dónde llegó un carrito. "enviado" ya no es un abandono: ese
 *  visitante mandó el formulario y existe un pedido suyo. */
export const PASOS_CARRITO = {
  carrito: { label: "En el carrito", clase: "bg-[#f5e3e1] text-[#8a3b32]" },
  checkout: { label: "Llegó al checkout", clase: "bg-[#f0e6d8] text-[#8a6d2f]" },
  enviado: { label: "Envió el pedido", clase: "bg-[#e6efe6] text-[#3f6b3f]" },
} as const;

export type PasoCarrito = keyof typeof PASOS_CARRITO;

export const METODO_PAGO_LABEL: Record<string, string> = {
  mercadopago: "Mercado Pago",
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta_mp: "Tarjeta (app MP)",
  qr_bancolombia: "QR Bancolombia",
};

const fechaFmt = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatFecha(ms: number | undefined): string {
  if (!ms) return "Sin fecha";
  return fechaFmt.format(new Date(ms));
}

/** Arma un link de wa.me a partir de un número colombiano. */
export function whatsappLink(numero: string | undefined): string | null {
  if (!numero) return null;
  const digits = numero.replace(/\D/g, "");
  if (!digits) return null;
  const conPais = digits.length <= 10 ? `57${digits}` : digits;
  return `https://wa.me/${conPais}`;
}
