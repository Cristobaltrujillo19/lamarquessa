"use client";

import { useState } from "react";
import { eliminarPedidoAction } from "@/app/panel/actions";

// Borra el pedido de la base con confirmación en dos pasos. Server-side ya
// bloquea si el estado no es "cancelado", pero el componente solo se debe
// renderizar cuando lo esté — el guardarraíl vive en la página que lo usa.
export function BotonEliminarPedido({ pedidoId }: { pedidoId: string }) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="mt-3 h-10 w-full rounded-sm border border-cacao/25 text-sm font-medium text-cacao-suave transition-colors hover:border-red-700/60 hover:text-red-800"
      >
        Eliminar pedido
      </button>
    );
  }

  return (
    <div className="mt-3 flex flex-col items-center gap-2 rounded-sm border border-red-300 bg-red-50 p-4 text-sm">
      <span className="font-medium text-red-800">
        Esto borra el pedido para siempre. ¿Continuar?
      </span>
      <div className="flex w-full items-center gap-2">
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="h-10 flex-1 rounded-sm border border-cacao/25 font-medium text-cacao-suave hover:border-cobre"
        >
          No, volver
        </button>
        <form action={eliminarPedidoAction} className="flex-1">
          <input type="hidden" name="pedidoId" value={pedidoId} />
          <button
            type="submit"
            className="h-10 w-full rounded-sm bg-red-700 font-medium text-white hover:bg-red-800"
          >
            Sí, eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
