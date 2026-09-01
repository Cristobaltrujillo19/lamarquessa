import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Modelo de datos de La Marquessa: catálogo (productos, editable desde el panel)
// + panel de operaciones portado de SER: pedidos, inventario, cupones, finanzas
// y equipo. Dos diferencias de diseño frente a SER:
//  - SIN ferias → inventario de bodega central única (una sola "burbuja").
//  - Inventario y líneas de pedido por VARIANTE (color × tamaño), porque cada
//    bolso existe en varios colores y en dos tamaños (Mid / Mini).
// Sin suscripciones (Comunidad no aplica a esta marca).

export const colorV = v.object({
  id: v.string(),
  nombre: v.string(),
  hex: v.string(),
  // Segundo color, solo para acabados bicolor (Horizonte es rojo y negro). Si
  // está, la muestra del selector se parte en dos en vez de mentir con un
  // color plano. Opcional: los acabados de un solo color no lo llevan.
  hex2: v.optional(v.string()),
  // Frase de una línea que describe el color con el lenguaje de la marca
  // ("Beige cálido. El tono de la arena antes de que llegue nadie."). La
  // muestra el configurador de la ficha. Opcional: los productos sembrados
  // antes de agosto de 2026 no la tienen y renderizan sin ella.
  descripcion: v.optional(v.string()),
  // Foto de referencia del acabado: la familia entera en ese color, sobre
  // fondo neutro. Es lo que abre el panel del selector al pasar el cursor.
  // Ausente = todavía no se ha fotografiado ese acabado, y el panel lo dice
  // en vez de prometer algo que no hay.
  fotoReferencia: v.optional(v.string()),
});

export const tamanoV = v.object({
  id: v.string(),
  nombre: v.string(),
  precioCop: v.number(),
});

export const direccionValidator = v.object({
  calle: v.string(),
  ciudad: v.string(),
  departamento: v.string(),
  notas: v.optional(v.string()),
});

// Una línea de pedido = una variante concreta (color × tamaño) de un bolso, con
// su nombre "congelado" al momento de la venta (para que el histórico no cambie
// si luego se renombra el producto). `precioCop` es la BASE del bolso —los
// add-ons de personalización se cobran encima y su costo se deriva de
// `personalizacion` (lib/personalizacion.ts::addOnsPorUnidad).
export const lineaPedidoV = v.object({
  slug: v.string(),
  nombre: v.string(),
  colorId: v.string(),
  colorNombre: v.string(),
  tamanoId: v.string(),
  tamanoNombre: v.string(),
  cantidad: v.number(),
  precioCop: v.number(),
  // Personalización opcional. Los pedidos viejos no la tienen y el rendering
  // debe tolerar su ausencia. Cuando está, cada unidad de esta línea comparte
  // la misma personalización (el hash del cart evita mezclar variantes).
  personalizacion: v.optional(
    v.object({
      iniciales: v.optional(
        v.object({
          texto: v.string(),
          fuenteId: v.string(),
        }),
      ),
      colorPersonalizado: v.optional(
        v.object({
          descripcion: v.string(),
        }),
      ),
    }),
  ),
});

export default defineSchema({
  // Catálogo editable desde el panel (lo lee la tienda). Color × Tamaño.
  productos: defineTable({
    slug: v.string(),
    nombre: v.string(),
    // Frase corta bajo el H1 (H2 en la ficha). Es el sitio natural para el
    // long-tail: "Mini bolso de mano impreso en 3D, hecho a mano en Colombia".
    // Opcional: productos viejos que aún no lo tienen renderizan sin subtitulo.
    subtitulo: v.optional(v.string()),
    descripcion: v.string(),
    categoria: v.string(),
    colores: v.array(colorV),
    tamanos: v.array(tamanoV),
    fotos: v.array(v.string()),
    insignia: v.optional(v.string()),
    activo: v.boolean(),
    orden: v.number(),
    // Número de serie de la pieza — el "elemento firma" de la interfaz nueva
    // ("Nº 042 · única en el mundo"). Todavía NO se pinta en ninguna parte:
    // falta que el dueño de la marca decida desde qué número arranca el
    // contador. El campo existe para poder sembrarlo sin migración el día
    // que esa decisión se tome. Ver ESTADO.md, "escasez honesta".
    serie: v.optional(v.number()),

    // Qué color enseña cada foto, indexado por su ruta. NO es el color que el
    // visitante tenga seleccionado: si la marca de agua siguiera al selector,
    // elegir Marea estamparía "Marea" sobre un bolso beige.
    //
    // Sirve a tres sitios: la marca de agua de la ficha, el rótulo de la
    // tarjeta de colección, y el filtro por color —que filtra por colores de
    // los que EXISTE foto, no por colores que la pieza "sea": las cuatro se
    // fabrican en los cinco, así que filtrar por pertenencia devolvía o todo
    // o nada.
    //
    // Una ruta ausente del mapa significa "color no identificado", y se
    // rotula como pendiente antes que atribuirle un nombre que no le toca.
    //
    // ⚠️ Riesgo de deriva: el formulario del panel edita `fotos` pero no este
    // mapa. Si se añade una foto desde el panel, entra sin color. Es
    // deliberado —prefiero una foto sin rótulo que un rótulo inventado—,
    // pero conviene resolverlo cuando el panel se rehaga.
    fotoColores: v.optional(v.record(v.string(), v.string())),

    // Las DOS caras del deslizador de rayos X. Son un par: sin las dos, la
    // seccion no se renderiza.
    //
    // ⚠️ TIENEN QUE SALIR DE LA MISMA CAMARA, en la misma escena y al mismo
    // tamano. Por eso la cara opaca es un RENDER propio y no fotos[0]: la
    // fotografia de estudio tiene otro encuadre, otra luz y otro fondo, y el
    // barrido delataria el salto en el primer pixel. Lo unico que cambia
    // entre las dos es el material de la pieza y lo que lleva dentro.
    /** Render opaco, en su color. Es la cara que se ve al empezar. */
    fotoRayosXBase: v.optional(v.string()),
    /** Render translucido, con el contenido a la vista. */
    fotoRayosX: v.optional(v.string()),

    // Ficha técnica: responde objeciones reales de compra ("¿cabe mi celular?")
    // y alimenta el schema Product. Opcionales: los productos viejos no los tienen.
    altoCm: v.optional(v.number()),
    anchoCm: v.optional(v.number()),
    profundidadCm: v.optional(v.number()),
    material: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_activo", ["activo"]),

  clientes: defineTable({
    nombre: v.string(),
    email: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
  }).index("by_email", ["email"]),

  // Equipo que entra al panel (login por persona). La contraseña se guarda como
  // hash scrypt + salt, calculados en el servidor de Next. Nunca en claro.
  usuarios: defineTable({
    usuario: v.string(),
    nombre: v.string(),
    hash: v.string(),
    salt: v.string(),
    activo: v.boolean(),
    // Permiso para ver Finanzas. El master (Administración) siempre puede.
    puedeVerCuentas: v.optional(v.boolean()),
  }).index("by_usuario", ["usuario"]),

  pedidos: defineTable({
    clienteId: v.id("clientes"),
    items: v.array(lineaPedidoV),
    envioCop: v.number(),
    // Descuento aplicado en COP (POS o cupón de la web). Vacío = sin descuento.
    descuentoCop: v.optional(v.number()),
    // Código de cupón aplicado en la compra web (si hubo).
    cupon: v.optional(v.string()),
    totalCop: v.number(),
    // Las ventas presenciales "en mano" no llevan envío ni dirección.
    direccion: v.optional(direccionValidator),
    estado: v.union(
      v.literal("pendiente"),
      v.literal("pagado"),
      v.literal("enviado"),
      v.literal("entregado"),
      v.literal("cancelado"),
    ),
    // Canal de la venta. Los pedidos viejos no lo tienen → se asume "web".
    canal: v.optional(v.union(v.literal("web"), v.literal("presencial"))),
    metodoPago: v.optional(
      v.union(
        v.literal("mercadopago"),
        v.literal("efectivo"),
        v.literal("transferencia"),
        v.literal("tarjeta_mp"),
        v.literal("qr_bancolombia"),
      ),
    ),
    // Quién registró la venta presencial.
    vendedorId: v.optional(v.id("usuarios")),
    // Campos de Mercado Pago (los llena el checkout web cuando se conecte MP).
    mpPreferenceId: v.optional(v.string()),
    mpPaymentId: v.optional(v.string()),
    pagadoEn: v.optional(v.number()),
    enviadoEn: v.optional(v.number()),
    // Datos del despacho (se llenan al marcar "enviado").
    guia: v.optional(v.string()),
    transportadora: v.optional(v.string()),
    urlRastreo: v.optional(v.string()),
  })
    .index("by_estado", ["estado"])
    .index("by_preferencia", ["mpPreferenceId"]),

  // Inventario por variante en la bodega central (sin ferias). Una fila por
  // (slug, colorId, tamanoId). Total de un bolso = suma de sus variantes.
  /**
   * Carritos, incluidos los que nunca llegan a pedido.
   *
   * El pedido se crea al ENVIAR el checkout, asi que todo lo anterior
   * —anadir al carrito, abrirlo, empezar a llenar el formulario— no dejaba
   * ningun rastro. Esta tabla cubre ese tramo.
   *
   * ⚠️ DOS ZONAS CON REGLAS DISTINTAS, y no se pueden mezclar:
   *
   *   Lo anonimo (sesionId, items, paso) NO es dato personal: `sesionId` es
   *   un aleatorio del navegador, no identifica a nadie y no se cruza con
   *   nada. No necesita autorizacion.
   *
   *   `contacto` SI es dato personal, y por eso solo puede escribirse cuando
   *   `consentimiento.otorgado` es true. La Ley 1581 pide autorizacion
   *   previa, expresa e informada, y el Decreto 1377 que quede registrada
   *   para poder consultarla despues: por eso se guarda el TEXTO exacto que
   *   la persona acepto y CUANDO. Sin eso, tener el dato no sirve de nada
   *   aunque este en la base.
   *
   * Se purgan a los 90 dias (convex/crons.ts). El plazo no es estetico: la
   * ley exige que la conservacion tenga un limite justificado.
   */
  carritos: defineTable({
    /** Aleatorio generado en el navegador. No identifica a una persona. */
    sesionId: v.string(),
    items: v.array(lineaPedidoV),
    subtotalCop: v.number(),
    /** Hasta donde llego. Es lo que convierte la tabla en un embudo. */
    paso: v.union(
      v.literal("carrito"),
      v.literal("checkout"),
      v.literal("enviado"),
    ),
    /** Solo con consentimiento otorgado. Ver el aviso de arriba. */
    contacto: v.optional(
      v.object({
        nombre: v.optional(v.string()),
        email: v.optional(v.string()),
        whatsapp: v.optional(v.string()),
      }),
    ),
    consentimiento: v.optional(
      v.object({
        otorgado: v.boolean(),
        en: v.number(),
        /** El texto literal que se le enseno. Es la prueba. */
        texto: v.string(),
      }),
    ),
    actualizadoEn: v.number(),
  })
    .index("by_sesion", ["sesionId"])
    .index("by_actualizado", ["actualizadoEn"]),

  inventario: defineTable({
    slug: v.string(),
    colorId: v.string(),
    tamanoId: v.string(),
    cantidad: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_variante", ["slug", "colorId", "tamanoId"]),

  // Ingresos/egresos manuales del negocio. Las ventas (ingresos por bolsos) ya
  // viven en `pedidos`; aquí van gastos y ajustes registrados a mano.
  movimientos: defineTable({
    tipo: v.union(v.literal("ingreso"), v.literal("egreso")),
    categoria: v.string(),
    montoCop: v.number(),
    fecha: v.number(), // cuándo ocurrió (timestamp en ms)
    nota: v.optional(v.string()),
    registradoPor: v.optional(v.string()),
  }).index("by_fecha", ["fecha"]),

  // Cupones de descuento (compra web). Se crean en el panel y valen al instante
  // (el checkout consulta esta tabla cuando se conecte Mercado Pago).
  cupones: defineTable({
    codigo: v.string(), // se guarda normalizado en MAYÚSCULAS
    tipo: v.union(
      v.literal("porcentaje"),
      v.literal("fijo"),
      v.literal("envio_gratis"),
    ),
    valor: v.number(), // % (porcentaje) o COP (fijo); ignorado en envio_gratis
    activo: v.boolean(),
    expiraEn: v.optional(v.number()), // timestamp; vacío = sin vencimiento
    usosMax: v.optional(v.number()), // límite total de usos; vacío = ilimitado
    usados: v.number(), // cuántas veces se ha usado (cuenta al pagar)
    minCompraCop: v.optional(v.number()), // subtotal mínimo para que aplique
  }).index("by_codigo", ["codigo"]),
});
