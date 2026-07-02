"use client";

import { useState } from "react";
import { cancelarPedidoAction } from "@/app/panel/actions";

// Cancelar con confirmación en dos pasos, para no cancelar el pedido equivocado.
export function BotonCancelarPedido({ pedidoId }: { pedidoId: string }) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="mt-3 h-10 w-full rounded-sm border border-cacao/25 text-sm font-medium text-cacao-suave transition-colors hover:border-[#c9a] hover:text-[#8a3b32]"
      >
        Cancelar pedido
      </button>
    );
  }

  return (
    <div className="mt-3 flex flex-col items-center gap-2 rounded-sm border border-[#f0d8d4] bg-[#f5e3e1] p-4 text-sm">
      <span className="font-medium text-[#8a3b32]">
        ¿Seguro que quieres cancelar este pedido?
      </span>
      <div className="flex w-full items-center gap-2">
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="h-10 flex-1 rounded-sm border border-cacao/25 font-medium text-cacao-suave hover:border-cobre"
        >
          No, volver
        </button>
        <form action={cancelarPedidoAction} className="flex-1">
          <input type="hidden" name="pedidoId" value={pedidoId} />
          <button
            type="submit"
            className="h-10 w-full rounded-sm bg-[#8a3b32] font-medium text-white hover:bg-[#73312a]"
          >
            Sí, cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
