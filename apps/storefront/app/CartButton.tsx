"use client";

import { useCarrito } from "@/lib/carrito";

// Abre el cajón del carrito. Es el disparador de view_cart (y de ViewCart en
// Meta) en su punto más frecuente, así que el botón se conserva aunque el
// mockup resolviera esta zona con un enlace plano a /carrito.
//
// Los colores van con las variables de la interfaz nueva porque ahora vive
// sobre el banner --tinta de la cabecera. Antes estaba sobre crema.
export default function CartButton() {
  const { abrir, cantidadTotal } = useCarrito();
  return (
    <button
      onClick={abrir}
      aria-label={`Carrito (${cantidadTotal})`}
      className="relative inline-flex h-11 w-11 items-center justify-center transition-colors"
      style={{ color: "rgba(251, 250, 247, 0.82)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--espuma)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "rgba(251, 250, 247, 0.82)")
      }
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.5 8h11l-1 11.5a1 1 0 0 1-1 .9H8.5a1 1 0 0 1-1-.9L6.5 8Z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </svg>
      {cantidadTotal > 0 && (
        // Cobre sobre tinta oscura: el número va en --tinta, no en blanco.
        // Sobre el cobre #BB825A el blanco mide 2.4:1 y no pasaría AA.
        <span
          className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium"
          style={{ background: "var(--cobre)", color: "var(--tinta)" }}
        >
          {cantidadTotal}
        </span>
      )}
    </button>
  );
}
