import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { direccionValidator, lineaPedidoV } from "./schema";
import { ENVIO_COP } from "../lib/productos";
import {
  addOnsPorUnidad,
  nombreFuente,
  PERSONALIZACION_COLOR_COP,
  PERSONALIZACION_INICIALES_COP,
  validarPersonalizacion,
  type Personalizacion,
} from "../lib/personalizacion";

// --- Tipos de entrada compartidos ---
const clienteArg = v.object({
  nombre: v.string(),
  email: v.string(),
  whatsapp: v.optional(v.string()),
});

/** Lo que manda el navegador: qué variante, cuántas y (opcional) qué
 *  personalización quiere. Nada más. El nombre y el precio los pone el
 *  servidor. La personalización se re-valida — el cliente no puede
 *  bajarse el costo del add-on desde devtools. */
const itemsArg = v.array(
  v.object({
    slug: v.string(),
    colorId: v.string(),
    tamanoId: v.string(),
    cantidad: v.number(),
    personalizacion: v.optional(
      v.object({
        iniciales: v.optional(
          v.object({ texto: v.string(), fuenteId: v.string() }),
        ),
        colorPersonalizado: v.optional(v.object({ descripcion: v.string() })),
      }),
    ),
  }),
);

/** Marca un error como mostrable al cliente. Lo que NO lleva esta marca
 *  (configuración ausente, caídas de Mercado Pago) se le esconde: no puede
 *  hacer nada al respecto y solo expone detalles internos de la tienda. */
const AVISO = "[aviso] ";
function avisoCliente(mensaje: string): Error {
  return new Error(AVISO + mensaje);
}

// === Acción pública: inicia el checkout ===
// La llama el formulario de /checkout (a través de un server action de Next).
// Calcula los precios desde el catálogo de Convex —NUNCA confía en lo que
// mande el cliente—, crea el pedido como "pendiente" y le pide a Mercado Pago
// un link de pago (Checkout Pro). Devuelve la URL a la que hay que redirigir.
export const createCheckout = action({
  args: {
    cliente: clienteArg,
    items: itemsArg,
    direccion: direccionValidator,
    codigo: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ initPoint: string; pedidoId: Id<"pedidos"> }> => {
    if (args.items.length === 0) throw avisoCliente("Tu carrito está vacío.");

    // La configuración se comprueba ANTES de tocar la base: si falta el token,
    // no tiene sentido dejar un pedido creado que nunca podrá pagarse.
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) throw new Error("Falta MP_ACCESS_TOKEN en las variables de Convex");

    // 1. Precios y nombres desde el catálogo (fuente de verdad). Si alguien
    //    manipula el carrito en el navegador, aquí se descarta. La
    //    personalización se sanea y valida contra las reglas del server
    //    (regex, fuente ∈ lista, longitud del color). El precio unitario
    //    guardado en la línea es la BASE — los add-ons se derivan de
    //    `personalizacion` cuando hace falta computar totales.
    const catalogo = await ctx.runQuery(api.productos.catalogo, {});
    const lineas = args.items.map((it) => {
      const p = catalogo.find((x) => x.slug === it.slug);
      if (!p) throw avisoCliente("Uno de los bolsos de tu carrito ya no está disponible.");

      const color = p.colores.find((c) => c.id === it.colorId);
      if (!color) {
        throw avisoCliente(`Ese acabado ya no está disponible para ${p.nombre}.`);
      }

      const tamano = p.tamanos.find((t) => t.id === it.tamanoId);
      if (!tamano) {
        throw avisoCliente(`Ese tamaño ya no está disponible para ${p.nombre}.`);
      }

      let personalizacion: Personalizacion | undefined;
      if (it.personalizacion) {
        try {
          personalizacion = validarPersonalizacion(it.personalizacion);
          if (!personalizacion.iniciales && !personalizacion.colorPersonalizado) {
            personalizacion = undefined; // toggles vacíos: no persistir
          }
        } catch (e) {
          throw avisoCliente(
            e instanceof Error ? e.message : "Revisa la personalización del bolso.",
          );
        }
      }

      return {
        slug: p.slug,
        nombre: p.nombre,
        colorId: color.id,
        colorNombre: color.nombre,
        tamanoId: tamano.id,
        tamanoNombre: tamano.nombre,
        cantidad: Math.max(1, Math.floor(it.cantidad)),
        precioCop: tamano.precioCop,
        ...(personalizacion ? { personalizacion } : {}),
      };
    });

    const subtotal = lineas.reduce(
      (s, l) => s + (l.precioCop + addOnsPorUnidad(l.personalizacion)) * l.cantidad,
      0,
    );
    const envioCop = ENVIO_COP;

    // Cupón: se re-valida en el servidor. El precio final NUNCA lo decide el
    // navegador; si el código ya no vale, se avisa y no se cobra nada.
    let descuentoCop = 0;
    let cupon: string | undefined;
    if (args.codigo?.trim()) {
      const r = await ctx.runQuery(internal.cupones.evaluarCupon, {
        codigo: args.codigo,
        subtotalCop: subtotal,
        envioCop,
      });
      if (!r.ok) throw avisoCliente(r.mensaje);
      descuentoCop = r.descuentoCop;
      cupon = r.codigo;
    }
    const totalCop = Math.max(0, subtotal + envioCop - descuentoCop);

    // 2. Pedido "pendiente". Existe antes de cobrar, para que ningún pago
    //    quede sin pedido al que engancharse.
    const pedidoId: Id<"pedidos"> = await ctx.runMutation(
      internal.orders.crearPedidoPendiente,
      {
        cliente: args.cliente,
        items: lineas,
        envioCop,
        descuentoCop: descuentoCop || undefined,
        cupon,
        totalCop,
        direccion: args.direccion,
      },
    );

    // 3. Preferencia de pago en Mercado Pago.
    const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
    // El webhook vive en este mismo despliegue de Convex: tiene URL pública, así
    // que Mercado Pago lo alcanza incluso mientras desarrollamos en local.
    const notificationUrl = `${process.env.CONVEX_SITE_URL}/mp/webhook`;

    // Mercado Pago no admite líneas negativas: con descuento mandamos un único
    // ítem con el total ya rebajado (MP cobra la suma de los ítems). Sin
    // descuento, mandamos el detalle real que es lo que el cliente espera
    // ver — incluyendo add-ons de personalización como líneas separadas para
    // que el desglose del extracto sea transparente.
    const mpItems =
      descuentoCop > 0
        ? [
            {
              title: `Pedido La Marquessa${cupon ? ` (cupón ${cupon})` : ""}`,
              quantity: 1,
              unit_price: totalCop,
              currency_id: "COP",
            },
          ]
        : [
            ...lineas.flatMap((l) => {
              const lineasMp = [
                {
                  title: `Bolso ${l.nombre} · ${l.colorNombre}`,
                  quantity: l.cantidad,
                  unit_price: l.precioCop,
                  currency_id: "COP",
                },
              ];
              if (l.personalizacion?.iniciales) {
                lineasMp.push({
                  title: `Iniciales grabadas (${l.personalizacion.iniciales.texto}, ${nombreFuente(l.personalizacion.iniciales.fuenteId)}) — ${l.nombre}`,
                  quantity: l.cantidad,
                  unit_price: PERSONALIZACION_INICIALES_COP,
                  currency_id: "COP",
                });
              }
              if (l.personalizacion?.colorPersonalizado) {
                lineasMp.push({
                  title: `Color a disposición — ${l.nombre}`,
                  quantity: l.cantidad,
                  unit_price: PERSONALIZACION_COLOR_COP,
                  currency_id: "COP",
                });
              }
              return lineasMp;
            }),
            { title: "Envío", quantity: 1, unit_price: envioCop, currency_id: "COP" },
          ];

    const body: Record<string, unknown> = {
      items: mpItems,
      external_reference: pedidoId,
      payer: { name: args.cliente.nombre, email: args.cliente.email },
      notification_url: notificationUrl,
      back_urls: {
        success: `${siteUrl}/gracias`,
        pending: `${siteUrl}/gracias`,
        failure: `${siteUrl}/pago-fallido`,
      },
      // Lo que el cliente verá en el extracto de su tarjeta. Si no coincide con
      // la marca, la gente desconoce el cobro y llegan contracargos.
      statement_descriptor: "LAMARQUESSA",
      metadata: { pedidoId },
    };
    // auto_return no admite localhost; solo se activa en producción.
    if (!siteUrl.includes("localhost")) body.auto_return = "approved";

    // Si Mercado Pago no responde bien, el pedido que acabamos de crear no
    // llegó a mostrarse a nadie: se anula para no dejar pendientes fantasma
    // ensuciando el panel. El cliente no vio ninguna pasarela, así que no hay
    // nada cobrado que conciliar.
    let data: { id: string; init_point: string };
    try {
      const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const detalle = await res.text();
        throw new Error(
          `Mercado Pago rechazó la preferencia: ${res.status} ${detalle}`,
        );
      }
      data = (await res.json()) as { id: string; init_point: string };
    } catch (e) {
      await ctx.runMutation(internal.orders.anularPedidoSinPago, { pedidoId });
      throw e;
    }

    // 4. Se guarda la referencia para poder cruzar pago ↔ pedido desde el panel.
    await ctx.runMutation(internal.orders.guardarPreferencia, {
      pedidoId,
      mpPreferenceId: data.id,
    });

    return { initPoint: data.init_point, pedidoId };
  },
});

// === Mutaciones internas (solo las llama el servidor) ===
export const crearPedidoPendiente = internalMutation({
  args: {
    cliente: clienteArg,
    items: v.array(lineaPedidoV),
    envioCop: v.number(),
    descuentoCop: v.optional(v.number()),
    cupon: v.optional(v.string()),
    totalCop: v.number(),
    direccion: direccionValidator,
  },
  handler: async (ctx, args) => {
    // Se reutiliza el cliente si ya compró antes (mismo correo).
    const existente = await ctx.db
      .query("clientes")
      .withIndex("by_email", (q) => q.eq("email", args.cliente.email))
      .unique();
    const clienteId = existente
      ? existente._id
      : await ctx.db.insert("clientes", args.cliente);

    return await ctx.db.insert("pedidos", {
      clienteId,
      items: args.items,
      envioCop: args.envioCop,
      descuentoCop: args.descuentoCop,
      cupon: args.cupon,
      totalCop: args.totalCop,
      direccion: args.direccion,
      estado: "pendiente",
      canal: "web",
      metodoPago: "mercadopago",
    });
  },
});

/** Anula un pedido que nunca llegó a la pasarela (falló la creación del pago).
 *  No se borra: queda el rastro, pero fuera de la cola de trabajo del panel.
 *  Solo actúa sobre pendientes, para no tocar por error algo ya pagado. */
export const anularPedidoSinPago = internalMutation({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, { pedidoId }) => {
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido || pedido.estado !== "pendiente") return;
    await ctx.db.patch(pedidoId, { estado: "cancelado" });
  },
});

export const guardarPreferencia = internalMutation({
  args: { pedidoId: v.id("pedidos"), mpPreferenceId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pedidoId, { mpPreferenceId: args.mpPreferenceId });
  },
});

export const marcarPagado = internalMutation({
  args: { pedidoId: v.id("pedidos"), mpPaymentId: v.string() },
  handler: async (ctx, args) => {
    const pedido = await ctx.db.get(args.pedidoId);
    if (!pedido) return;
    // Solo pasan a "pagado" los pedidos que estaban "pendiente". Esta guarda
    // cubre dos escenarios:
    //  - Reintento del mismo webhook: MP reintenta y sin esto contaríamos el
    //    cupón de más y el cliente recibiría el correo dos veces.
    //  - Pago llegado tarde a un pedido ya cancelado o enviado: nos protege de
    //    revivir un pedido sin dejar rastro de su estado anterior. Si eso
    //    ocurre, hay que verlo en el panel y reconciliar a mano.
    if (pedido.estado !== "pendiente") return;

    await ctx.db.patch(args.pedidoId, {
      estado: "pagado",
      mpPaymentId: args.mpPaymentId,
      pagadoEn: Date.now(),
    });

    // Solo en la transición real a "pagado".
    if (pedido.cupon) {
      await ctx.scheduler.runAfter(0, internal.cupones.incrementarUso, {
        codigo: pedido.cupon,
      });
    }
    await ctx.scheduler.runAfter(
      0,
      internal.correoCliente.enviarConfirmacionCliente,
      { pedidoId: args.pedidoId },
    );
  },
});

// Detalle de un pedido + su cliente. Lo usan los correos (confirmación de compra
// y "va en camino").
export const detallePedido = internalQuery({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, { pedidoId }) => {
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) return null;
    const cliente = await ctx.db.get(pedido.clienteId);
    return { pedido, cliente };
  },
});

/** Estado de un pedido para la página de gracias: lo mínimo, sin datos
 *  personales, porque el id viaja en la URL a la vuelta de Mercado Pago. */
export const estadoPedido = internalQuery({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, { pedidoId }) => {
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) return null;
    return { estado: pedido.estado, totalCop: pedido.totalCop };
  },
});
