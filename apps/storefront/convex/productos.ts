import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const colorV = v.object({ id: v.string(), nombre: v.string(), hex: v.string() });
const tamanoV = v.object({ id: v.string(), nombre: v.string(), precioCop: v.number() });

// Gate del panel: mismo patrón que SER (secreto compartido en el server de Next).
function exigirSecreto(secret: string) {
  const esperado = process.env.ADMIN_API_SECRET;
  if (!esperado || secret !== esperado) throw new Error("No autorizado");
}

// === Público (lo lee la tienda) ===
export const catalogo = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("productos")
      .withIndex("by_activo", (q) => q.eq("activo", true))
      .collect();
    return items.sort((a, b) => a.orden - b.orden);
  },
});

export const obtener = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("productos")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

// === Panel (protegido por secreto) ===
export const listar = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);
    const items = await ctx.db.query("productos").collect();
    return items.sort((a, b) => a.orden - b.orden);
  },
});

export const crear = mutation({
  args: {
    secret: v.string(),
    slug: v.string(),
    nombre: v.string(),
    descripcion: v.string(),
    categoria: v.string(),
    colores: v.array(colorV),
    tamanos: v.array(tamanoV),
    fotos: v.array(v.string()),
    insignia: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    exigirSecreto(a.secret);
    const slug = a.slug.trim().toLowerCase();
    if (!slug) throw new Error("El slug es obligatorio");
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("El slug solo puede tener minúsculas, números y guiones");
    }
    const existe = await ctx.db
      .query("productos")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existe) throw new Error("Ya existe un producto con ese slug");

    const total = (await ctx.db.query("productos").collect()).length;
    await ctx.db.insert("productos", {
      slug,
      nombre: a.nombre,
      descripcion: a.descripcion,
      categoria: a.categoria,
      colores: a.colores,
      tamanos: a.tamanos,
      fotos: a.fotos,
      insignia: a.insignia,
      activo: true,
      orden: total,
    });
  },
});

export const actualizar = mutation({
  args: {
    secret: v.string(),
    id: v.id("productos"),
    nombre: v.string(),
    descripcion: v.string(),
    categoria: v.string(),
    colores: v.array(colorV),
    tamanos: v.array(tamanoV),
    fotos: v.array(v.string()),
    insignia: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    exigirSecreto(a.secret);
    await ctx.db.patch(a.id, {
      nombre: a.nombre,
      descripcion: a.descripcion,
      categoria: a.categoria,
      colores: a.colores,
      tamanos: a.tamanos,
      fotos: a.fotos,
      insignia: a.insignia,
    });
  },
});

export const setActivo = mutation({
  args: { secret: v.string(), id: v.id("productos"), activo: v.boolean() },
  handler: async (ctx, { secret, id, activo }) => {
    exigirSecreto(secret);
    await ctx.db.patch(id, { activo });
  },
});

export const eliminar = mutation({
  args: { secret: v.string(), id: v.id("productos") },
  handler: async (ctx, { secret, id }) => {
    exigirSecreto(secret);
    await ctx.db.delete(id);
  },
});

// Siembra idempotente de los 4 bolsos placeholder. Solo inserta si está vacío,
// así correrla dos veces no duplica nada. Se puede borrar cuando haya datos reales.
export const sembrarPlaceholders = mutation({
  args: {},
  handler: async (ctx) => {
    const yaHay = await ctx.db.query("productos").first();
    if (yaHay) return { creados: 0, nota: "Ya había productos, no se sembró." };

    const C = {
      arena: { id: "arena", nombre: "Arena", hex: "#c1ab99" },
      marfil: { id: "marfil", nombre: "Marfil", hex: "#efe6d9" },
      cobre: { id: "cobre", nombre: "Cobre", hex: "#b38561" },
      cacao: { id: "cacao", nombre: "Cacao", hex: "#6f5a48" },
    };
    const tam = (mid: number, mini: number) => [
      { id: "mid", nombre: "Mid", precioCop: mid },
      { id: "mini", nombre: "Mini", precioCop: mini },
    ];

    const data = [
      {
        slug: "bolso-venera",
        nombre: "Bolso Venera",
        descripcion:
          "Clutch de noche con textura de concha, impreso en 3D y terminado a mano. Tu pieza statement frente al mar.",
        categoria: "Bolsos",
        colores: [C.arena, C.marfil, C.cobre, C.cacao],
        tamanos: tam(299_000, 219_000),
        fotos: ["/fotos/bolso-venera.jpg", "/fotos/hero-3.jpg", "/fotos/hero-1.jpg"],
        insignia: "La primera pieza" as string | undefined,
      },
      {
        slug: "bolso-marea",
        nombre: "Bolso Marea",
        descripcion:
          "Tote amplio y liviano para el día, la playa o la ciudad sin esfuerzo. Materiales colombianos.",
        categoria: "Bolsos",
        colores: [C.arena, C.marfil, C.cobre],
        tamanos: tam(259_000, 189_000),
        fotos: ["/fotos/bolso-marea.jpg", "/fotos/hero-1.jpg", "/fotos/hero-4.jpg"],
        insignia: undefined,
      },
      {
        slug: "bolso-brisa",
        nombre: "Bolso Brisa",
        descripcion:
          "Crossbody compacto, manos libres, para llevar contigo lo esencial con la pureza del mar.",
        categoria: "Bolsos",
        colores: [C.marfil, C.cobre, C.cacao],
        tamanos: tam(219_000, 159_000),
        fotos: ["/fotos/bolso-brisa.jpg", "/fotos/hero-2.jpg"],
        insignia: undefined,
      },
      {
        slug: "bolso-coral",
        nombre: "Bolso Coral",
        descripcion:
          "Bucket bag con caída suave y carácter; el favorito para todos los días, hecho para durar.",
        categoria: "Bolsos",
        colores: [C.arena, C.marfil, C.cobre, C.cacao],
        tamanos: tam(279_000, 199_000),
        fotos: ["/fotos/bolso-coral.jpg", "/fotos/hero-4.jpg", "/fotos/hero-2.jpg"],
        insignia: undefined,
      },
    ];

    let orden = 0;
    for (const p of data) {
      await ctx.db.insert("productos", { ...p, activo: true, orden: orden++ });
    }
    return { creados: data.length };
  },
});
