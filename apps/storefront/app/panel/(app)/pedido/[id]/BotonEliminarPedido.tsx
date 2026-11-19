"use client";

import { useState } from "react";
import { eliminarPedidoAction } from "@/app/panel/actions";
import { ESTADOS, type EstadoPedido } from "@/app/panel/lib/ui";

// Estados que el reporte de Finanzas suma como venta efectiva. Tiene que
// coincidir con ESTADOS_VENTA de convex/cuentas.ts: si allá cambia, aquí
// también, porque es lo que decide si el aviso habla de plata o no.
const CUENTAN_COMO_VENTA: readonly EstadoPedido[] = [
  "pagado",
  "enviado",
  "entregado",
];

/**
 * Borra el pedido de la base, con confirmación en dos pasos.
 *
 * Quién puede verlo sobre un pedido NO cancelado lo decide la página, y quién
 * puede ejecutarlo lo decide el servidor (`puedeBorrarPedidos`). Este
 * componente no es un guardarraíl: es el aviso.
 *
 * Y el aviso cambia con el estado a propósito. Borrar un cancelado no cuesta
 * nada; borrar un pagado, un enviado o un entregado le quita esa venta al
 * reporte de Finanzas para siempre, y eso hay que decirlo con el número
 * delante, no con un "¿estás seguro?" genérico que ya nadie lee.
 */
export function BotonEliminarPedido({
  pedidoId,
  estado,
}: {
  pedidoId: string;
  estado: EstadoPedido;
}) {
  const [confirmando, setConfirmando] = useState(false);

  const eraVenta = CUENTAN_COMO_VENTA.includes(estado);
  const etiqueta = ESTADOS[estado].label.toLowerCase();

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
    <div className="mt-3 flex flex-col gap-2 rounded-sm border border-red-300 bg-red-50 p-4 text-sm">
      <p className="font-medium text-red-800">
        Esto borra el pedido para siempre. No hay papelera.
      </p>

      {eraVenta && (
        <p className="text-red-800">
          Está <strong>{etiqueta}</strong>, así que hoy cuenta como venta:
          Finanzas <strong>dejará de sumarlo</strong> y los ingresos de ese mes
          van a bajar. Si lo que quieres es anularlo sin perder el registro,
          vuelve y <strong>cancélalo</strong>.
        </p>
      )}

      <div className="mt-1 flex w-full items-center gap-2">
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
