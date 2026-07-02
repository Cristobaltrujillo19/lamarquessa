"use client";

import { useActionState, useState } from "react";
import { crearVentaAction } from "@/app/panel/actions";
import { formatCop, ENVIO_COP } from "@/lib/productos";

type Cat = {
  slug: string;
  nombre: string;
  colores: { id: string; nombre: string; hex: string }[];
  tamanos: { id: string; nombre: string; precioCop: number }[];
};
type Linea = { slug: string; colorId: string; tamanoId: string; cantidad: number };

const card = "rounded-lg border border-cacao/10 bg-blanco p-5";
const titulo = "font-titulo text-lg";
const input =
  "mt-1 w-full rounded-sm border border-cacao/25 bg-blanco px-4 py-3 text-cacao outline-none focus:border-cobre";
const select =
  "rounded-sm border border-cacao/25 bg-blanco px-2 py-2 text-sm text-cacao outline-none focus:border-cobre";

const METODOS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia (Nequi/Daviplata)" },
  { value: "tarjeta_mp", label: "Tarjeta (app MP)" },
  { value: "qr_bancolombia", label: "QR Bancolombia" },
] as const;

export function PosForm({
  catalogo,
  stock,
}: {
  catalogo: Cat[];
  stock: Record<string, number>;
}) {
  const [state, action, pending] = useActionState(crearVentaAction, undefined);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [slug, setSlug] = useState(catalogo[0]?.slug ?? "");
  const prod = catalogo.find((p) => p.slug === slug);
  const [colorId, setColorId] = useState(prod?.colores[0]?.id ?? "");
  const [tamanoId, setTamanoId] = useState(prod?.tamanos[0]?.id ?? "");
  const [cantidad, setCantidad] = useState(1);
  const [entrega, setEntrega] = useState<"en_mano" | "envio">("en_mano");
  const [metodo, setMetodo] = useState<string>("efectivo");
  const [descTipo, setDescTipo] = useState<"porcentaje" | "valor">("porcentaje");
  const [descMonto, setDescMonto] = useState(0);

  function cambiarProducto(s: string) {
    setSlug(s);
    const p = catalogo.find((x) => x.slug === s);
    setColorId(p?.colores[0]?.id ?? "");
    setTamanoId(p?.tamanos[0]?.id ?? "");
  }

  const buscar = (s: string) => catalogo.find((p) => p.slug === s);
  const precioDe = (s: string, tId: string) =>
    buscar(s)?.tamanos.find((t) => t.id === tId)?.precioCop ?? 0;
  const nombreDe = (s: string) => buscar(s)?.nombre ?? s;
  const colorNombre = (s: string, cId: string) =>
    buscar(s)?.colores.find((c) => c.id === cId)?.nombre ?? cId;
  const tamanoNombre = (s: string, tId: string) =>
    buscar(s)?.tamanos.find((t) => t.id === tId)?.nombre ?? tId;

  const dispSel = stock[`${slug}|${colorId}|${tamanoId}`] ?? 0;

  function agregar() {
    if (!slug || !colorId || !tamanoId || cantidad <= 0) return;
    setLineas((ls) => {
      const i = ls.findIndex(
        (l) => l.slug === slug && l.colorId === colorId && l.tamanoId === tamanoId,
      );
      if (i >= 0) {
        const cp = [...ls];
        cp[i] = { ...cp[i], cantidad: cp[i].cantidad + cantidad };
        return cp;
      }
      return [...ls, { slug, colorId, tamanoId, cantidad }];
    });
    setCantidad(1);
  }
  const quitar = (i: number) => setLineas((ls) => ls.filter((_, j) => j !== i));

  const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
  const subtotal = lineas.reduce(
    (s, l) => s + precioDe(l.slug, l.tamanoId) * l.cantidad,
    0,
  );
  const descuentoCop =
    descMonto > 0
      ? descTipo === "porcentaje"
        ? Math.round((subtotal * Math.min(100, Math.max(0, descMonto))) / 100)
        : Math.min(subtotal, Math.max(0, descMonto))
      : 0;
  const envio = entrega === "envio" && unidades > 0 ? ENVIO_COP : 0;
  const total = Math.max(0, subtotal - descuentoCop) + envio;

  return (
    <form action={action} className="mt-5 grid gap-5">
      <input type="hidden" name="lineas" value={JSON.stringify(lineas)} />

      {/* Agregar bolso (variante) */}
      <div className={card}>
        <h2 className={titulo}>Bolsos</h2>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs text-cacao-suave">
            Bolso
            <select
              value={slug}
              onChange={(e) => cambiarProducto(e.target.value)}
              className={`${select} mt-1 block`}
            >
              {catalogo.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-cacao-suave">
            Color
            <select
              value={colorId}
              onChange={(e) => setColorId(e.target.value)}
              className={`${select} mt-1 block`}
            >
              {prod?.colores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-cacao-suave">
            Tamaño
            <select
              value={tamanoId}
              onChange={(e) => setTamanoId(e.target.value)}
              className={`${select} mt-1 block`}
            >
              {prod?.tamanos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} · {formatCop(t.precioCop)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-cacao-suave">
            Cant.
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
              className={`${select} mt-1 block w-16`}
            />
          </label>
          <button
            type="button"
            onClick={agregar}
            className="h-10 rounded-sm bg-cobre px-4 text-xs uppercase tracking-[0.14em] text-blanco transition-colors hover:bg-cobre-hondo"
          >
            Agregar
          </button>
        </div>
        <p
          className={`mt-2 text-xs ${
            dispSel <= 0 ? "text-[#8a3b32]" : "text-cacao-suave"
          }`}
        >
          {dispSel <= 0
            ? "Sin stock de esta variante en bodega"
            : `Quedan ${dispSel} en bodega`}
        </p>

        {lineas.length > 0 && (
          <ul className="mt-3 grid gap-2 border-t border-cacao/10 pt-3 text-sm">
            {lineas.map((l, i) => (
              <li key={i} className="flex items-center justify-between gap-3">
                <span>
                  {l.cantidad}× {nombreDe(l.slug)}{" "}
                  <span className="text-cacao-suave">
                    · {colorNombre(l.slug, l.colorId)} · {tamanoNombre(l.slug, l.tamanoId)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span>{formatCop(precioDe(l.slug, l.tamanoId) * l.cantidad)}</span>
                  <button
                    type="button"
                    onClick={() => quitar(i)}
                    aria-label="Quitar"
                    className="text-cacao-suave hover:text-[#8a3b32]"
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Método de pago */}
      <div className={card}>
        <h2 className={titulo}>Método de pago</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {METODOS.map((m) => (
            <label
              key={m.value}
              className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm ${
                metodo === m.value
                  ? "border-cobre bg-arena-clara"
                  : "border-cacao/20"
              }`}
            >
              <input
                type="radio"
                name="metodoPago"
                value={m.value}
                checked={metodo === m.value}
                onChange={() => setMetodo(m.value)}
              />
              {m.label}
            </label>
          ))}
        </div>
        {metodo === "qr_bancolombia" && (
          <p className="mt-3 rounded-sm bg-arena-clara px-3 py-2 text-xs text-cacao-suave">
            Muéstrale al cliente el QR de Bancolombia. Confirma que el pago llegó
            antes de registrar la venta.
          </p>
        )}
      </div>

      {/* Descuento */}
      <div className={card}>
        <h2 className={titulo}>Descuento (opcional)</h2>
        <div className="mt-3 flex items-stretch gap-2">
          <div className="flex overflow-hidden rounded-sm border border-cacao/25">
            <button
              type="button"
              onClick={() => setDescTipo("porcentaje")}
              className={`px-4 text-sm ${
                descTipo === "porcentaje" ? "bg-cobre text-blanco" : "text-cacao-suave"
              }`}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => setDescTipo("valor")}
              className={`px-4 text-sm ${
                descTipo === "valor" ? "bg-cobre text-blanco" : "text-cacao-suave"
              }`}
            >
              $
            </button>
          </div>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={descMonto || ""}
            onChange={(e) => setDescMonto(Math.max(0, Number(e.target.value)))}
            placeholder={descTipo === "porcentaje" ? "Ej: 10 (%)" : "Ej: 20000 ($)"}
            className="flex-1 rounded-sm border border-cacao/25 bg-blanco px-4 py-2 text-cacao outline-none focus:border-cobre"
          />
        </div>
        <input type="hidden" name="descuentoTipo" value={descTipo} />
        <input type="hidden" name="descuentoMonto" value={descMonto} />
        {descuentoCop > 0 && (
          <p className="mt-2 text-xs font-medium text-cobre">
            Descuento: −{formatCop(descuentoCop)}
          </p>
        )}
      </div>

      {/* Entrega */}
      <div className={card}>
        <h2 className={titulo}>Entrega</h2>
        <div className="mt-3 flex gap-2">
          {(
            [
              { v: "en_mano", label: "En mano (sin envío)" },
              { v: "envio", label: "Con envío" },
            ] as const
          ).map((o) => (
            <label
              key={o.v}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border px-3 py-2 text-sm ${
                entrega === o.v ? "border-cobre bg-arena-clara" : "border-cacao/20"
              }`}
            >
              <input
                type="radio"
                name="entrega"
                value={o.v}
                checked={entrega === o.v}
                onChange={() => setEntrega(o.v)}
              />
              {o.label}
            </label>
          ))}
        </div>

        {entrega === "envio" && (
          <div className="mt-4 grid gap-3">
            <label className="block text-sm font-medium">
              Dirección
              <input name="calle" className={input} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                Ciudad
                <input name="ciudad" className={input} />
              </label>
              <label className="block text-sm font-medium">
                Departamento
                <input name="departamento" className={input} />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Notas (opcional)
              <input name="notas" className={input} />
            </label>
          </div>
        )}
      </div>

      {/* Cliente (opcional) */}
      <div className={card}>
        <h2 className={titulo}>Cliente (opcional)</h2>
        <div className="mt-3 grid gap-3">
          <label className="block text-sm font-medium">
            Nombre
            <input name="nombre" className={input} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Correo
              <input name="email" type="email" className={input} />
            </label>
            <label className="block text-sm font-medium">
              WhatsApp
              <input name="whatsapp" inputMode="tel" className={input} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-cacao-suave">
            <input type="checkbox" name="enviarCorreo" />
            Enviarle correo de confirmación (necesita correo)
          </label>
        </div>
      </div>

      {/* Total + enviar */}
      <div className={card}>
        {descuentoCop > 0 && (
          <>
            <div className="flex justify-between text-sm text-cacao-suave">
              <span>Subtotal</span>
              <span>{formatCop(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-cobre">
              <span>Descuento</span>
              <span>−{formatCop(descuentoCop)}</span>
            </div>
          </>
        )}
        <div className="mt-1 flex items-baseline justify-between">
          <span className="font-medium text-cacao">Total</span>
          <span className="font-titulo text-2xl">{formatCop(total)}</span>
        </div>
        {envio > 0 && (
          <p className="mt-1 text-right text-xs text-cacao-suave">
            Incluye envío {formatCop(ENVIO_COP)}
          </p>
        )}
      </div>

      {state?.error && (
        <p className="rounded-sm bg-[#f5e3e1] px-4 py-3 text-sm text-[#8a3b32]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || unidades === 0}
        className="rounded-sm bg-cobre px-6 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo disabled:opacity-50"
      >
        {pending ? "Registrando…" : "Registrar venta"}
      </button>
    </form>
  );
}
