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
  // Segundo color, solo para acabados bicolor (Horizonte es negro y rojo). Si
  // está, la muestra del selector se parte en dos en vez de mentir con un
  // color plano. Opcional: los acabados de un solo color no lo llevan.
  hex2: v.optional(v.string()),
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
// si luego se renombra el producto).
export const lineaPedidoV = v.object({
  slug: v.string(),
  nombre: v.string(),
  colorId: v.string(),
  colorNombre: v.string(),
  tamanoId: v.string(),
  tamanoNombre: v.string(),
  cantidad: v.number(),
  precioCop: v.number(),
});

export default defineSchema({
  // Catálogo editable desde el panel (lo lee la tienda). Color × Tamaño.
  productos: defineTable({
    slug: v.string(),
    nombre: v.string(),
    descripcion: v.string(),
    categoria: v.string(),
    colores: v.array(colorV),
    tamanos: v.array(tamanoV),
    fotos: v.array(v.string()),
    insignia: v.optional(v.string()),
    activo: v.boolean(),
    orden: v.number(),
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
