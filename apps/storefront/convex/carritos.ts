import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { addOnsPorUnidad } from "../lib/personalizacion";
import { TEXTO_AVISO_DATOS } from "../lib/consentimiento";

/**
 * Registro de carritos, incluidos los que nunca llegan a pedido.
 *
 * Cubre el tramo que antes era invisible: anadir al carrito, abrirlo y
 * empezar el checkout. El pedido solo nace al ENVIAR el formulario, asi que
 * todo lo anterior no dejaba rastro ni siquiera para contarlo.
 */

/** A los 90 dias se borra. La Ley 1581 exige un plazo de conservacion
 *  justificado; "para siempre" no lo es. */
export const DIAS_RETENCION = 90;

// El texto vive en lib/consentimiento.ts: la casilla del checkout y la prueba
// que se archiva aqui tienen que decir exactamente lo mismo.

/** Topes para que una mutacion publica no pueda inflar la base desde fuera.
 *  La llama el navegador de cualquiera, no solo el nuestro. */
const MAX_ITEMS = 20;

/** El embudo solo avanza. El proveedor del carrito escribe con retardo desde
 *  CUALQUIER pagina —incluido el checkout—, asi que su escritura llega
 *  despues de la del checkout y lo devolvia a "carrito". Resolverlo aqui, y
 *  no coordinando los dos efectos en el navegador, hace que el dato sea
 *  correcto sin importar el orden en que lleguen. */
const ORDEN_PASO = { carrito: 0, checkout: 1, enviado: 2 } as const;
const MAX_TEXTO = 200;

function recortar(s: string | undefined, max = MAX_TEXTO): string | undefined {
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t ? t.slice(0, max) : undefined;
}

/**
 * Crea o actualiza el carrito de una sesion. Idempotente por `sesionId`: una
 * misma sesion tiene una sola fila, que se va pisando.
 *
 * PUBLICA a proposito: la llama el navegador del visitante, que no tiene ni
 * puede tener el secreto de administracion. Por eso no lee nada, solo
 * escribe su propia fila, y todo lo que entra viene acotado.
 */
export const registrar = mutation({
  args: {
    sesionId: v.string(),
    /** Solo QUE variante y CUANTAS. Los precios y los nombres se resuelven
     *  aqui contra el catalogo: si el navegador pudiera mandarlos, el dato de
     *  "cuanto dinero se abandona" no valdria nada. Misma regla que el
     *  checkout. */
    items: v.array(
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
            colorPersonalizado: v.optional(
              v.object({ descripcion: v.string() }),
            ),
          }),
        ),
      }),
    ),
    paso: v.union(
      v.literal("carrito"),
      v.literal("checkout"),
      v.literal("enviado"),
    ),
    /** Solo se guarda si `consentimiento` viene con otorgado: true. */
    contacto: v.optional(
      v.object({
        nombre: v.optional(v.string()),
        email: v.optional(v.string()),
        whatsapp: v.optional(v.string()),
      }),
    ),
    consentimiento: v.optional(v.object({ otorgado: v.boolean() })),
  },
  handler: async (ctx, args) => {
    const sesionId = args.sesionId.slice(0, 64);
    if (!sesionId) return null;

    // Precios y nombres desde el catalogo, nunca desde el navegador.
    // Una variante que ya no existe simplemente se descarta: esto es un
    // registro, no un cobro, y no tiene por que fallar entero por una linea.
    const catalogo = await ctx.db
      .query("productos")
      .withIndex("by_activo", (q) => q.eq("activo", true))
      .collect();

    const items = args.items.slice(0, MAX_ITEMS).flatMap((it) => {
      const p = catalogo.find((x) => x.slug === it.slug);
      if (!p) return [];
      const color = p.colores.find((c) => c.id === it.colorId);
      const tamano = p.tamanos.find((t) => t.id === it.tamanoId);
      if (!color || !tamano) return [];
      return [
        {
          slug: p.slug,
          nombre: p.nombre,
          colorId: color.id,
          colorNombre: color.nombre,
          tamanoId: tamano.id,
          tamanoNombre: tamano.nombre,
          cantidad: Math.min(99, Math.max(1, Math.floor(it.cantidad))),
          precioCop: tamano.precioCop,
          ...(it.personalizacion ? { personalizacion: it.personalizacion } : {}),
        },
      ];
    });

    const subtotalCop = items.reduce(
      (s, l) => s + (l.precioCop + addOnsPorUnidad(l.personalizacion)) * l.cantidad,
      0,
    );

    // Un carrito vacio no es un carrito abandonado: es alguien que quito lo
    // que tenia. Se borra la fila en vez de dejar un fantasma que ensucie
    // el embudo.
    const previo = await ctx.db
      .query("carritos")
      .withIndex("by_sesion", (q) => q.eq("sesionId", sesionId))
      .unique();

    if (items.length === 0) {
      if (previo) await ctx.db.delete(previo._id);
      return null;
    }

    // La autorizacion es por conducta: escribir los datos en el formulario,
    // teniendo el aviso a la vista. Se archiva el TEXTO exacto del aviso que
    // esa persona vio y CUANDO, porque el Decreto 1377 pide que la
    // autorizacion pueda consultarse despues y un `true` no dice que se
    // autorizo.
    const consiente = args.consentimiento?.otorgado === true;
    const contacto = consiente && args.contacto
      ? {
          nombre: recortar(args.contacto.nombre),
          email: recortar(args.contacto.email),
          whatsapp: recortar(args.contacto.whatsapp),
        }
      : undefined;

    const ahora = Date.now();
    // Nunca retroceder: ver ORDEN_PASO.
    const paso =
      previo && ORDEN_PASO[previo.paso] > ORDEN_PASO[args.paso]
        ? previo.paso
        : args.paso;

    const campos = {
      sesionId,
      items,
      subtotalCop,
      paso,
      actualizadoEn: ahora,
      // Se conserva lo que ya hubiera si esta vez no viene consentimiento:
      // retirar la casilla no borra lo que ya se autorizo, pero tampoco
      // agrega nada nuevo.
      ...(contacto
        ? {
            contacto,
            consentimiento: {
              otorgado: true,
              en: ahora,
              texto: TEXTO_AVISO_DATOS,
            },
          }
        : {}),
    };

    if (previo) {
      await ctx.db.patch(previo._id, campos);
      return previo._id;
    }
    return await ctx.db.insert("carritos", campos);
  },
});

/**
 * Borra los carritos que pasan de DIAS_RETENCION. La llama el cron diario.
 * Va por lotes para no agotar el limite de una transaccion si algun dia se
 * acumulan muchos.
 */
export const purgarAntiguos = internalMutation({
  args: {},
  handler: async (ctx) => {
    const corte = Date.now() - DIAS_RETENCION * 24 * 60 * 60 * 1000;
    const viejos = await ctx.db
      .query("carritos")
      .withIndex("by_actualizado", (q) => q.lt("actualizadoEn", corte))
      .take(500);
    for (const c of viejos) await ctx.db.delete(c._id);
    return { borrados: viejos.length };
  },
});
