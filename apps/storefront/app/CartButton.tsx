"use client";

import { useCarrito } from "@/lib/carrito";

export default function CartButton() {
  const { abrir, cantidadTotal } = useCarrito();
  return (
    <button
      onClick={abrir}
      aria-label={`Carrito (${cantidadTotal})`}
      className="relative text-cacao transition-colors hover:text-cobre"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.5 8h11l-1 11.5a1 1 0 0 1-1 .9H8.5a1 1 0 0 1-1-.9L6.5 8Z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </svg>
      {cantidadTotal > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-cobre px-1 text-[10px] font-medium text-blanco">
          {cantidadTotal}
        </span>
      )}
    </button>
  );
}
