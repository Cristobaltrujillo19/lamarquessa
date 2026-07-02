import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { formatCop } from "../lib/productos";

function exigirSecreto(secret: string) {
  const esperado = process.env.ADMIN_API_SECRET;
  if (!esperado || secret !== esperado) throw new Error("No autorizado");
}

const tipoV = v.union(
  v.literal("porcentaje"),
  v.literal("fijo"),
  v.literal("envio_gratis"),
);

// Cuánto descuenta un cupón dado un subtotal (bolsos) y el envío.
function calcularDescuentoCop(
  cupon: Pick<Doc<"cupones">, "tipo" | "valor">,
  subtotalCop: number,
  envioCop: number,
): number {
  if (cupon.tipo === "porcentaje") {
    return Math.min(subtotalCop, Math.round((subtotalCop * cupon.valor) / 100));
  }
  if (cupon.tipo === "fijo") {
    return Math.min(subtotalCop, Math.round(cupon.valor));
  }
  // envio_gratis: descuenta el costo del envío.
  return envioCop;
}

// Motivo por el que un cupón NO aplica, o null si está OK. Fuente única de
// verdad para la validación (la usan el checkout público y el server al pagar).
function motivoInvalido(
  cupon: Doc<"cupones"> | null,
  subtotalCop: number,
  ahora: number,
): string | null {
  if (!cupon) return "Ese código no existe.";
  if (!cupon.activo) return "Ese código ya no está disponible.";
  if (cupon.expiraEn !== undefined && ahora > cupon.expiraEn) {
    return "Ese código ya venció.";
  }
  if (cupon.usosMax !== undefined && cupon.usados >= cupon.usosMax) {
    return "Ese código ya alcanzó su límite de usos.";
  }
  if (cupon.minCompraCop !== undefined && subtotalCop < cupon.minCompraCop) {
    return `Aplica en compras desde ${formatCop(cupon.minCompraCop)}.`;
  }
  return null;
}

// === Validación pública (la llama el checkout para mostrar el descuento) ===
export const validarCupon = query({
  args: { codigo: v.string(), subtotalCop: v.number(), envioCop: v.number() },
  handler: async (ctx, { codigo, subtotalCop, envioCop }) => {
    const cod = codigo.trim().toUpperCase();
    const cupon = cod
      ? await ctx.db
          .query("cupones")
          .withIndex("by_codigo", (q) => q.eq("codigo", cod))
          .unique()
      : null;
    const motivo = motivoInvalido(cupon, subtotalCop, Date.now());
    if (motivo || !cupon) {
      return { valido: false as const, mensaje: motivo ?? "Código inválido." };
    }
    return {
      valido: true as const,
      codigo: cupon.codigo,
      tipo: cupon.tipo,
      descuentoCop: calcularDescuentoCop(cupon, subtotalCop, envioCop),
    };
  },
});

// === Re-validación interna (la usará createCheckout antes de crear el pago) ===
export const evaluarCupon = internalQuery({
  args: { codigo: v.string(), subtotalCop: v.number(), envioCop: v.number() },
  handler: async (ctx, { codigo, subtotalCop, envioCop }) => {
    const cod = codigo.trim().toUpperCase();
    const cupon = cod
      ? await ctx.db
          .query("cupones")
          .withIndex("by_codigo", (q) => q.eq("codigo", cod))
          .unique()
      : null;
    const motivo = motivoInvalido(cupon, subtotalCop, Date.now());
    if (motivo || !cupon) {
      return { ok: false as const, mensaje: motivo ?? "Código inválido." };
    }
    return {
      ok: true as const,
      codigo: cupon.codigo,
      descuentoCop: calcularDescuentoCop(cupon, subtotalCop, envioCop),
    };
  },
});

// +1 al contador de usos. Lo llama el webhook cuando el pedido se paga.
export const incrementarUso = internalMutation({
  args: { codigo: v.string() },
  handler: async (ctx, { codigo }) => {
    const cupon = await ctx.db
      .query("cupones")
      .withIndex("by_codigo", (q) => q.eq("codigo", codigo.trim().toUpperCase()))
      .unique();
    if (cupon) await ctx.db.patch(cupon._id, { usados: cupon.usados + 1 });
  },
});

// === Gestión desde el panel (protegida por secreto) ===
export const crearCupon = mutation({
  args: {
    secret: v.string(),
    codigo: v.string(),
    tipo: tipoV,
    valor: v.number(),
    expiraEn: v.optional(v.number()),
    usosMax: v.optional(v.number()),
    minCompraCop: v.optional(v.number()),
  },
  handler: async (ctx, a) => {
    exigirSecreto(a.secret);
    const codigo = a.codigo.trim().toUpperCase();
    if (!codigo) throw new Error("El código es obligatorio");
    if (!/^[A-Z0-9]+$/.test(codigo)) {
      throw new Error("El código solo puede tener letras y números (sin espacios)");
    }
    const existe = await ctx.db
      .query("cupones")
      .withIndex("by_codigo", (q) => q.eq("codigo", codigo))
      .unique();
    if (existe) throw new Error("Ya existe un cupón con ese código");

    if (a.tipo === "porcentaje" && (a.valor <= 0 || a.valor > 100)) {
      throw new Error("El porcentaje debe estar entre 1 y 100");
    }
    if (a.tipo === "fijo" && a.valor <= 0) {
      throw new Error("El valor del descuento debe ser mayor a 0");
    }

    await ctx.db.insert("cupones", {
      codigo,
      tipo: a.tipo,
      valor: a.tipo === "envio_gratis" ? 0 : Math.round(a.valor),
      activo: true,
      expiraEn: a.expiraEn,
      usosMax: a.usosMax,
      usados: 0,
      minCompraCop: a.minCompraCop,
    });
  },
});

export const listarCupones = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);
    return await ctx.db.query("cupones").order("desc").collect();
  },
});

export const setCuponActivo = mutation({
  args: { secret: v.string(), cuponId: v.id("cupones"), activo: v.boolean() },
  handler: async (ctx, { secret, cuponId, activo }) => {
    exigirSecreto(secret);
    await ctx.db.patch(cuponId, { activo });
  },
});

export const eliminarCupon = mutation({
  args: { secret: v.string(), cuponId: v.id("cupones") },
  handler: async (ctx, { secret, cuponId }) => {
    exigirSecreto(secret);
    await ctx.db.delete(cuponId);
  },
});
