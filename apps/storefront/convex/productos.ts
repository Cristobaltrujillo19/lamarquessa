import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const colorV = v.object({
  id: v.string(),
  nombre: v.string(),
  hex: v.string(),
  hex2: v.optional(v.string()),
  descripcion: v.optional(v.string()),
  fotoReferencia: v.optional(v.string()),
});
const tamanoV = v.object({ id: v.string(), nombre: v.string(), precioCop: v.number() });

// Gate del panel: mismo patrón que SER (secreto compartido en el server de Next).
function exigirSecreto(secret: string) {
  const esperado = process.env.ADMIN_API_SECRET;
  if (!esperado || secret !== esperado) throw new Error("No autorizado");
}

/** Los 5 acabados en que se fabrica cada pieza. Fuente de verdad única: la
 *  usan tanto la semilla como la mutación de actualización, para que no
 *  puedan divergir.
 *
 *  El orden es el del sistema de diseño (claro → oscuro → bicolor → azules)
 *  y es el que ve el cliente en el configurador de la ficha.
 *
 *  ⚠️ Los hex son aproximaciones derivadas de una descripción verbal —
 *  nadie ha medido una pieza física con luz neutra. Están tomados de
 *  `globals.css` del mockup aprobado. Recalibrar contra tomas de estudio
 *  antes de usarlos en material impreso.
 *
 *  ⚠️ Manglar y Marea no tienen ni una sola fotografía todavía. Se pueden
 *  comprar; el configurador avisa de que la referencia está pendiente y la
 *  galería enseña las fotos que existen con su color real estampado. */
const ACABADOS_MARCA = [
  {
    id: "amanecer",
    nombre: "Amanecer",
    hex: "#D9C7A8",
    descripcion: "Beige cálido. El tono de la arena antes de que llegue nadie.",
    fotoReferencia: "/assets/colores/amanecer.jpg",
  },
  {
    id: "manglar",
    nombre: "Manglar",
    hex: "#4B3122",
    descripcion: "Chocolate cerrado. El color de la raíz que crece dentro del agua.",
  },
  {
    // Bicolor: rojo arriba, negro abajo. La muestra se parte con un corte duro
    // a 45°, no con un degradado — un degradado inventaría tonos intermedios
    // que la pieza no tiene.
    id: "horizonte",
    nombre: "Horizonte",
    hex: "#8F2B23",
    hex2: "#171310",
    descripcion: "Rojo sobre negro. La línea exacta donde el día se corta.",
  },
  {
    id: "caribe",
    nombre: "Caribe",
    hex: "#2C8CA8",
    descripcion: "Azul de agua clara, el que solo se ve a poca profundidad.",
    fotoReferencia: "/assets/colores/caribe.jpg",
  },
  {
    id: "marea",
    nombre: "Marea",
    hex: "#1E2C4A",
    descripcion: "Azul marino. El mar cuando ya no se le alcanza el fondo.",
  },
];

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
    subtitulo: v.optional(v.string()),
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
      subtitulo: a.subtitulo,
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
    subtitulo: v.optional(v.string()),
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

    // Los 5 acabados disponibles, iguales para los cuatro bolsos. El orden es
    // el del sistema de diseño (ORDEN_COLORES): claro → oscuro → bicolor →
    // azules. Los hex vienen de `globals.css` del mockup aprobado.
    //
    // ⚠️ Siguen siendo aproximaciones a una descripción verbal: nadie ha
    // medido una pieza física con luz neutra. Calibrar antes de imprimir
    // material impreso. Ver capítulo 9 del handoff.
    const ACABADOS = ACABADOS_MARCA;
    const MATERIAL = "PLA de origen colombiano, impreso en 3D y terminado a mano";

    const data = [
      {
        slug: "menorca",
        nombre: "Menorca",
        subtitulo:
          "Mini bolso de mano impreso en 3D, hecho a mano en Colombia",
        descripcion:
          "Menorca no necesita anunciarse. Su silueta nace de una curva continua —sin costuras, sin interrupciones— como una ola detenida justo antes de romper. La textura que la recorre no es un patrón repetido: es el relieve irregular de la espuma, distinto en cada centímetro, imposible de copiar dos veces.\n\nEs un bolso de mano de asa integrada, del tamaño exacto de un día bien planeado: entra lo que necesitas y nada que sobre. Cada Menorca se crea individualmente combinando impresión 3D con acabado artesanal a mano, así que la que llegue a ti es literalmente la única que existe.\n\nUn bolso pequeño de mano con textura escultural, impreso en 3D y hecho a mano en Colombia — accesorio de moda de edición individual.\n\nDisponible también en talla grande: Mallorca.",
        precioCop: 210_000,
        altoCm: 20,
        anchoCm: 19.2,
        profundidadCm: 8.7,
        // Los dos renders de estudio van juntos al principio; las fotos de
        // contexto después. Así la galería enseña primero el producto y luego
        // el ambiente, en vez de alternar.
        fotos: [
          "/fotos/bolso-menorca-impresion-3d-frente.jpg",
          "/fotos/bolso-menorca-impresion-3d-angulo.jpg",
          "/fotos/bolso-menorca-en-uso.jpg",
          "/fotos/bolso-menorca-ambiente.jpg",
        ],
        insignia: undefined as string | undefined,
      },
      {
        slug: "mallorca",
        nombre: "Mallorca",
        subtitulo:
          "Bolso de mano estructurado, impreso en 3D y hecho a mano en Colombia",
        descripcion:
          "Mallorca tiene la presencia de una pieza pensada para ser mirada. Una curva continua que se cierra en un arco abierto, y sobre toda su superficie el relieve irregular de la espuma, tallado a mano: la luz nunca cae dos veces igual sobre él.\n\nSu volumen la vuelve el bolso de los días largos —los que empiezan en una mesa y terminan en otra. Como toda pieza de La Marquessa, se crea una por una uniendo impresión 3D y trabajo manual, para lograr una forma que hasta hace poco no se podía fabricar.\n\nUn bolso de mano para mujer, estructurado, de diseño de autor: bolso artesanal colombiano impreso en 3D pieza por pieza.\n\nEs la talla grande de Menorca. Misma silueta, más cuerpo.",
        precioCop: 255_000,
        altoCm: 23.7,
        anchoCm: 22.8,
        profundidadCm: 10.4,
        fotos: [
          "/fotos/bolso-mallorca-impresion-3d-frente.jpg",
          "/fotos/bolso-mallorca-impresion-3d-angulo.jpg",
          "/fotos/bolso-mallorca-en-uso.jpg",
          "/fotos/bolso-mallorca-ambiente.jpg",
        ],
        insignia: undefined as string | undefined,
      },
      {
        slug: "kruta",
        nombre: "Kruta",
        subtitulo:
          "Mini bolso vertical impreso en 3D, hecho a mano en Colombia",
        descripcion:
          "Kruta se levanta. Su cuerpo es vertical y estrecho, de base casi cuadrada: una silueta que se sostiene sola sobre cualquier mesa, sin recostarse ni pedir permiso. La superficie es lisa y luminosa, y sobre ella corre un solo pliegue —el trazo de una corriente que envuelve la pieza de lado a lado y termina justo donde nace el asa.\n\nEs el bolso de las noches y de los planes cortos: lo esencial, llevado con intención. Cada Kruta se crea individualmente uniendo impresión 3D y acabado artesanal a mano, así que el pliegue que la recorre no se repite en ninguna otra.\n\nUn mini bolso estructurado de mano, hecho a mano en Colombia, pensado como bolso pequeño para salir de noche.",
        precioCop: 230_000,
        altoCm: 20.5,
        anchoCm: 12.8,
        profundidadCm: 12.8,
        fotos: [
          "/fotos/bolso-kruta-impresion-3d-frente.jpg",
          "/fotos/bolso-kruta-impresion-3d-angulo.jpg",
          "/fotos/bolso-kruta-en-uso.jpg",
          "/fotos/bolso-kruta-en-uso-horizonte.jpg",
          "/fotos/bolso-kruta-ambiente.jpg",
        ],
        insignia: undefined,
      },
      {
        slug: "montt",
        nombre: "Montt",
        subtitulo:
          "Cartera de mano para el día, impresa en 3D y hecha a mano en Colombia",
        descripcion:
          "Montt se recuesta. Es ancha, baja, de líneas horizontales, y sobre el frente le cruza un pliegue en diagonal: la tela que cede, la ola que ya rompió. El asa se abre en un arco limpio y deja aire entre el mango y el cuerpo, como el vano de un puente.\n\nEs el bolso de la vida diaria: el que se agarra sin pensarlo y funciona con todo. Cada Montt se crea individualmente uniendo impresión 3D y acabado artesanal a mano, así que el pliegue cae distinto en cada pieza. No hay dos iguales.\n\nUna cartera de mano para el día a día: bolso escultural para mujer, con textura tridimensional, impreso en 3D y hecho a mano en Colombia.",
        precioCop: 195_000,
        altoCm: 17.5,
        anchoCm: 18.2,
        profundidadCm: 12.3,
        fotos: [
          "/fotos/bolso-montt-impresion-3d-frente.jpg",
          "/fotos/bolso-montt-impresion-3d-angulo.jpg",
          "/fotos/bolso-montt-en-uso.jpg",
          "/fotos/bolso-montt-ambiente.jpg",
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

// Deja los dos renders de estudio juntos al principio de la galería. El
// catálogo vivo los tenía alternados (frente, contexto, ambiente, ángulo), así
// que la ficha enseñaba el producto, se iba al ambiente y volvía al producto.
//
// No borra ni añade fotos: solo las reordena, y la portada (la primera) sigue
// siendo la misma, que es la que usan la tarjeta del catálogo y el Open Graph.
// Idempotente: correrla dos veces no cambia nada la segunda.
export const juntarRendersDeEstudio = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);

    const productos = await ctx.db.query("productos").collect();
    const reordenados: string[] = [];

    for (const p of productos) {
      const estudio = p.fotos.filter((f) => f.includes("impresion-3d"));
      const contexto = p.fotos.filter((f) => !f.includes("impresion-3d"));
      const fotos = [...estudio, ...contexto];
      if (fotos.join("|") === p.fotos.join("|")) continue;

      await ctx.db.patch(p._id, { fotos });
      reordenados.push(p.slug);
    }

    return { reordenados };
  },
});

// Lleva el catálogo vivo de 3 acabados a los 5 de la nueva interfaz, y les
// añade la descripción de marca que el configurador de la ficha necesita.
//
// Cambia también los hex de los 3 que ya existían: los de producción venían
// del documento de marca y los nuevos del sistema de diseño aprobado. El
// salto más visible es Caribe, que pasa de un gris lavanda (#bcc1d2) a un
// turquesa de agua clara (#2C8CA8).
//
// Igual patrón que actualizarSeoDeCatalogo: NO borra filas, solo reemplaza el
// array `colores` de cada producto, y es idempotente.
//
// ⚠️ Los pedidos ya existentes NO se tocan. Guardan su `colorNombre` congelado
// al momento de la venta, así que un pedido viejo de "Caribe" sigue diciendo
// Caribe aunque el hex del catálogo haya cambiado. Es el comportamiento que
// queremos: el histórico no se reescribe.
export const actualizarColoresDeCatalogo = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);

    // Comparación campo a campo, no JSON.stringify: Convex no garantiza el
    // orden de las claves al leer un documento, así que stringify daba falsos
    // negativos y la mutación reescribía siempre.
    // El tipo va explícito y laxo: `typeof ACABADOS_MARCA` infiere una unión
    // estricta (una forma con hex2, otra sin él) que no encaja con lo que
    // devuelve la base, donde hex2 y descripcion son simplemente opcionales.
    type ColorGuardado = {
      id: string;
      nombre: string;
      hex: string;
      hex2?: string;
      descripcion?: string;
      fotoReferencia?: string;
    };
    const yaCoincide = (guardados: ColorGuardado[]) =>
      guardados.length === ACABADOS_MARCA.length &&
      ACABADOS_MARCA.every((esperado, i) => {
        const actual = guardados[i];
        return (
          actual?.id === esperado.id &&
          actual?.nombre === esperado.nombre &&
          actual?.hex === esperado.hex &&
          actual?.hex2 === esperado.hex2 &&
          actual?.descripcion === esperado.descripcion &&
          actual?.fotoReferencia === esperado.fotoReferencia
        );
      });

    const productos = await ctx.db.query("productos").collect();
    const actualizados: string[] = [];

    for (const p of productos) {
      if (yaCoincide(p.colores)) continue;
      await ctx.db.patch(p._id, { colores: ACABADOS_MARCA });
      actualizados.push(p.slug);
    }

    return { actualizados, totalAcabados: ACABADOS_MARCA.length };
  },
});

// Declara qué color enseña cada foto del catálogo.
//
// De dónde sale cada valor, que es lo que hace el dato defendible:
//
//  - Las tomas de contexto de agosto venían nombradas por acabado en origen
//    (bolso-kruta-caribe-en-uso, bolso-mallorca-horizonte-en-uso) antes de
//    renombrarse al esquema por rol. No se adivina: se recupera el dato que
//    traía el nombre.
//
//  - Los renders de estudio son inspección directa sobre fondo gris neutro,
//    que es exactamente la condición que el capítulo 9 del handoff declara
//    fiable para juzgar color. Los ocho son Amanecer.
//
//  - Las tomas de atardecer de julio se leen ROSA, no beige, y ese es
//    justamente el caso que el capítulo 9 documenta: "el mismo bolso Amanecer
//    mide #F4D2C6 en la foto de atardecer y #D6BB9E en el render de estudio
//    con luz neutra". Son Amanecer bajo luz cálida, no otro acabado.
//
// Si mañana entra una foto cuyo acabado nadie registró, se deja fuera de este
// mapa y se rotula como pendiente. Un rótulo inventado es peor que ninguno.
//
// Idempotente y no destructiva, como el resto de mutaciones de mantenimiento.
export const actualizarColoresDeFotos = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);

    const mapaPorSlug: Record<string, Record<string, string>> = {
      menorca: {
        "/fotos/bolso-menorca-impresion-3d-frente.jpg": "amanecer",
        "/fotos/bolso-menorca-impresion-3d-angulo.jpg": "amanecer",
        "/fotos/bolso-menorca-en-uso.jpg": "amanecer",
        "/fotos/bolso-menorca-ambiente.jpg": "amanecer",
      },
      mallorca: {
        "/fotos/bolso-mallorca-impresion-3d-frente.jpg": "amanecer",
        "/fotos/bolso-mallorca-impresion-3d-angulo.jpg": "amanecer",
        "/fotos/bolso-mallorca-en-uso.jpg": "horizonte",
        "/fotos/bolso-mallorca-ambiente.jpg": "amanecer",
      },
      kruta: {
        "/fotos/bolso-kruta-impresion-3d-frente.jpg": "amanecer",
        "/fotos/bolso-kruta-impresion-3d-angulo.jpg": "amanecer",
        "/fotos/bolso-kruta-en-uso.jpg": "caribe",
        "/fotos/bolso-kruta-en-uso-horizonte.jpg": "horizonte",
        "/fotos/bolso-kruta-ambiente.jpg": "caribe",
      },
      montt: {
        "/fotos/bolso-montt-impresion-3d-frente.jpg": "amanecer",
        "/fotos/bolso-montt-impresion-3d-angulo.jpg": "amanecer",
        "/fotos/bolso-montt-en-uso.jpg": "caribe",
        "/fotos/bolso-montt-ambiente.jpg": "amanecer",
      },
    };

    const productos = await ctx.db.query("productos").collect();
    const actualizados: string[] = [];

    for (const p of productos) {
      const nuevo = mapaPorSlug[p.slug];
      if (!nuevo) continue;

      const actual = p.fotoColores ?? {};
      const clavesNuevas = Object.keys(nuevo);
      const igual =
        Object.keys(actual).length === clavesNuevas.length &&
        clavesNuevas.every((k) => actual[k] === nuevo[k]);
      if (igual) continue;

      await ctx.db.patch(p._id, { fotoColores: nuevo });
      actualizados.push(p.slug);
    }

    return {
      actualizados,
      // Cuántas fotos quedan sin color declarado, para tenerlo a la vista.
      sinColor: productos.reduce(
        (n, p) => n + p.fotos.filter((f) => !(mapaPorSlug[p.slug] ?? {})[f]).length,
        0,
      ),
    };
  },
});

// Reemplaza las fotos de los 4 bolsos en el catálogo vivo con las nuevas
// tomadas en la sesión editorial (2026-08-16). Kruta pasa a 5 fotos (dos
// en-uso: Caribe y Horizonte) para mostrar la pieza en sus dos acabados
// principales; los otros se mantienen en 4 slots (estudio + estudio +
// en-uso + ambiente). Idempotente y no destructiva — igual patrón que
// actualizarSeoDeCatalogo. Los productos no listados quedan intactos.
export const actualizarFotosDeCatalogo = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);

    // ORDEN DEL ARREGLO — no es cosmetico, lo leen tres sitios:
    //
    //   fotos[0] = PORTADA de la tarjeta de coleccion, y primera del carrusel
    //              de la ficha.
    //   fotos[1] = foto de HOVER de la tarjeta: la que aparece en cross-fade
    //              al pasar el cursor (TarjetaProducto lee `producto.fotos[1]`).
    //   el resto  = siguen el carrusel de la ficha en este orden.
    //
    // Decidido el 2026-08-26: el hover pasa de la toma de angulo a la toma
    // EN USO. La de angulo repetia el mismo plano de estudio que la portada,
    // asi que el cross-fade apenas se notaba; la de en uso cambia de contexto
    // y ensena la pieza puesta, que es lo que resuelve la duda de tamano.
    //
    // Kruta usa la variante -horizonte porque es la unica que tiene dos tomas
    // en uso, y esa ensena el acabado bicolor.
    const fotosPorSlug: Record<string, string[]> = {
      menorca: [
        "/fotos/bolso-menorca-impresion-3d-frente.jpg",
        "/fotos/bolso-menorca-en-uso.jpg",
        "/fotos/bolso-menorca-impresion-3d-angulo.jpg",
        "/fotos/bolso-menorca-ambiente.jpg",
      ],
      mallorca: [
        "/fotos/bolso-mallorca-impresion-3d-frente.jpg",
        "/fotos/bolso-mallorca-en-uso.jpg",
        "/fotos/bolso-mallorca-impresion-3d-angulo.jpg",
        "/fotos/bolso-mallorca-ambiente.jpg",
      ],
      kruta: [
        "/fotos/bolso-kruta-impresion-3d-frente.jpg",
        "/fotos/bolso-kruta-en-uso-horizonte.jpg",
        "/fotos/bolso-kruta-impresion-3d-angulo.jpg",
        "/fotos/bolso-kruta-en-uso.jpg",
        "/fotos/bolso-kruta-ambiente.jpg",
      ],
      montt: [
        "/fotos/bolso-montt-impresion-3d-frente.jpg",
        "/fotos/bolso-montt-en-uso.jpg",
        "/fotos/bolso-montt-impresion-3d-angulo.jpg",
        "/fotos/bolso-montt-ambiente.jpg",
      ],
    };

    const productos = await ctx.db.query("productos").collect();
    const actualizados: string[] = [];
    for (const p of productos) {
      const nuevas = fotosPorSlug[p.slug];
      if (!nuevas) continue;
      if (nuevas.join("|") === p.fotos.join("|")) continue;
      await ctx.db.patch(p._id, { fotos: nuevas });
      actualizados.push(p.slug);
    }
    return { actualizados };
  },
});

// Parcha el subtitulo (H2 de la ficha) y la descripción de los 4 bolsos en el
// catálogo que ya está vivo, con textos ricos en palabras clave de moda
// insertadas de forma natural. Igual que corregirColorHorizonte:
//  - NO borra ni añade filas: solo toca esos dos campos por slug.
//  - Idempotente: si ya coinciden, no vuelve a escribir.
// Los productos que no estén en el mapa quedan intactos.
export const actualizarSeoDeCatalogo = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);

    const cambios: Record<string, { subtitulo: string; descripcion: string }> = {
      menorca: {
        subtitulo:
          "Mini bolso de mano impreso en 3D, hecho a mano en Colombia",
        descripcion:
          "Menorca no necesita anunciarse. Su silueta nace de una curva continua —sin costuras, sin interrupciones— como una ola detenida justo antes de romper. La textura que la recorre no es un patrón repetido: es el relieve irregular de la espuma, distinto en cada centímetro, imposible de copiar dos veces.\n\nEs un bolso de mano de asa integrada, del tamaño exacto de un día bien planeado: entra lo que necesitas y nada que sobre. Cada Menorca se crea individualmente combinando impresión 3D con acabado artesanal a mano, así que la que llegue a ti es literalmente la única que existe.\n\nUn bolso pequeño de mano con textura escultural, impreso en 3D y hecho a mano en Colombia — accesorio de moda de edición individual.\n\nDisponible también en talla grande: Mallorca.",
      },
      mallorca: {
        subtitulo:
          "Bolso de mano estructurado, impreso en 3D y hecho a mano en Colombia",
        descripcion:
          "Mallorca tiene la presencia de una pieza pensada para ser mirada. Una curva continua que se cierra en un arco abierto, y sobre toda su superficie el relieve irregular de la espuma, tallado a mano: la luz nunca cae dos veces igual sobre él.\n\nSu volumen la vuelve el bolso de los días largos —los que empiezan en una mesa y terminan en otra. Como toda pieza de La Marquessa, se crea una por una uniendo impresión 3D y trabajo manual, para lograr una forma que hasta hace poco no se podía fabricar.\n\nUn bolso de mano para mujer, estructurado, de diseño de autor: bolso artesanal colombiano impreso en 3D pieza por pieza.\n\nEs la talla grande de Menorca. Misma silueta, más cuerpo.",
      },
      kruta: {
        subtitulo:
          "Mini bolso vertical impreso en 3D, hecho a mano en Colombia",
        descripcion:
          "Kruta se levanta. Su cuerpo es vertical y estrecho, de base casi cuadrada: una silueta que se sostiene sola sobre cualquier mesa, sin recostarse ni pedir permiso. La superficie es lisa y luminosa, y sobre ella corre un solo pliegue —el trazo de una corriente que envuelve la pieza de lado a lado y termina justo donde nace el asa.\n\nEs el bolso de las noches y de los planes cortos: lo esencial, llevado con intención. Cada Kruta se crea individualmente uniendo impresión 3D y acabado artesanal a mano, así que el pliegue que la recorre no se repite en ninguna otra.\n\nUn mini bolso estructurado de mano, hecho a mano en Colombia, pensado como bolso pequeño para salir de noche.",
      },
      montt: {
        subtitulo:
          "Cartera de mano para el día, impresa en 3D y hecha a mano en Colombia",
        descripcion:
          "Montt se recuesta. Es ancha, baja, de líneas horizontales, y sobre el frente le cruza un pliegue en diagonal: la tela que cede, la ola que ya rompió. El asa se abre en un arco limpio y deja aire entre el mango y el cuerpo, como el vano de un puente.\n\nEs el bolso de la vida diaria: el que se agarra sin pensarlo y funciona con todo. Cada Montt se crea individualmente uniendo impresión 3D y acabado artesanal a mano, así que el pliegue cae distinto en cada pieza. No hay dos iguales.\n\nUna cartera de mano para el día a día: bolso escultural para mujer, con textura tridimensional, impreso en 3D y hecho a mano en Colombia.",
      },
    };

    const productos = await ctx.db.query("productos").collect();
    const actualizados: string[] = [];

    for (const p of productos) {
      const nuevo = cambios[p.slug];
      if (!nuevo) continue;
      if (
        p.subtitulo === nuevo.subtitulo &&
        p.descripcion === nuevo.descripcion
      ) {
        continue;
      }
      await ctx.db.patch(p._id, {
        subtitulo: nuevo.subtitulo,
        descripcion: nuevo.descripcion,
      });
      actualizados.push(p.slug);
    }

    return { actualizados };
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

/**
 * Asigna la vista de rayos X de cada pieza. Idempotente: solo escribe donde
 * el valor cambia, y comparando campo a campo (no con JSON.stringify, que da
 * falsos negativos porque Convex no garantiza el orden de las claves al leer).
 *
 * Las rutas apuntan a /public. Una pieza sin entrada aqui simplemente no
 * ensena la seccion: ausencia mejor que un hueco.
 */
export const actualizarRayosX = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);

    // Rellenar segun vayan llegando los renders. Las dos rutas de cada pieza
    // deben salir de la MISMA camara: `base` es la cara opaca y `vista` la
    // translucida. Una pieza que falte aqui conserva lo que tuviera.
    const porSlug: Record<string, { base: string; vista: string }> = {
      menorca:  { base: "/fotos/rayos-x-menorca-base.jpg",  vista: "/fotos/rayos-x-menorca.jpg" },
      mallorca: { base: "/fotos/rayos-x-mallorca-base.jpg", vista: "/fotos/rayos-x-mallorca.jpg" },
      kruta:    { base: "/fotos/rayos-x-kruta-base.jpg",    vista: "/fotos/rayos-x-kruta.jpg" },
      montt:    { base: "/fotos/rayos-x-montt-base.jpg",    vista: "/fotos/rayos-x-montt.jpg" },
    };

    const productos = await ctx.db.query("productos").collect();
    const actualizados: string[] = [];
    for (const p of productos) {
      const par = porSlug[p.slug];
      if (!par) continue;
      // Campo a campo, nunca con JSON.stringify: Convex no garantiza el orden
      // de las claves al leer y eso da falsos negativos que reescriben en
      // cada corrida.
      if (par.base === p.fotoRayosXBase && par.vista === p.fotoRayosX) continue;
      await ctx.db.patch(p._id, {
        fotoRayosXBase: par.base,
        fotoRayosX: par.vista,
      });
      actualizados.push(p.slug);
    }
    return { actualizados };
  },
});

/**
 * Quita la raya larga de las descripciones del catalogo.
 *
 * No es un reemplazo ciego: cada raya se sustituye por el signo que pide su
 * frase. Un `replace` global de raya por coma habria dejado enumeraciones de
 * cuatro comas seguidas y dos puntos donde tocaba coma.
 *
 * Idempotente: si el texto ya esta corregido, no escribe.
 */
export const quitarRayaLarga = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    exigirSecreto(secret);

    // De incisos con raya a comas, y de raya separadora a dos puntos.
    const REEMPLAZOS: [string, string][] = [
      [
        "una curva continua —sin costuras, sin interrupciones— como una ola",
        "una curva continua, sin costuras ni interrupciones, como una ola",
      ],
      [
        "hecho a mano en Colombia — accesorio de moda",
        "hecho a mano en Colombia: accesorio de moda",
      ],
      [
        "el bolso de los días largos —los que empiezan en una mesa",
        "el bolso de los días largos, los que empiezan en una mesa",
      ],
      [
        "corre un solo pliegue —el trazo de una corriente",
        "corre un solo pliegue: el trazo de una corriente",
      ],
    ];

    const productos = await ctx.db.query("productos").collect();
    const actualizados: string[] = [];
    for (const p of productos) {
      let texto = p.descripcion;
      for (const [de, a] of REEMPLAZOS) texto = texto.split(de).join(a);
      if (texto === p.descripcion) continue;
      await ctx.db.patch(p._id, { descripcion: texto });
      actualizados.push(p.slug);
    }

    // Aviso si queda alguna raya suelta que no cubrian los reemplazos.
    const restantes = (await ctx.db.query("productos").collect())
      .filter((p) => p.descripcion.includes("—"))
      .map((p) => p.slug);

    return { actualizados, conRayaTodavia: restantes };
  },
});
