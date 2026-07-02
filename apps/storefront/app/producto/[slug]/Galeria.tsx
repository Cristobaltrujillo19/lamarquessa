"use client";

import { useState } from "react";

export default function Galeria({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const [activa, setActiva] = useState(0);

  return (
    <div>
      <div className="aspect-[4/5] overflow-hidden rounded-sm bg-arena-clara">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotos[activa]} alt={nombre} className="h-full w-full object-cover" />
      </div>

      {fotos.length > 1 && (
        <div className="mt-3 flex gap-3">
          {fotos.map((f, i) => (
            <button
              key={f}
              onClick={() => setActiva(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`h-20 w-16 overflow-hidden rounded-sm border-2 transition-colors ${
                i === activa ? "border-cobre" : "border-transparent hover:border-cacao/20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
