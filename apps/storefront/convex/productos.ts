import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const colorV = v.object({
  id: v.string(),
  nombre: v.string(),
  hex: v.string(),
  hex2: v.optional(v.string()),
});
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
    altoCm: v.optional(v.number()),
    anchoCm: v.optional(v.number()),
    profundidadCm: v.optional(v.number()),
    material: v.optional(v.string()),
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
      altoCm: a.altoCm,
      anchoCm: a.anchoCm,
      profundidadCm: a.profundidadCm,
      material: a.material,
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
    altoCm: v.optional(v.number()),
    anchoCm: v.optional(v.number()),
    profundidadCm: v.optional(v.number()),
    material: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    exigirSecreto(a.secret);
    // Solo se tocan los campos enviados: las medidas no se borran si el
    // formulario del panel todavía no las incluye.
    const { secret: _s, id, ...campos } = a;
    await ctx.db.patch(id, campos);
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

// Catálogo REAL de La Marquessa. Reemplaza por completo lo que haya en la
// tabla (los 4 bolsos placeholder), así que es la única fuente de verdad.
// Datos tomados del documento de producto de la marca.
export const sembrarCatalogoReal = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);

    // Los 3 acabados disponibles, iguales para los cuatro bolsos.
    const ACABADOS = [
      { id: "amanecer", nombre: "Amanecer", hex: "#e8bca6" },
      { id: "caribe", nombre: "Caribe", hex: "#bcc1d2" },
      // Horizonte es un seda bicolor: negro y rojo. Los dos tonos son
      // aproximaciones editables desde el panel.
      { id: "horizonte", nombre: "Horizonte", hex: "#111111", hex2: "#b3121a" },
    ];
    const MATERIAL = "PLA de origen colombiano, impreso en 3D y terminado a mano";

    const data = [
      {
        slug: "menorca",
        nombre: "Menorca",
        descripcion:
          "Menorca no necesita anunciarse. Su silueta nace de una curva continua —sin costuras, sin interrupciones— como una ola detenida justo antes de romper. La textura que la recorre no es un patrón repetido: es el relieve irregular de la espuma, distinto en cada centímetro, imposible de copiar dos veces.\n\nEs un bolso de mano de asa integrada, del tamaño exacto de un día bien planeado: entra lo que necesitas y nada que sobre. Cada Menorca se crea individualmente combinando impresión 3D con acabado artesanal a mano, así que la que llegue a ti es literalmente la única que existe.\n\nDisponible también en talla grande: Mallorca.",
        precioCop: 210_000,
        altoCm: 20,
        anchoCm: 19.2,
        profundidadCm: 8.7,
        fotos: [
          "/fotos/bolso-menorca-impresion-3d-frente.jpg",
          "/fotos/bolso-menorca-en-uso.jpg",
          "/fotos/bolso-menorca-ambiente.jpg",
          "/fotos/bolso-menorca-impresion-3d-angulo.jpg",
        ],
        insignia: undefined as string | undefined,
      },
      {
        slug: "mallorca",
        nombre: "Mallorca",
        descripcion:
          "Mallorca tiene la presencia de una pieza pensada para ser mirada. Una curva continua que se cierra en un arco abierto, y sobre toda su superficie el relieve irregular de la espuma, tallado a mano: la luz nunca cae dos veces igual sobre él.\n\nSu volumen la vuelve el bolso de los días largos —los que empiezan en una mesa y terminan en otra. Como toda pieza de La Marquessa, se crea una por una uniendo impresión 3D y trabajo manual, para lograr una forma que hasta hace poco no se podía fabricar.\n\nEs la talla grande de Menorca. Misma silueta, más cuerpo.",
        precioCop: 255_000,
        altoCm: 23.7,
        anchoCm: 22.8,
        profundidadCm: 10.4,
        fotos: [
          "/fotos/bolso-mallorca-impresion-3d-frente.jpg",
          "/fotos/bolso-mallorca-en-uso.jpg",
          "/fotos/bolso-mallorca-ambiente.jpg",
          "/fotos/bolso-mallorca-impresion-3d-angulo.jpg",
        ],
        insignia: undefined as string | undefined,
      },
      {
        slug: "kruta",
        nombre: "Kruta",
        descripcion:
          "Kruta se levanta. Su cuerpo es vertical y estrecho, de base casi cuadrada: una silueta que se sostiene sola sobre cualquier mesa, sin recostarse ni pedir permiso. La superficie es lisa y luminosa, y sobre ella corre un solo pliegue —el trazo de una corriente que envuelve la pieza de lado a lado y termina justo donde nace el asa.\n\nEs el bolso de las noches y de los planes cortos: lo esencial, llevado con intención. Cada Kruta se crea individualmente uniendo impresión 3D y acabado artesanal a mano, así que el pliegue que la recorre no se repite en ninguna otra.",
        precioCop: 230_000,
        altoCm: 20.5,
        anchoCm: 12.8,
        profundidadCm: 12.8,
        fotos: [
          "/fotos/bolso-kruta-impresion-3d-frente.jpg",
          "/fotos/bolso-kruta-en-uso.jpg",
          "/fotos/bolso-kruta-ambiente.jpg",
          "/fotos/bolso-kruta-impresion-3d-angulo.jpg",
        ],
        insignia: undefined,
      },
      {
        slug: "montt",
        nombre: "Montt",
        descripcion:
          "Montt se recuesta. Es ancha, baja, de líneas horizontales, y sobre el frente le cruza un pliegue en diagonal: la tela que cede, la ola que ya rompió. El asa se abre en un arco limpio y deja aire entre el mango y el cuerpo, como el vano de un puente.\n\nEs el bolso de la vida diaria: el que se agarra sin pensarlo y funciona con todo. Cada Montt se crea individualmente uniendo impresión 3D y acabado artesanal a mano, así que el pliegue cae distinto en cada pieza. No hay dos iguales.",
        precioCop: 195_000,
        altoCm: 17.5,
        anchoCm: 18.2,
        profundidadCm: 12.3,
        fotos: [
          "/fotos/bolso-montt-impresion-3d-frente.jpg",
          "/fotos/bolso-montt-en-uso.jpg",
          "/fotos/bolso-montt-ambiente.jpg",
          "/fotos/bolso-montt-impresion-3d-angulo.jpg",
        ],
        insignia: undefined,
      },
    ];

    // Fuera lo anterior (los placeholders), para no dejar catálogo mezclado.
    const previos = await ctx.db.query("productos").collect();
    for (const p of previos) await ctx.db.delete(p._id);

    let orden = 0;
    for (const p of data) {
      const { precioCop, ...resto } = p;
      await ctx.db.insert("productos", {
        ...resto,
        categoria: "Bolsos",
        colores: ACABADOS,
        tamanos: [{ id: "unica", nombre: "Talla única", precioCop }],
        material: MATERIAL,
        activo: true,
        orden: orden++,
      });
    }
    return { eliminados: previos.map((p) => p.slug), creados: data.map((p) => p.slug) };
  },
});

// Corrige el acabado Horizonte en el catálogo que ya está vivo: nació con un
// cobre provisional y en realidad es un seda bicolor negro y rojo.
//
// A diferencia de sembrarCatalogoReal, esta mutación NO borra nada: solo toca
// ese color en los productos que lo tengan, y es idempotente (correrla dos
// veces no cambia nada la segunda). Los tonos exactos quedan editables desde
// el panel.
export const corregirColorHorizonte = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);

    const NEGRO = "#111111";
    const ROJO = "#b3121a";

    const productos = await ctx.db.query("productos").collect();
    const actualizados: string[] = [];

    for (const p of productos) {
      const tiene = p.colores.some((c) => c.id === "horizonte");
      if (!tiene) continue;

      const colores = p.colores.map((c) =>
        c.id === "horizonte" ? { ...c, hex: NEGRO, hex2: ROJO } : c,
      );
      const yaEstaba = p.colores.every(
        (c, i) => c.hex === colores[i].hex && c.hex2 === colores[i].hex2,
      );
      if (yaEstaba) continue;

      await ctx.db.patch(p._id, { colores });
      actualizados.push(p.slug);
    }

    return { actualizados };
  },
});
