"use client";

import { useState } from "react";
import { type Producto, formatCop } from "@/lib/productos";
import { useCarrito } from "@/lib/carrito";

export default function ComprarPanel({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const [colorId, setColorId] = useState(producto.colores[0].id);
  const [tamanoId, setTamanoId] = useState(producto.tamanos[0].id);

  const color = producto.colores.find((c) => c.id === colorId) ?? producto.colores[0];
  const tamano = producto.tamanos.find((t) => t.id === tamanoId) ?? producto.tamanos[0];

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
              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                c.id === colorId ? "border-cobre" : "border-cacao/15"
              }`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.14em] text-cacao-suave">Tamaño</p>
        <div className="mt-2 flex gap-2">
          {producto.tamanos.map((t) => (
            <button
              key={t.id}
              onClick={() => setTamanoId(t.id)}
              className={`rounded-sm border px-6 py-2 text-sm transition-colors ${
                t.id === tamanoId
                  ? "border-cobre bg-cobre text-blanco"
                  : "border-cacao/25 text-cacao hover:border-cobre"
              }`}
            >
              {t.nombre}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() =>
          agregar({
            slug: producto.slug,
            nombre: producto.nombre,
            colorId: color.id,
            colorNombre: color.nombre,
            tamanoId: tamano.id,
            tamanoNombre: tamano.nombre,
            precioCop: tamano.precioCop,
            foto: producto.fotos[0],
          })
        }
        className="mt-8 w-full rounded-sm bg-cobre px-8 py-4 text-xs uppercase tracking-[0.18em] text-blanco transition-colors hover:bg-cobre-hondo"
      >
        Agregar al carrito — {formatCop(tamano.precioCop)}
      </button>
    </div>
  );
}
