import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Finanzas: ingresos y egresos del negocio. Las ventas (ingresos por bolsos) ya
// viven en `pedidos`; aquí se registran gastos e ingresos/egresos manuales.
// (La Marquessa no tiene suscripciones, así que no hay cobros automáticos.)
function exigirSecreto(secret: string) {
  const esperado = process.env.ADMIN_API_SECRET;
  if (!esperado || secret !== esperado) throw new Error("No autorizado");
}

const tipoV = v.union(v.literal("ingreso"), v.literal("egreso"));

// Estados de pedido que cuentan como venta efectiva (ingreso real).
const ESTADOS_VENTA: readonly string[] = ["pagado", "enviado", "entregado"];

// === Registrar un movimiento manual (ingreso o egreso) ===
export const crearMovimiento = mutation({
  args: {
    secret: v.string(),
    tipo: tipoV,
    categoria: v.string(),
    montoCop: v.number(),
    fecha: v.number(),
    nota: v.optional(v.string()),
    registradoPor: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    exigirSecreto(a.secret);
    if (!Number.isFinite(a.montoCop) || a.montoCop <= 0) {
      throw new Error("El monto debe ser mayor a 0");
    }
    if (!a.categoria.trim()) throw new Error("La categoría es obligatoria");
    await ctx.db.insert("movimientos", {
      tipo: a.tipo,
      categoria: a.categoria.trim(),
      montoCop: Math.round(a.montoCop),
      fecha: a.fecha,
      nota: a.nota?.trim() || undefined,
      registradoPor: a.registradoPor,
    });
  },
});

// === Borrar un movimiento manual ===
export const eliminarMovimiento = mutation({
  args: { secret: v.string(), movimientoId: v.id("movimientos") },
  handler: async (ctx, { secret, movimientoId }) => {
    exigirSecreto(secret);
    const m = await ctx.db.get(movimientoId);
    if (!m) return;
    await ctx.db.delete(movimientoId);
  },
});

// === Movimientos de un rango (para la lista del mes) ===
export const listarMovimientos = query({
  args: { secret: v.string(), desde: v.number(), hasta: v.number() },
  handler: async (ctx, { secret, desde, hasta }) => {
    exigirSecreto(secret);
    return await ctx.db
      .query("movimientos")
      .withIndex("by_fecha", (q) => q.gte("fecha", desde).lt("fecha", hasta))
      .order("desc")
      .collect();
  },
});

// === Reporte del periodo: ingresos, egresos, balance y desglose ===
export const reporteCuentas = query({
  args: { secret: v.string(), desde: v.number(), hasta: v.number() },
  handler: async (ctx, { secret, desde, hasta }) => {
    exigirSecreto(secret);

    // Ventas de la tabla `pedidos`: estados que cuentan como venta efectiva,
    // ubicadas por su fecha de pago (o de creación si es de POS / vieja).
    const pedidos = await ctx.db.query("pedidos").collect();
    let ventasCop = 0;
    let numVentas = 0;
    for (const p of pedidos) {
      if (!ESTADOS_VENTA.includes(p.estado)) continue;
      const fecha = p.pagadoEn ?? p._creationTime;
      if (fecha < desde || fecha >= hasta) continue;
      ventasCop += p.totalCop;
      numVentas++;
    }

    // Movimientos manuales del rango.
    const movs = await ctx.db
      .query("movimientos")
      .withIndex("by_fecha", (q) => q.gte("fecha", desde).lt("fecha", hasta))
      .collect();

    let ingresosManualesCop = 0;
    let egresosCop = 0;
    // Acumulamos en un Map: NO en un objeto, porque Convex prohíbe nombres de
    // campo con caracteres no-ASCII al serializar (p. ej. "Operación").
    const egresosMap = new Map<string, number>();
    for (const m of movs) {
      if (m.tipo === "ingreso") {
        ingresosManualesCop += m.montoCop;
      } else {
        egresosCop += m.montoCop;
        egresosMap.set(m.categoria, (egresosMap.get(m.categoria) ?? 0) + m.montoCop);
      }
    }
    const egresosPorCategoria = [...egresosMap.entries()]
      .map(([categoria, montoCop]) => ({ categoria, montoCop }))
      .sort((a, b) => b.montoCop - a.montoCop);

    const ingresosCop = ventasCop + ingresosManualesCop;
    return {
      ventasCop,
      numVentas,
      ingresosManualesCop,
      ingresosCop,
      egresosCop,
      balanceCop: ingresosCop - egresosCop,
      egresosPorCategoria,
    };
  },
});

// === Historial unificado: TODO lo que entró y salió en el rango ===
// Junta las ventas de bolsos (de `pedidos`) con los movimientos manuales,
// normalizados a una sola lista ordenada por fecha (más reciente primero).
export type EntradaHistorial = {
  id: string;
  fecha: number;
  tipo: "ingreso" | "egreso";
  concepto: string;
  detalle?: string;
  montoCop: number;
  origen: "venta" | "manual";
  borrable: boolean;
};

export const historialCuentas = query({
  args: { secret: v.string(), desde: v.number(), hasta: v.number() },
  handler: async (ctx, { secret, desde, hasta }): Promise<EntradaHistorial[]> => {
    exigirSecreto(secret);
    const entradas: EntradaHistorial[] = [];

    // Ventas de bolsos (web + presencial).
    const pedidos = await ctx.db.query("pedidos").collect();
    for (const p of pedidos) {
      if (!ESTADOS_VENTA.includes(p.estado)) continue;
      const fecha = p.pagadoEn ?? p._creationTime;
      if (fecha < desde || fecha >= hasta) continue;
      const cliente = await ctx.db.get(p.clienteId);
      const unidades = p.items.reduce((s, i) => s + i.cantidad, 0);
      entradas.push({
        id: p._id,
        fecha,
        tipo: "ingreso",
        concepto: "Venta de bolsos",
        detalle: `${unidades} bolso(s)${cliente?.nombre ? ` · ${cliente.nombre}` : ""}`,
        montoCop: p.totalCop,
        origen: "venta",
        borrable: false,
      });
    }

    // Movimientos manuales (ingresos/egresos).
    const movs = await ctx.db
      .query("movimientos")
      .withIndex("by_fecha", (q) => q.gte("fecha", desde).lt("fecha", hasta))
      .collect();
    for (const m of movs) {
      entradas.push({
        id: m._id,
        fecha: m.fecha,
        tipo: m.tipo,
        concepto: m.categoria,
        detalle: [m.nota, m.registradoPor].filter(Boolean).join(" · ") || undefined,
        montoCop: m.montoCop,
        origen: "manual",
        borrable: true,
      });
    }

    entradas.sort((a, b) => b.fecha - a.fecha);
    return entradas;
  },
});
