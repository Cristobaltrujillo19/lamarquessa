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
  v.literal("iniciales_gratis"),
);

/**
 * Cuánto descuenta un cupón.
 *
 * `inicialesCop` es lo que suma SOLO el grabado de iniciales del carrito
 * (30.000 por unidad grabada). Va aparte del subtotal a propósito: un cupón de
 * "iniciales gratis" tiene que descontar exactamente eso y nada más.
 *
 * ⚠️ El color a disposición (60.000) NO entra: el premio de la feria era el
 * grabado, no la personalización entera. Regalar los dos sería el doble.
 *
 * Con un `fijo` de 30.000 no se puede hacer: su tope es el subtotal entero,
 * así que descontaría 30.000 de un bolso sin grabar. Ver §24 del ESTADO.
 */
function calcularDescuentoCop(
  cupon: Pick<Doc<"cupones">, "tipo" | "valor">,
  subtotalCop: number,
  envioCop: number,
  inicialesCop: number,
): number {
  if (cupon.tipo === "iniciales_gratis") {
    // Nunca más de lo que se grabó, y nunca más que el subtotal.
    return Math.min(subtotalCop, Math.max(0, Math.round(inicialesCop)));
  }
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
  args: {
    codigo: v.string(),
    subtotalCop: v.number(),
    envioCop: v.number(),
    // Opcional para no romper a quien ya llamaba con tres argumentos: sin
    // grabado, un cupón de iniciales descuenta 0, que es correcto.
    inicialesCop: v.optional(v.number()),
  },
  handler: async (ctx, { codigo, subtotalCop, envioCop, inicialesCop }) => {
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
      descuentoCop: calcularDescuentoCop(
        cupon,
        subtotalCop,
        envioCop,
        inicialesCop ?? 0,
      ),
    };
  },
});

// === Re-validación interna (la usará createCheckout antes de crear el pago) ===
export const evaluarCupon = internalQuery({
  args: {
    codigo: v.string(),
    subtotalCop: v.number(),
    envioCop: v.number(),
    inicialesCop: v.optional(v.number()),
  },
  handler: async (ctx, { codigo, subtotalCop, envioCop, inicialesCop }) => {
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
      descuentoCop: calcularDescuentoCop(
        cupon,
        subtotalCop,
        envioCop,
        inicialesCop ?? 0,
      ),
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
    // `iniciales_gratis` ignora `valor`, igual que `envio_gratis`: lo que
    // descuenta lo decide el carrito, no el cupón.
    if (a.tipo === "fijo" && a.valor <= 0) {
      throw new Error("El valor del descuento debe ser mayor a 0");
    }

    await ctx.db.insert("cupones", {
      codigo,
      tipo: a.tipo,
      valor:
        a.tipo === "envio_gratis" || a.tipo === "iniciales_gratis"
          ? 0
          : Math.round(a.valor),
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

/**
 * Siembra los once cupones de la feria de septiembre de 2026.
 *
 * Idempotente: si un código ya existe, lo actualiza en vez de duplicarlo, así
 * que se puede correr dos veces sin repartir premios de más.
 *
 * ⚠️ Los códigos llevan un sufijo aleatorio de cuatro caracteres A PROPÓSITO.
 * Sin él, `SARA` o `AMALIA` los adivina cualquiera probando nombres comunes, y
 * son ocho personalizaciones gratis de hasta 90.000 cada una: 720.000 de
 * exposición. El alfabeto del sufijo excluye O/0 e I/1/L, que se confunden al
 * dictarlos por teléfono.
 *
 * Vencen a los 6 meses. Un premio sin fecha es un pasivo abierto para siempre.
 */
export const sembrarCuponesFeria = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);

    // 8 de septiembre de 2026 + 6 meses.
    const VENCE = new Date("2027-03-08T23:59:59-05:00").getTime();

    const premios: Array<{
      codigo: string;
      persona: string;
      tipo: "iniciales_gratis" | "porcentaje";
      valor: number;
    }> = [
      // --- Iniciales gratis (el grabado, NO el color a disposición) ---
      { codigo: "MARCELAB-2K8G", persona: "Marcela Botero", tipo: "iniciales_gratis", valor: 0 },
      { codigo: "TEFAM-FY6C", persona: "Tefa Mejía", tipo: "iniciales_gratis", valor: 0 },
      { codigo: "ALEJAH-RD39", persona: "Aleja Hernández", tipo: "iniciales_gratis", valor: 0 },
      { codigo: "SARAC-CW59", persona: "Sara Cardona", tipo: "iniciales_gratis", valor: 0 },
      { codigo: "AMALIAV-Q5D9", persona: "Amalia Villegas", tipo: "iniciales_gratis", valor: 0 },
      { codigo: "MPAULAM-TEBC", persona: "María Paula Mejía", tipo: "iniciales_gratis", valor: 0 },
      { codigo: "STEFANYC-FJ7S", persona: "Stefany Castañeda", tipo: "iniciales_gratis", valor: 0 },
      { codigo: "EMILIANAR-FE7D", persona: "Emiliana Rada", tipo: "iniciales_gratis", valor: 0 },
      // --- 10% de descuento ---
      { codigo: "MAPI-NPGW", persona: "Mapi", tipo: "porcentaje", valor: 10 },
      { codigo: "SUSANAR-V9WJ", persona: "Susana Restrepo", tipo: "porcentaje", valor: 10 },
      { codigo: "STEPHANIEA-CZVA", persona: "Stephanie Arango", tipo: "porcentaje", valor: 10 },
    ];

    const creados: string[] = [];
    const actualizados: string[] = [];

    for (const p of premios) {
      const codigo = p.codigo.trim().toUpperCase();
      const campos = {
        codigo,
        tipo: p.tipo,
        valor: p.valor,
        activo: true,
        expiraEn: VENCE,
        // Personal e intransferible: un solo uso.
        usosMax: 1,
      };

      const previo = await ctx.db
        .query("cupones")
        .withIndex("by_codigo", (q) => q.eq("codigo", codigo))
        .unique();

      if (previo) {
        // `usados` NO se toca: si alguien ya lo canjeó, se respeta.
        await ctx.db.patch(previo._id, campos);
        actualizados.push(`${codigo} (${p.persona})`);
      } else {
        await ctx.db.insert("cupones", { ...campos, usados: 0 });
        creados.push(`${codigo} (${p.persona})`);
      }
    }

    return { creados, actualizados, vencen: new Date(VENCE).toISOString() };
  },
});
