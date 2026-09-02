import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { direccionValidator } from "./schema";
import { ENVIO_COP } from "../lib/productos";

// === Funciones del panel (despacho + POS + inventario + equipo) ===
//
// Son PÚBLICAS a nivel de Convex, así que las protegemos con un secreto
// compartido (ADMIN_API_SECRET). El navegador NUNCA ve el secreto: solo el
// servidor de Next (tras validar la sesión) llama a estas funciones.

function exigirSecreto(secret: string) {
  const esperado = process.env.ADMIN_API_SECRET;
  if (!esperado || secret !== esperado) throw new Error("No autorizado");
}

// Una variante concreta (color × tamaño) con su cantidad, para mover stock.
type VarianteQty = {
  slug: string;
  colorId: string;
  tamanoId: string;
  cantidad: number;
};

// Suma `delta` al stock de una variante en la bodega central. Crea la fila si
// no existe (inventario de una sola burbuja: no hay ferias).
async function ajustarStock(
  ctx: MutationCtx,
  slug: string,
  colorId: string,
  tamanoId: string,
  delta: number,
) {
  if (delta === 0) return;
  const row = await ctx.db
    .query("inventario")
    .withIndex("by_variante", (q) =>
      q.eq("slug", slug).eq("colorId", colorId).eq("tamanoId", tamanoId),
    )
    .unique();
  if (row) await ctx.db.patch(row._id, { cantidad: row.cantidad + delta });
  else await ctx.db.insert("inventario", { slug, colorId, tamanoId, cantidad: delta });
}

// Descuenta de la bodega las unidades de un pedido (una variante por línea).
async function descontarInventario(ctx: MutationCtx, items: VarianteQty[]) {
  for (const it of items) {
    await ajustarStock(ctx, it.slug, it.colorId, it.tamanoId, -it.cantidad);
  }
}

// === Pedidos / despacho ===
export const listarPedidos = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);
    const pedidos = await ctx.db.query("pedidos").order("desc").collect();
    return await Promise.all(
      pedidos.map(async (p) => ({
        ...p,
        cliente: await ctx.db.get(p.clienteId),
      })),
    );
  },
});

export const detallePedido = query({
  args: { secret: v.string(), pedidoId: v.id("pedidos") },
  handler: async (ctx, { secret, pedidoId }) => {
    exigirSecreto(secret);
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) return null;
    const [cliente, vendedor] = await Promise.all([
      ctx.db.get(pedido.clienteId),
      pedido.vendedorId ? ctx.db.get(pedido.vendedorId) : null,
    ]);
    return { ...pedido, cliente, vendedorNombre: vendedor?.nombre ?? null };
  },
});

export const marcarEnviado = mutation({
  args: {
    secret: v.string(),
    pedidoId: v.id("pedidos"),
    transportadora: v.optional(v.string()),
    guia: v.optional(v.string()),
    urlRastreo: v.optional(v.string()),
  },
  handler: async (ctx, { secret, pedidoId, transportadora, guia, urlRastreo }) => {
    exigirSecreto(secret);
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) throw new Error("El pedido no existe");
    await ctx.db.patch(pedidoId, {
      estado: "enviado",
      enviadoEn: Date.now(),
      transportadora: transportadora?.trim() || undefined,
      guia: guia?.trim() || undefined,
      urlRastreo: urlRastreo?.trim() || undefined,
    });
    // Los envíos salen de la bodega central → baja de ahí (por variante).
    await descontarInventario(ctx, pedido.items);
    await ctx.scheduler.runAfter(0, internal.correoEnvio.enviarVaEnCamino, {
      pedidoId,
    });
  },
});

export const marcarEntregado = mutation({
  args: { secret: v.string(), pedidoId: v.id("pedidos") },
  handler: async (ctx, { secret, pedidoId }) => {
    exigirSecreto(secret);
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) throw new Error("El pedido no existe");
    await ctx.db.patch(pedidoId, { estado: "entregado" });
  },
});

export const cancelarPedido = mutation({
  args: { secret: v.string(), pedidoId: v.id("pedidos") },
  handler: async (ctx, { secret, pedidoId }) => {
    exigirSecreto(secret);
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) throw new Error("El pedido no existe");
    await ctx.db.patch(pedidoId, { estado: "cancelado" });
  },
});

/** Borra permanentemente un pedido. Solo permite eliminar los que estén en
 *  estado "cancelado": para borrar un pagado/enviado/entregado hay que
 *  cancelarlo antes (dos pasos deliberados, para no perder registro contable
 *  por accidente). El pedido desaparece de la base — no hay "papelera". */
export const eliminarPedido = mutation({
  args: { secret: v.string(), pedidoId: v.id("pedidos") },
  handler: async (ctx, { secret, pedidoId }) => {
    exigirSecreto(secret);
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) throw new Error("El pedido no existe");
    if (pedido.estado !== "cancelado") {
      throw new Error(
        "Solo se pueden eliminar pedidos cancelados. Cancela primero.",
      );
    }
    await ctx.db.delete(pedidoId);
  },
});

/** Limpieza masiva: borra TODOS los pedidos en estado "cancelado" de una.
 *  Devuelve cuántos se eliminaron para poder confirmar en el UI. Recorre por
 *  el índice by_estado, así que no lee toda la tabla. */
export const eliminarCanceladosMasivo = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);
    const cancelados = await ctx.db
      .query("pedidos")
      .withIndex("by_estado", (q) => q.eq("estado", "cancelado"))
      .collect();
    for (const p of cancelados) {
      await ctx.db.delete(p._id);
    }
    return { eliminados: cancelados.length };
  },
});

// === POS: venta presencial ===
// Los precios y nombres salen del catálogo en Convex (fuente de verdad), nunca
// de lo que mande el navegador. Cada línea es una variante concreta.
export const crearVentaPresencial = mutation({
  args: {
    secret: v.string(),
    items: v.array(
      v.object({
        slug: v.string(),
        colorId: v.string(),
        tamanoId: v.string(),
        cantidad: v.number(),
      }),
    ),
    metodoPago: v.union(
      v.literal("efectivo"),
      v.literal("transferencia"),
      v.literal("tarjeta_mp"),
      v.literal("qr_bancolombia"),
    ),
    entrega: v.union(v.literal("en_mano"), v.literal("envio")),
    vendedorId: v.optional(v.id("usuarios")),
    cliente: v.optional(
      v.object({
        nombre: v.optional(v.string()),
        email: v.optional(v.string()),
        whatsapp: v.optional(v.string()),
      }),
    ),
    direccion: v.optional(direccionValidator),
    descuento: v.optional(
      v.object({
        tipo: v.union(v.literal("porcentaje"), v.literal("valor")),
        monto: v.number(),
      }),
    ),
    enviarCorreo: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    exigirSecreto(args.secret);

    // Arma cada línea desde el catálogo: valida bolso, color y tamaño.
    const lineas = [];
    for (const it of args.items) {
      if (it.cantidad <= 0) continue;
      const prod = await ctx.db
        .query("productos")
        .withIndex("by_slug", (q) => q.eq("slug", it.slug))
        .unique();
      if (!prod) throw new Error(`Bolso desconocido: ${it.slug}`);
      const color = prod.colores.find((c) => c.id === it.colorId);
      const tam = prod.tamanos.find((t) => t.id === it.tamanoId);
      if (!color) throw new Error(`Color inválido para ${prod.nombre}`);
      if (!tam) throw new Error(`Tamaño inválido para ${prod.nombre}`);
      lineas.push({
        slug: prod.slug,
        nombre: prod.nombre,
        colorId: color.id,
        colorNombre: color.nombre,
        tamanoId: tam.id,
        tamanoNombre: tam.nombre,
        cantidad: Math.max(1, Math.floor(it.cantidad)),
        precioCop: tam.precioCop,
      });
    }
    if (lineas.length === 0) throw new Error("Agrega al menos un bolso");

    if (args.entrega === "envio" && !args.direccion) {
      throw new Error("Una venta con envío necesita dirección");
    }

    const subtotal = lineas.reduce((s, l) => s + l.precioCop * l.cantidad, 0);
    const envioCop = args.entrega === "envio" ? ENVIO_COP : 0;

    let descuentoCop = 0;
    if (args.descuento && args.descuento.monto > 0) {
      if (args.descuento.tipo === "porcentaje") {
        const pct = Math.min(100, Math.max(0, args.descuento.monto));
        descuentoCop = Math.round((subtotal * pct) / 100);
      } else {
        descuentoCop = Math.min(subtotal, Math.max(0, Math.floor(args.descuento.monto)));
      }
    }
    const totalCop = Math.max(0, subtotal - descuentoCop) + envioCop;

    const nombre = args.cliente?.nombre?.trim() || "Venta presencial";
    const email = args.cliente?.email?.trim() || undefined;
    const whatsapp = args.cliente?.whatsapp?.trim() || undefined;
    let clienteId;
    if (email) {
      const existente = await ctx.db
        .query("clientes")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
      clienteId = existente
        ? existente._id
        : await ctx.db.insert("clientes", { nombre, email, whatsapp });
    } else {
      clienteId = await ctx.db.insert("clientes", { nombre, whatsapp });
    }

    const pedidoId = await ctx.db.insert("pedidos", {
      clienteId,
      items: lineas,
      envioCop,
      descuentoCop: descuentoCop || undefined,
      totalCop,
      direccion: args.entrega === "envio" ? args.direccion : undefined,
      estado: args.entrega === "envio" ? "pagado" : "entregado",
      canal: "presencial",
      metodoPago: args.metodoPago,
      vendedorId: args.vendedorId,
      pagadoEn: Date.now(),
    });

    // En mano: el bolso se entrega ya → baja del stock. Con envío: baja después,
    // al marcar "enviado" (sale de la bodega).
    if (args.entrega === "en_mano") {
      await descontarInventario(ctx, lineas);
    }

    if (args.enviarCorreo && email) {
      await ctx.scheduler.runAfter(
        0,
        internal.correoCliente.enviarConfirmacionCliente,
        { pedidoId },
      );
    }

    return pedidoId;
  },
});

// === Inventario (bodega central, por variante) ===
export const listarInventario = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);
    return await ctx.db.query("inventario").collect();
  },
});

// Suma/resta unidades de una variante (agregar producción o corregir stock).
export const ajustarInventario = mutation({
  args: {
    secret: v.string(),
    slug: v.string(),
    colorId: v.string(),
    tamanoId: v.string(),
    delta: v.number(),
  },
  handler: async (ctx, { secret, slug, colorId, tamanoId, delta }) => {
    exigirSecreto(secret);
    // Valida que el bolso y la variante existan en el catálogo.
    const prod = await ctx.db
      .query("productos")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!prod) throw new Error("Ese bolso no existe");
    if (!prod.colores.some((c) => c.id === colorId)) {
      throw new Error("Ese color no existe en el bolso");
    }
    if (!prod.tamanos.some((t) => t.id === tamanoId)) {
      throw new Error("Ese tamaño no existe en el bolso");
    }
    await ajustarStock(ctx, slug, colorId, tamanoId, Math.trunc(delta));
  },
});

// === Usuarios / equipo ===
export const crearUsuario = mutation({
  args: {
    secret: v.string(),
    usuario: v.string(),
    nombre: v.string(),
    hash: v.string(),
    salt: v.string(),
  },
  handler: async (ctx, { secret, usuario, nombre, hash, salt }) => {
    exigirSecreto(secret);
    const u = usuario.trim().toLowerCase();
    if (!u || !nombre.trim()) throw new Error("Usuario y nombre son obligatorios");
    const existente = await ctx.db
      .query("usuarios")
      .withIndex("by_usuario", (q) => q.eq("usuario", u))
      .unique();
    if (existente) throw new Error("Ese usuario ya existe");
    return await ctx.db.insert("usuarios", {
      usuario: u,
      nombre: nombre.trim(),
      hash,
      salt,
      activo: true,
    });
  },
});

// Lista para la pantalla de equipo (sin exponer hash/salt).
export const listarUsuarios = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);
    const us = await ctx.db.query("usuarios").collect();
    return us.map((u) => ({
      _id: u._id,
      usuario: u.usuario,
      nombre: u.nombre,
      activo: u.activo,
      puedeVerCuentas: u.puedeVerCuentas ?? false,
    }));
  },
});

// Para el login: devuelve hash/salt para que Next verifique la contraseña.
export const usuarioPorNombre = query({
  args: { secret: v.string(), usuario: v.string() },
  handler: async (ctx, { secret, usuario }) => {
    exigirSecreto(secret);
    return await ctx.db
      .query("usuarios")
      .withIndex("by_usuario", (q) => q.eq("usuario", usuario.trim().toLowerCase()))
      .unique();
  },
});

export const setUsuarioActivo = mutation({
  args: { secret: v.string(), usuarioId: v.id("usuarios"), activo: v.boolean() },
  handler: async (ctx, { secret, usuarioId, activo }) => {
    exigirSecreto(secret);
    await ctx.db.patch(usuarioId, { activo });
  },
});

// Permiso para ver Finanzas. El master (Administración) siempre puede.
export const setPermisoCuentas = mutation({
  args: { secret: v.string(), usuarioId: v.id("usuarios"), puede: v.boolean() },
  handler: async (ctx, { secret, usuarioId, puede }) => {
    exigirSecreto(secret);
    await ctx.db.patch(usuarioId, { puedeVerCuentas: puede });
  },
});

// Un usuario por id (sin hash/salt). El panel lo usa para saber si puede ver
// Finanzas.
export const usuarioPorId = query({
  args: { secret: v.string(), usuarioId: v.id("usuarios") },
  handler: async (ctx, { secret, usuarioId }) => {
    exigirSecreto(secret);
    const u = await ctx.db.get(usuarioId);
    if (!u) return null;
    return {
      _id: u._id,
      usuario: u.usuario,
      nombre: u.nombre,
      activo: u.activo,
      puedeVerCuentas: u.puedeVerCuentas ?? false,
    };
  },
});

// === Carritos (embudo, incluidos los abandonados) ===
//
// La tabla `carritos` guarda el tramo que el pedido no ve: añadir al carrito y
// empezar el checkout sin enviarlo. Aquí solo se LEE; quien escribe es la
// mutación pública `carritos:registrar` desde el navegador del visitante.
//
// El tope es a propósito. La purga de 90 días mantiene la tabla pequeña, pero
// una consulta sin límite se rompería sola el día que deje de serlo: mejor
// devolver los más recientes y AVISAR que se cortó, que mentir con un total.
const MAX_CARRITOS = 500;

export const listarCarritos = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);
    const filas = await ctx.db
      .query("carritos")
      .withIndex("by_actualizado")
      .order("desc")
      .take(MAX_CARRITOS);
    return { carritos: filas, truncado: filas.length === MAX_CARRITOS };
  },
});
