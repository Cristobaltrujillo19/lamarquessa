import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { secreto } from "@/app/panel/lib/auth";
import { marcarEnviadoAction, marcarEntregadoAction } from "@/app/panel/actions";
import { BotonCancelarPedido } from "./BotonCancelarPedido";
import {
  ESTADOS,
  METODO_PAGO_LABEL,
  formatFecha,
  whatsappLink,
} from "@/app/panel/lib/ui";
import { formatCop } from "@/lib/productos";
import { addOnsPorUnidad, nombreFuente } from "@/lib/personalizacion";
import { TRANSPORTADORAS } from "@/lib/transportadoras";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-sm border border-cacao/25 bg-blanco px-4 py-3 text-cacao outline-none focus:border-cobre";
const tarjeta = "rounded-lg border border-cacao/10 bg-blanco p-5";

export default async function PedidoDetalle({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nueva?: string }>;
}) {
  const { id } = await params;
  const { nueva } = await searchParams;
  const pedido = await fetchQuery(api.admin.detallePedido, {
    secret: secreto(),
    pedidoId: id as Id<"pedidos">,
  });
  if (!pedido) notFound();

  const e = ESTADOS[pedido.estado];
  const wa = whatsappLink(pedido.cliente?.whatsapp);
  const metodo = pedido.metodoPago
    ? METODO_PAGO_LABEL[pedido.metodoPago]
    : "Mercado Pago";
  const esWeb = pedido.canal !== "presencial";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/panel" className="text-sm text-cacao-suave hover:text-cobre">
        ← Volver a pedidos
      </Link>

      {nueva && (
        <p className="mt-4 rounded-sm bg-[#e6efe6] px-4 py-3 text-sm font-medium text-[#3f6b3f]">
          ✓ Venta registrada.
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <h1 className="font-titulo text-3xl">{pedido.cliente?.nombre ?? "Cliente"}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${e.clase}`}>
          {e.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-cacao-suave">
        {formatFecha(pedido._creationTime)} ·{" "}
        {esWeb ? "Compra web" : "Venta presencial"} · Pago: {metodo}
        {pedido.vendedorNombre ? ` · por ${pedido.vendedorNombre}` : ""}
      </p>

      {pedido.items.some((i) => i.personalizacion?.colorPersonalizado) && (
        <div className="mt-4 rounded-lg border-l-4 border-[#c07a2f] bg-[#fff4e0] px-4 py-3 text-sm text-[#5a3d10]">
          <strong>Requiere coordinar color.</strong> Este pedido tiene un color a
          disposición — contactar al cliente por WhatsApp antes de fabricar.
        </div>
      )}

      {/* Items */}
      <div className={`mt-5 ${tarjeta}`}>
        <ul className="grid gap-3">
          {pedido.items.map((i, idx) => {
            const efectivo = i.precioCop + addOnsPorUnidad(i.personalizacion);
            return (
              <li key={idx} className="flex justify-between gap-3 text-sm">
                <span>
                  {i.cantidad}× {i.nombre}{" "}
                  <span className="text-cacao-suave">
                    · {i.colorNombre} · {i.tamanoNombre}
                  </span>
                  {i.personalizacion?.iniciales && (
                    <span className="mt-0.5 block text-xs text-cobre-texto">
                      Iniciales <strong>{i.personalizacion.iniciales.texto}</strong>{" "}
                      ({nombreFuente(i.personalizacion.iniciales.fuenteId)})
                    </span>
                  )}
                  {i.personalizacion?.colorPersonalizado && (
                    <span className="mt-0.5 block text-xs text-cobre-texto">
                      Color: <em>{i.personalizacion.colorPersonalizado.descripcion}</em>
                    </span>
                  )}
                </span>
                <span className="shrink-0">{formatCop(efectivo * i.cantidad)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 space-y-1 border-t border-cacao/10 pt-3 text-sm">
          {pedido.descuentoCop ? (
            <div className="flex justify-between text-cobre">
              <span>Descuento</span>
              <span>−{formatCop(pedido.descuentoCop)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span>Envío</span>
            <span>{formatCop(pedido.envioCop)}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="font-medium text-cacao">Total</span>
            <span className="font-titulo text-xl">{formatCop(pedido.totalCop)}</span>
          </div>
        </div>
      </div>

      {/* Cliente + envío */}
      <div className={`mt-4 grid gap-2 text-sm ${tarjeta}`}>
        {pedido.cliente?.email && (
          <p>
            <span className="text-cacao-suave">Correo:</span> {pedido.cliente.email}
          </p>
        )}
        {pedido.cliente?.whatsapp && (
          <p>
            <span className="text-cacao-suave">WhatsApp:</span> {pedido.cliente.whatsapp}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 font-medium text-cobre hover:underline"
              >
                Escribir →
              </a>
            )}
          </p>
        )}
        {pedido.direccion ? (
          <p>
            <span className="text-cacao-suave">Enviar a:</span>{" "}
            {pedido.direccion.calle}, {pedido.direccion.ciudad},{" "}
            {pedido.direccion.departamento}
            {pedido.direccion.notas ? ` (${pedido.direccion.notas})` : ""}
          </p>
        ) : (
          <p className="text-cacao-suave">Entrega en mano (sin envío).</p>
        )}
        {pedido.transportadora && (
          <p>
            <span className="text-cacao-suave">Transportadora:</span>{" "}
            {pedido.transportadora}
            {pedido.guia ? ` · Guía ${pedido.guia}` : ""}
            {pedido.urlRastreo && (
              <a
                href={pedido.urlRastreo}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 font-medium text-cobre hover:underline"
              >
                Rastrear →
              </a>
            )}
          </p>
        )}
      </div>

      {/* Acciones según el estado */}
      {pedido.estado === "pagado" && (
        <form action={marcarEnviadoAction} className={`mt-4 grid gap-3 ${tarjeta}`}>
          <input type="hidden" name="pedidoId" value={pedido._id} />
          <h2 className="font-titulo text-xl">Marcar como enviado</h2>
          <p className="text-xs text-cacao-suave">
            Al guardar se le manda al cliente el correo &ldquo;tu pedido va en
            camino&rdquo; (si hay correo configurado).
          </p>
          <label className="block text-sm font-medium">
            Transportadora
            <select name="transportadora" defaultValue="coordinadora" className={inputClass}>
              {TRANSPORTADORAS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Número de guía
            <input name="guia" placeholder="Número de la guía" className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Link de rastreo{" "}
            <span className="text-cacao/50">(solo si elegiste &ldquo;Otra&rdquo;)</span>
            <input
              name="urlRastreo"
              type="url"
              placeholder="https://… (opcional)"
              className={inputClass}
            />
          </label>
          <p className="text-xs text-cacao-suave">
            Para las transportadoras de la lista, el link de rastreo se arma solo
            con la guía.
          </p>
          <button
            type="submit"
            className="rounded-sm bg-cobre px-6 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo"
          >
            Marcar enviado
          </button>
        </form>
      )}

      {pedido.estado === "enviado" && (
        <form action={marcarEntregadoAction} className="mt-4">
          <input type="hidden" name="pedidoId" value={pedido._id} />
          <button
            type="submit"
            className="w-full rounded-sm bg-cobre px-6 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo"
          >
            Marcar como entregado
          </button>
        </form>
      )}

      {pedido.estado !== "entregado" && pedido.estado !== "cancelado" && (
        <BotonCancelarPedido pedidoId={pedido._id} />
      )}
    </div>
  );
}
