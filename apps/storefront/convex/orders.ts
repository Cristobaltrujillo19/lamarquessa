import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

// Detalle de un pedido + su cliente. Lo usan los correos (confirmación de compra
// y "va en camino"). Cuando se conecte el checkout web con Mercado Pago, sus
// mutaciones (crearPedidoPendiente, marcarPagado, guardarPreferencia) viven aquí.
export const detallePedido = internalQuery({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, { pedidoId }) => {
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) return null;
    const cliente = await ctx.db.get(pedido.clienteId);
    return { pedido, cliente };
  },
});
