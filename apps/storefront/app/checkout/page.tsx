"use client";

import Link from "next/link";
import { useCarrito } from "@/lib/carrito";
import { formatCop } from "@/lib/productos";
import { SHIPPING_COP } from "@/lib/site";

export default function CheckoutPage() {
  const { lineas, subtotal } = useCarrito();

  if (lineas.length === 0) {
    return (
      <div className="mx-auto max-w-[700px] px-5 py-24 text-center">
        <h1 className="font-titulo text-3xl">Tu carrito está vacío</h1>
        <Link
          href="/tienda"
          className="mt-6 inline-block rounded-sm bg-cobre px-8 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo"
        >
          Ver la colección
        </Link>
      </div>
    );
  }

  const total = subtotal + SHIPPING_COP;

  return (
    <div className="mx-auto max-w-[700px] px-5 py-14 md:px-8">
      <h1 className="font-titulo text-4xl">Checkout</h1>

      <div className="mt-6 rounded-sm border border-cacao/10 bg-blanco p-6">
        {lineas.map((l) => (
          <div key={l.key} className="flex justify-between border-b border-cacao/10 py-3 text-sm">
            <span className="text-cacao-suave">
              {l.nombre} · {l.colorNombre} · {l.tamanoNombre} × {l.cantidad}
            </span>
            <span className="font-cita text-base">{formatCop(l.precioCop * l.cantidad)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCop(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Envío</span>
          <span>{formatCop(SHIPPING_COP)}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between font-cita text-xl">
          <span>Total</span>
          <span>{formatCop(total)}</span>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-dashed border-cobre/50 bg-cobre/5 p-5 text-center text-sm text-cacao-suave">
        🔒 Pago con <b className="text-cacao">Mercado Pago</b> — se conecta cuando tengamos las
        credenciales de la marca.
      </div>
    </div>
  );
}
