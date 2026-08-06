"use client";

import { useEffect, useRef, useState } from "react";
import { type Producto, formatCop, muestraColor } from "@/lib/productos";
import { useCarrito } from "@/lib/carrito";

export default function ComprarPanel({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const [colorId, setColorId] = useState(producto.colores[0].id);
  const [tamanoId, setTamanoId] = useState(producto.tamanos[0].id);

  const color = producto.colores.find((c) => c.id === colorId) ?? producto.colores[0];
  const tamano = producto.tamanos.find((t) => t.id === tamanoId) ?? producto.tamanos[0];

  // El CTA sticky aparece SOLO cuando el CTA principal ya salió por arriba
  // (el usuario lo vio y siguió scrolleando). Sin esta distinción, aparecería
  // también al cargar la página —cuando el CTA principal está muy abajo, aún
  // sin haberse visto— y estaría duplicando algo que el cliente no ha visto.
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ctaSalioPorArriba, setCtaSalioPorArriba] = useState(false);
  useEffect(() => {
    const el = btnRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // bottom < 0: el botón está por encima del viewport (se scrolleó pasado).
        // Cualquier otra cosa (visible o abajo) → ocultar el sticky.
        setCtaSalioPorArriba(entry.boundingClientRect.bottom < 0);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function agregarAlCarrito() {
    agregar({
      slug: producto.slug,
      nombre: producto.nombre,
      colorId: color.id,
      colorNombre: color.nombre,
      tamanoId: tamano.id,
      tamanoNombre: tamano.nombre,
      precioCop: tamano.precioCop,
      foto: producto.fotos[0],
    });
  }

  return (
    <div className="mt-6">
      <p className="font-cita text-3xl text-cacao">{formatCop(tamano.precioCop)}</p>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.14em] text-cacao-suave">
          Color: <span className="text-cacao">{color.nombre}</span>
        </p>
        <div className="mt-2 flex gap-2">
          {producto.colores.map((c) => (
            <button
              key={c.id}
              onClick={() => setColorId(c.id)}
              title={c.nombre}
              aria-label={c.nombre}
              // 44×44: mínimo táctil recomendado (WCAG, HIG). Antes eran 32×32,
              // muy justos para un dedo. El círculo interior se pinta con un
              // gradiente radial que se detiene al 42%, así el objetivo
              // clicable crece pero la muestra se ve del tamaño de siempre.
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                c.id === colorId ? "ring-2 ring-cobre ring-offset-2 ring-offset-crema" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className={`block h-8 w-8 rounded-full border-2 ${
                  c.id === colorId ? "border-cobre" : "border-cacao/15"
                }`}
                style={{ background: muestraColor(c) }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Con una sola talla el selector sobra: solo añade ruido a la decisión. */}
      {producto.tamanos.length > 1 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.14em] text-cacao-suave">Tamaño</p>
          <div className="mt-2 flex gap-2">
            {producto.tamanos.map((t) => (
              <button
                key={t.id}
                onClick={() => setTamanoId(t.id)}
                className={`rounded-sm border px-6 py-2 text-sm transition-colors ${
                  t.id === tamanoId
                    ? "border-cobre-texto bg-cobre-texto text-blanco"
                    : "border-cacao/25 text-cacao hover:border-cobre-texto"
                }`}
              >
                {t.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        ref={btnRef}
        onClick={agregarAlCarrito}
        className="mt-8 w-full rounded-sm bg-cobre px-8 py-4 text-xs uppercase tracking-[0.18em] text-blanco transition-colors hover:bg-cobre-hondo"
      >
        Agregar al carrito — {formatCop(tamano.precioCop)}
      </button>

      {/* CTA fijo en móvil. Aparece cuando el CTA normal ha salido de vista,
          para que la compra esté siempre a un toque sin duplicar cuando ambos
          se ven. Solo en móvil (md:hidden): en escritorio no hace falta. */}
      <div
        aria-hidden={!ctaSalioPorArriba}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-cacao/10 bg-crema/95 px-4 py-3 shadow-[0_-8px_20px_rgba(74,58,44,0.08)] backdrop-blur-md transition-transform duration-200 md:hidden ${
          ctaSalioPorArriba ? "translate-y-0" : "translate-y-full"
        }`}
        // pb: safe-area para iPhones con notch (home indicator abajo)
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 0.75rem)" }}
      >
        <div className="mx-auto flex max-w-[520px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-cacao">
              Bolso {producto.nombre}
              <span className="text-cacao-suave"> · {color.nombre}</span>
            </p>
            <p className="font-cita text-lg text-cacao">
              {formatCop(tamano.precioCop)}
            </p>
          </div>
          <button
            onClick={agregarAlCarrito}
            tabIndex={ctaSalioPorArriba ? 0 : -1}
            className="shrink-0 rounded-sm bg-cobre px-5 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
