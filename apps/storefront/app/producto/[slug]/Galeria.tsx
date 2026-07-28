"use client";

import { useState } from "react";
import Foto, { altDeFoto } from "@/components/Foto";

export default function Galeria({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const [activa, setActiva] = useState(0);
  const total = fotos.length;

  if (total === 0) return null;

  const ir = (k: number) => setActiva(((k % total) + total) % total);

  const flecha =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-cacao/15 bg-blanco/85 text-xl leading-none text-cacao backdrop-blur-sm transition-colors hover:border-cobre-texto hover:text-cobre-texto";

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-arena-clara">
        <Foto
          src={fotos[activa]}
          alt={altDeFoto(fotos[activa], nombre)}
          ancho={1600}
          alto={1600}
          className="h-full w-full object-cover"
          prioridad
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => ir(activa - 1)}
              aria-label="Foto anterior"
              className={`${flecha} left-3`}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => ir(activa + 1)}
              aria-label="Foto siguiente"
              className={`${flecha} right-3`}
            >
              ›
            </button>
            <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-blanco/85 px-3 py-1 text-xs text-cacao-suave backdrop-blur-sm">
              {activa + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-3">
          {fotos.map((f, i) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiva(i)}
              aria-label={altDeFoto(f, nombre)}
              aria-current={i === activa}
              className={`h-20 w-16 overflow-hidden rounded-sm border-2 transition-colors ${
                i === activa ? "border-cobre-texto" : "border-transparent hover:border-cacao/20"
              }`}
            >
              <Foto
                src={f}
                alt=""
                ancho={160}
                alto={200}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
