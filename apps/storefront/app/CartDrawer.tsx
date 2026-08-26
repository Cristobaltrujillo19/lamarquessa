"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCarrito } from "@/lib/carrito";
import { formatCop } from "@/lib/productos";
import { trackRemoveFromCart, trackViewCart } from "@/lib/analytics";
import { addOnsPorUnidad } from "@/lib/personalizacion";

export default function CartDrawer() {
  const { lineas, abierto, cerrar, cambiarCantidad, quitar, subtotal, cantidadTotal } =
    useCarrito();

  // view_cart al abrir el drawer. Usamos ref para disparar SOLO en la
  // transición cerrado → abierto: si `lineas` cambia mientras está abierto
  // (por editar cantidades), no queremos volver a disparar view_cart.
  const estabaAbierto = useRef(false);
  useEffect(() => {
    if (abierto && !estabaAbierto.current) {
      trackViewCart(lineas, subtotal);
    }
    estabaAbierto.current = abierto;
  }, [abierto, lineas, subtotal]);

  function quitarLinea(key: string) {
    const linea = lineas.find((x) => x.key === key);
    if (linea) trackRemoveFromCart(linea);
    quitar(key);
  }

  return (
    <>
      <div
        onClick={cerrar}
        aria-hidden={!abierto}
        className={`fixed inset-0 z-60 bg-[rgba(47,32,22,0.55)] transition-opacity duration-300 ${
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Carrito"
        aria-hidden={!abierto}
        className={`fixed right-0 top-0 z-70 flex h-full w-[min(420px,92vw)] flex-col bg-[var(--espuma)] shadow-2xl transition-transform duration-300 ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--tinta-12)] px-5 py-4">
          <p className="font-[var(--font-display)] text-xl">Tu carrito ({cantidadTotal})</p>
          <button onClick={cerrar} aria-label="Cerrar" className="text-[var(--tinta-70)] hover:text-[var(--cobre-texto)]">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {lineas.length === 0 ? (
            <p className="mt-16 text-center text-[var(--tinta-70)]">Tu carrito está vacío.</p>
          ) : (
            lineas.map((l) => {
              const efectivo = l.precioCop + addOnsPorUnidad(l.personalizacion);
              return (
              <div key={l.key} className="flex gap-3 border-b border-[var(--tinta-12)] py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.foto} alt={l.nombre} className="h-24 w-20 rounded-sm object-cover" />
                <div className="flex-1">
                  <p className="font-[var(--font-display)] text-lg leading-tight">{l.nombre}</p>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--tinta-70)]">
                    {l.colorNombre} · {l.tamanoNombre}
                  </p>
                  {l.personalizacion?.iniciales && (
                    <p className="text-[11px] text-[var(--cobre-texto)]">
                      Iniciales {l.personalizacion.iniciales.texto}
                    </p>
                  )}
                  {l.personalizacion?.colorPersonalizado && (
                    <p className="text-[11px] text-[var(--cobre-texto)]">
                      Color: {l.personalizacion.colorPersonalizado.descripcion}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-sm border border-[var(--tinta-40)]">
                      <button onClick={() => cambiarCantidad(l.key, l.cantidad - 1)} className="px-2.5 py-1 hover:text-[var(--cobre-texto)]" aria-label="Restar">−</button>
                      <span className="min-w-6 text-center text-sm">{l.cantidad}</span>
                      <button onClick={() => cambiarCantidad(l.key, l.cantidad + 1)} className="px-2.5 py-1 hover:text-[var(--cobre-texto)]" aria-label="Sumar">+</button>
                    </div>
                    <span className="font-[var(--font-display)] text-lg">{formatCop(efectivo * l.cantidad)}</span>
                  </div>
                  <button onClick={() => quitarLinea(l.key)} className="mt-1 text-[11px] text-[var(--tinta-70)] underline hover:text-[var(--cobre-texto)]">
                    Quitar
                  </button>
                </div>
              </div>
              );
            })
          )}
        </div>

        {lineas.length > 0 && (
          <div className="border-t border-[var(--tinta-12)] px-5 py-4">
            <div className="flex items-baseline justify-between font-[var(--font-display)] text-lg">
              <span>Subtotal</span>
              <span>{formatCop(subtotal)}</span>
            </div>
            <p className="mt-1 text-[11px] text-[var(--tinta-70)]">Envío calculado en el checkout.</p>
            <Link
              href="/checkout"
              onClick={cerrar}
              className="mt-3 block rounded-[var(--radio)] bg-[var(--tinta)] px-6 py-3 text-center text-[15px] font-medium uppercase tracking-[0.04em] text-[var(--espuma)] transition-colors hover:bg-[var(--cafe)]"
            >
              Ir a pagar
            </Link>
            <Link href="/carrito" onClick={cerrar} className="mt-2 block text-center text-[11px] text-[var(--tinta-70)] underline hover:text-[var(--cobre-texto)]">
              Ver el carrito
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
