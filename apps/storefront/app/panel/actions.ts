"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { transportadoraNombre, urlRastreo } from "@/lib/transportadoras";
import {
  COOKIE_MAX_AGE,
  COOKIE_NAME,
  crearToken,
  esMasterPassword,
  hashPassword,
  requireAuth,
  secreto,
  verifyPassword,
} from "./lib/auth";
import { puedeVerCuentas } from "./lib/permisos";

export type FormState = { error?: string } | undefined;

type MetodoPago = "efectivo" | "transferencia" | "tarjeta_mp" | "qr_bancolombia";

const secret = () => secreto();

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/panel",
  maxAge: COOKIE_MAX_AGE,
};

// === Login / logout ===
export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const usuario = String(formData.get("usuario") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  let sesion: { uid: string; nombre: string };
  if (usuario === "admin") {
    if (!esMasterPassword(password)) return { error: "Clave incorrecta." };
    sesion = { uid: "master", nombre: "Administración" };
  } else {
    const u = await fetchQuery(api.admin.usuarioPorNombre, {
      secret: secret(),
      usuario,
    });
    if (!u || !u.activo || !verifyPassword(password, u.hash, u.salt)) {
      return { error: "Usuario o clave incorrectos." };
    }
    sesion = { uid: u._id, nombre: u.nombre };
  }

  const c = await cookies();
  c.set(COOKIE_NAME, crearToken(sesion), cookieOpts);
  redirect("/panel");
}

export async function logout(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
  redirect("/panel/login");
}

// === Despacho ===
export async function marcarEnviadoAction(formData: FormData): Promise<void> {
  await requireAuth();
  const pedidoId = String(formData.get("pedidoId")) as Id<"pedidos">;
  const transId = String(formData.get("transportadora") ?? "").trim();
  const guia = String(formData.get("guia") ?? "").trim();
  const urlCustom = String(formData.get("urlRastreo") ?? "").trim();
  // Nombre legible + link de rastreo (de la plantilla de la transportadora, o el
  // link pegado a mano para "Otra").
  const nombre = transId ? transportadoraNombre(transId) : undefined;
  const url = urlCustom || (transId ? urlRastreo(transId, guia) : undefined);
  await fetchMutation(api.admin.marcarEnviado, {
    secret: secret(),
    pedidoId,
    transportadora: nombre,
    guia: guia || undefined,
    urlRastreo: url || undefined,
  });
  revalidatePath("/panel");
  revalidatePath(`/panel/pedido/${pedidoId}`);
}

export async function marcarEntregadoAction(formData: FormData): Promise<void> {
  await requireAuth();
  const pedidoId = String(formData.get("pedidoId")) as Id<"pedidos">;
  await fetchMutation(api.admin.marcarEntregado, { secret: secret(), pedidoId });
  revalidatePath("/panel");
  revalidatePath(`/panel/pedido/${pedidoId}`);
}

export async function cancelarPedidoAction(formData: FormData): Promise<void> {
  await requireAuth();
  const pedidoId = String(formData.get("pedidoId")) as Id<"pedidos">;
  await fetchMutation(api.admin.cancelarPedido, { secret: secret(), pedidoId });
  revalidatePath("/panel");
  revalidatePath(`/panel/pedido/${pedidoId}`);
}

/** Borra permanentemente el pedido y vuelve a la lista. El server-side de
 *  Convex ya bloquea eliminar cualquier estado que no sea "cancelado". */
export async function eliminarPedidoAction(formData: FormData): Promise<void> {
  await requireAuth();
  const pedidoId = String(formData.get("pedidoId")) as Id<"pedidos">;
  await fetchMutation(api.admin.eliminarPedido, { secret: secret(), pedidoId });
  revalidatePath("/panel");
  redirect("/panel?estado=cancelado");
}

/** Limpieza masiva de todos los pedidos en estado "cancelado". */
export async function eliminarCanceladosMasivoAction(): Promise<void> {
  await requireAuth();
  await fetchMutation(api.admin.eliminarCanceladosMasivo, { secret: secret() });
  revalidatePath("/panel");
  redirect("/panel");
}

// === POS: venta presencial ===
export async function crearVentaAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const sesion = await requireAuth();

  type LineaIn = { slug: string; colorId: string; tamanoId: string; cantidad: number };
  let lineas: LineaIn[] = [];
  try {
    lineas = JSON.parse(String(formData.get("lineas") ?? "[]")) as LineaIn[];
  } catch {
    lineas = [];
  }
  const items = lineas
    .map((l) => ({
      slug: String(l.slug ?? ""),
      colorId: String(l.colorId ?? ""),
      tamanoId: String(l.tamanoId ?? ""),
      cantidad: Math.max(0, Math.floor(Number(l.cantidad) || 0)),
    }))
    .filter((l) => l.slug && l.colorId && l.tamanoId && l.cantidad > 0);
  if (items.length === 0) return { error: "Agrega al menos un bolso a la venta." };

  const metodoPago = String(formData.get("metodoPago") ?? "") as MetodoPago;
  if (!["efectivo", "transferencia", "tarjeta_mp", "qr_bancolombia"].includes(metodoPago)) {
    return { error: "Elige un método de pago." };
  }

  const entrega = formData.get("entrega") === "envio" ? "envio" : "en_mano";

  let direccion;
  if (entrega === "envio") {
    const calle = String(formData.get("calle") ?? "").trim();
    const ciudad = String(formData.get("ciudad") ?? "").trim();
    const departamento = String(formData.get("departamento") ?? "").trim();
    if (!calle || !ciudad || !departamento) {
      return { error: "Para una venta con envío necesitas dirección completa." };
    }
    const notas = String(formData.get("notas") ?? "").trim();
    direccion = { calle, ciudad, departamento, notas: notas || undefined };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();

  const descuentoTipo: "porcentaje" | "valor" =
    formData.get("descuentoTipo") === "valor" ? "valor" : "porcentaje";
  const descuentoMonto = Math.max(0, Number(formData.get("descuentoMonto") ?? 0));
  const descuento =
    descuentoMonto > 0 ? { tipo: descuentoTipo, monto: descuentoMonto } : undefined;

  const vendedorId =
    sesion.uid !== "master" ? (sesion.uid as Id<"usuarios">) : undefined;

  let pedidoId: Id<"pedidos">;
  try {
    pedidoId = await fetchMutation(api.admin.crearVentaPresencial, {
      secret: secret(),
      items,
      metodoPago,
      entrega,
      vendedorId,
      cliente: {
        nombre: nombre || undefined,
        email: email || undefined,
        whatsapp: whatsapp || undefined,
      },
      direccion,
      descuento,
      enviarCorreo: formData.get("enviarCorreo") === "on" && Boolean(email),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo registrar la venta." };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/inventario");
  redirect(`/panel/pedido/${pedidoId}?nueva=1`);
}

// === Inventario (por variante) ===
export async function ajustarInventarioAction(formData: FormData): Promise<void> {
  await requireAuth();
  const slug = String(formData.get("slug") ?? "");
  const colorId = String(formData.get("colorId") ?? "");
  const tamanoId = String(formData.get("tamanoId") ?? "");
  const delta = Math.trunc(Number(formData.get("delta") ?? 0));
  if (!slug || !colorId || !tamanoId || !Number.isFinite(delta) || delta === 0) return;
  await fetchMutation(api.admin.ajustarInventario, {
    secret: secret(),
    slug,
    colorId,
    tamanoId,
    delta,
  });
  revalidatePath("/panel/inventario");
}

// === Equipo / usuarios ===
export async function crearUsuarioAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const usuario = String(formData.get("usuario") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!nombre || !usuario) return { error: "Nombre y usuario son obligatorios." };
  if (password.length < 4) return { error: "La clave debe tener al menos 4 caracteres." };
  if (usuario === "admin") return { error: "El usuario 'admin' está reservado." };
  const { hash, salt } = hashPassword(password);
  try {
    await fetchMutation(api.admin.crearUsuario, {
      secret: secret(),
      usuario,
      nombre,
      hash,
      salt,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo crear el usuario." };
  }
  revalidatePath("/panel/equipo");
  redirect("/panel/equipo");
}

export async function setUsuarioActivoAction(formData: FormData): Promise<void> {
  await requireAuth();
  const usuarioId = String(formData.get("usuarioId") ?? "") as Id<"usuarios">;
  const activo = formData.get("activo") === "true";
  if (!usuarioId) return;
  await fetchMutation(api.admin.setUsuarioActivo, {
    secret: secret(),
    usuarioId,
    activo,
  });
  revalidatePath("/panel/equipo");
}

export async function setPermisoCuentasAction(formData: FormData): Promise<void> {
  const sesion = await requireAuth();
  if (sesion.uid !== "master") return; // solo Administración asigna permisos
  const usuarioId = String(formData.get("usuarioId") ?? "") as Id<"usuarios">;
  const puede = formData.get("puede") === "true";
  if (!usuarioId) return;
  await fetchMutation(api.admin.setPermisoCuentas, {
    secret: secret(),
    usuarioId,
    puede,
  });
  revalidatePath("/panel/equipo");
}

// === Finanzas ===
export async function crearMovimientoAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const sesion = await requireAuth();
  if (!(await puedeVerCuentas(sesion.uid))) return { error: "Sin permiso." };

  const tipo = formData.get("tipo") === "ingreso" ? "ingreso" : "egreso";
  const categoria = String(formData.get("categoria") ?? "").trim();
  const montoCop = Math.round(Number(formData.get("montoCop") ?? 0));
  const fechaStr = String(formData.get("fecha") ?? "");
  const nota = String(formData.get("nota") ?? "").trim();

  if (!categoria) return { error: "Elige o escribe una categoría." };
  if (!Number.isFinite(montoCop) || montoCop <= 0) {
    return { error: "El monto debe ser mayor a 0." };
  }
  // El input date da "YYYY-MM-DD"; lo anclamos a mediodía local para no cruzar día.
  const fecha = fechaStr ? Date.parse(`${fechaStr}T12:00:00`) : Date.now();

  try {
    await fetchMutation(api.cuentas.crearMovimiento, {
      secret: secret(),
      tipo,
      categoria,
      montoCop,
      fecha,
      nota: nota || undefined,
      registradoPor: sesion.nombre,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo registrar." };
  }
  revalidatePath("/panel/finanzas");
  return undefined;
}

export async function eliminarMovimientoAction(formData: FormData): Promise<void> {
  const sesion = await requireAuth();
  if (!(await puedeVerCuentas(sesion.uid))) return;
  const movimientoId = String(formData.get("movimientoId") ?? "") as Id<"movimientos">;
  if (!movimientoId) return;
  await fetchMutation(api.cuentas.eliminarMovimiento, {
    secret: secret(),
    movimientoId,
  });
  revalidatePath("/panel/finanzas");
}

// === Cupones ===
export async function crearCuponAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();
  const codigo = String(formData.get("codigo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "") as
    | "porcentaje"
    | "fijo"
    | "envio_gratis";
  if (!["porcentaje", "fijo", "envio_gratis"].includes(tipo)) {
    return { error: "Elige un tipo de descuento." };
  }
  if (!codigo) return { error: "El código es obligatorio." };
  const valor =
    tipo === "envio_gratis" ? 0 : Math.round(Number(formData.get("valor") ?? 0));
  const venceStr = String(formData.get("vence") ?? "");
  const usosMaxRaw = Number(formData.get("usosMax") ?? 0);
  const minCompraRaw = Number(formData.get("minCompra") ?? 0);
  // El input date da "YYYY-MM-DD"; el cupón vale hasta el final de ese día.
  const expiraEn = venceStr ? Date.parse(`${venceStr}T23:59:59`) : undefined;
  const usosMax = usosMaxRaw > 0 ? Math.floor(usosMaxRaw) : undefined;
  const minCompraCop = minCompraRaw > 0 ? Math.round(minCompraRaw) : undefined;

  try {
    await fetchMutation(api.cupones.crearCupon, {
      secret: secret(),
      codigo,
      tipo,
      valor,
      expiraEn,
      usosMax,
      minCompraCop,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo crear el cupón." };
  }
  revalidatePath("/panel/cupones");
  redirect("/panel/cupones");
}

export async function setCuponActivoAction(formData: FormData): Promise<void> {
  await requireAuth();
  const cuponId = String(formData.get("cuponId") ?? "") as Id<"cupones">;
  const activo = formData.get("activo") === "true";
  if (!cuponId) return;
  await fetchMutation(api.cupones.setCuponActivo, {
    secret: secret(),
    cuponId,
    activo,
  });
  revalidatePath("/panel/cupones");
}

export async function eliminarCuponAction(formData: FormData): Promise<void> {
  await requireAuth();
  const cuponId = String(formData.get("cuponId") ?? "") as Id<"cupones">;
  if (!cuponId) return;
  await fetchMutation(api.cupones.eliminarCupon, { secret: secret(), cuponId });
  revalidatePath("/panel/cupones");
}

// === Productos (catálogo editable) ===
function refrescar() {
  revalidatePath("/panel/productos");
  revalidatePath("/tienda");
  revalidatePath("/");
}

type ColorIn = { id: string; nombre: string; hex: string; hex2?: string };
type TamanoIn = { id: string; nombre: string; precioCop: number };

function parseProducto(formData: FormData) {
  const colores = JSON.parse(String(formData.get("colores") ?? "[]")) as ColorIn[];
  const tamanos = JSON.parse(String(formData.get("tamanos") ?? "[]")) as TamanoIn[];
  const fotos = String(formData.get("fotos") ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const insignia = String(formData.get("insignia") ?? "").trim() || undefined;
  return {
    nombre: String(formData.get("nombre") ?? "").trim(),
    descripcion: String(formData.get("descripcion") ?? "").trim(),
    categoria: String(formData.get("categoria") ?? "Bolsos").trim() || "Bolsos",
    colores: colores.map((c) => ({
      id: c.id || c.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      nombre: c.nombre,
      hex: c.hex,
      // Solo viaja si el acabado es bicolor: JSON.stringify ya descarta el
      // undefined cuando se quita el segundo color desde el formulario.
      ...(c.hex2 ? { hex2: c.hex2 } : {}),
    })),
    tamanos: tamanos.map((t) => ({
      id: t.id,
      nombre: t.nombre,
      precioCop: Math.round(Number(t.precioCop) || 0),
    })),
    fotos,
    insignia,
  };
}

export async function accionCrear(formData: FormData) {
  await requireAuth();
  const p = parseProducto(formData);
  await fetchMutation(api.productos.crear, {
    secret: secret(),
    slug: String(formData.get("slug") ?? "").trim(),
    ...p,
  });
  refrescar();
  redirect("/panel/productos");
}

export async function accionActualizar(formData: FormData) {
  await requireAuth();
  const p = parseProducto(formData);
  await fetchMutation(api.productos.actualizar, {
    secret: secret(),
    id: formData.get("id") as Id<"productos">,
    ...p,
  });
  refrescar();
  redirect("/panel/productos");
}

export async function accionToggle(formData: FormData) {
  await requireAuth();
  await fetchMutation(api.productos.setActivo, {
    secret: secret(),
    id: formData.get("id") as Id<"productos">,
    activo: formData.get("activo") === "true",
  });
  refrescar();
}

export async function accionEliminar(formData: FormData) {
  await requireAuth();
  await fetchMutation(api.productos.eliminar, {
    secret: secret(),
    id: formData.get("id") as Id<"productos">,
  });
  refrescar();
}
