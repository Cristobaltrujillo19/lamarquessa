"use client";

import { useState } from "react";
import { eliminarCanceladosMasivoAction } from "@/app/panel/actions";

// Limpia de una todos los pedidos cancelados. Confirmación en dos pasos y
// texto explícito de irreversibilidad — el server nunca los borra en cascada
// por accidente. `cantidad` es informativo para el copy del confirm.
export function BotonLimpiarCancelados({ cantidad }: { cantidad: number }) {
  const [confirmando, setConfirmando] = useState(false);

  if (cantidad === 0) return null;

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="rounded-sm border border-red-700/40 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-50"
      >
        Eliminar {cantidad} cancelado{cantidad === 1 ? "" : "s"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-3 py-1.5 text-sm">
      <span className="font-medium text-red-800">
        Borrar {cantidad} pedido{cantidad === 1 ? "" : "s"} para siempre. ¿Continuar?
      </span>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        className="h-8 rounded-sm border border-cacao/25 px-3 font-medium text-cacao-suave hover:border-cobre"
      >
        No
      </button>
      <form action={eliminarCanceladosMasivoAction}>
        <button
          type="submit"
          className="h-8 rounded-sm bg-red-700 px-3 font-medium text-white hover:bg-red-800"
        >
          Sí, eliminar
        </button>
      </form>
    </div>
  );
}
