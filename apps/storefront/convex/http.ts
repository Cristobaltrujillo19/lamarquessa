import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

// Webhook de Mercado Pago. MP lo llama de servidor a servidor cuando cambia un
// pago. NO se confía en lo que llega en el cuerpo: con el id se vuelve a
// consultar a MP —con nuestro token— cuál es el estado real, y solo entonces se
// marca el pedido como pagado. Así, aunque alguien descubra esta URL y mande un
// aviso falso, no puede regalarse un pedido.
http.route({
  path: "/mp/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const tipo = url.searchParams.get("type") ?? url.searchParams.get("topic");

    // El id del pago llega en la query (?data.id=) o en el cuerpo, según el
    // tipo de notificación que MP tenga configurada.
    let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
    if (!paymentId) {
      try {
        const body = (await request.json()) as { data?: { id?: string } };
        paymentId = body?.data?.id ?? null;
      } catch {
        // cuerpo vacío o no-JSON: se ignora
      }
    }

    // Solo interesan las notificaciones de pago.
    if (tipo && tipo !== "payment") return new Response("ignored", { status: 200 });
    if (!paymentId) return new Response("missing id", { status: 200 });

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return new Response("no token", { status: 500 });

    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return new Response("payment lookup failed", { status: 200 });

    const pago = (await res.json()) as {
      status?: string;
      external_reference?: string;
    };

    if (pago.status === "approved" && pago.external_reference) {
      await ctx.runMutation(internal.orders.marcarPagado, {
        pedidoId: pago.external_reference as Id<"pedidos">,
        mpPaymentId: String(paymentId),
      });
    }

    // Siempre 200: si se devuelve un error, Mercado Pago reintenta en bucle.
    return new Response("ok", { status: 200 });
  }),
});

export default http;
