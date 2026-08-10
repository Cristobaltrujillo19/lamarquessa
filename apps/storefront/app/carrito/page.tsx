"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCarrito } from "@/lib/carrito";
import { formatCop } from "@/lib/productos";
import { trackRemoveFromCart, trackViewCart } from "@/lib/analytics";

export default function CarritoPage() {
  const { lineas, cambiarCantidad, quitar, subtotal, hidratado } = useCarrito();

  // view_cart una sola vez al llegar a /carrito (después de hidratar el
  // carrito de localStorage: si disparamos antes, mandamos un carrito vacío
  // aunque el cliente tenga cosas guardadas de la visita anterior).
  const disparado = useRef(false);
  useEffect(() => {
    if (hidratado && !disparado.current && lineas.length > 0) {
      trackViewCart(lineas, subtotal);
      disparado.current = true;
    }
  }, [hidratado, lineas, subtotal]);

  function quitarLinea(key: string) {
    const linea = lineas.find((x) => x.key === key);
    if (linea) trackRemoveFromCart(linea);
    quitar(key);
  }

  if (lineas.length === 0) {
    return (
      <div className="mx-auto max-w-[900px] px-5 py-24 text-center">
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

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-12 md:px-8">
      <h1 className="font-titulo text-4xl">Tu carrito</h1>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
        <div className="border-y border-cacao/10">
          {lineas.map((l) => (
            <div key={l.key} className="flex gap-4 border-b border-cacao/10 py-5 last:border-b-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.foto} alt={l.nombre} className="h-28 w-24 rounded-sm object-cover" />
              <div className="flex-1">
                <p className="font-titulo text-xl">{l.nombre}</p>
                <p className="text-[11px] uppercase tracking-wide text-cacao-suave">
                  {l.colorNombre} · {l.tamanoNombre}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-sm border border-cacao/20">
                    <button onClick={() => cambiarCantidad(l.key, l.cantidad - 1)} className="px-3 py-1 hover:text-cobre" aria-label="Restar">−</button>
                    <span className="min-w-7 text-center text-sm">{l.cantidad}</span>
                    <button onClick={() => cambiarCantidad(l.key, l.cantidad + 1)} className="px-3 py-1 hover:text-cobre" aria-label="Sumar">+</button>
                  </div>
                  <span className="font-cita text-lg">{formatCop(l.precioCop * l.cantidad)}</span>
                </div>
                <button onClick={() => quitarLinea(l.key)} className="mt-2 text-[11px] text-cacao-suave underline hover:text-cobre">
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-sm border border-cacao/10 bg-blanco p-6">
          <div className="flex items-baseline justify-between font-cita text-lg">
            <span>Subtotal</span>
            <span>{formatCop(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-cacao-suave">Envío calculado en el checkout.</p>
          <Link
            href="/checkout"
            className="mt-4 block rounded-sm bg-cobre px-6 py-3 text-center text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo"
          >
            Ir a pagar
          </Link>
          <Link href="/tienda" className="mt-3 block text-center text-xs text-cacao-suave underline hover:text-cobre">
            Seguir viendo
          </Link>
        </aside>
      </div>
    </div>
  );
}
