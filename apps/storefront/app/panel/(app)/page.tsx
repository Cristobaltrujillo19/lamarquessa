import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { secreto } from "@/app/panel/lib/auth";
import { ESTADOS, type EstadoPedido, formatFecha } from "@/app/panel/lib/ui";
import { formatCop } from "@/lib/productos";

// Los pedidos cambian seguido: nunca cachear esta página.
export const dynamic = "force-dynamic";

const TABS: { estado?: EstadoPedido; label: string }[] = [
  { label: "Todos" },
  { estado: "pagado", label: "Por despachar" },
  { estado: "enviado", label: "Enviados" },
  { estado: "entregado", label: "Entregados" },
  { estado: "pendiente", label: "Pendientes" },
  { estado: "cancelado", label: "Cancelados" },
];

export default async function PanelHome({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const pedidos = await fetchQuery(api.admin.listarPedidos, { secret: secreto() });

  const filtrados = estado ? pedidos.filter((p) => p.estado === estado) : pedidos;
  const cuenta = (e?: EstadoPedido) =>
    e ? pedidos.filter((p) => p.estado === e).length : pedidos.length;

  return (
    <div>
      <h1 className="font-titulo text-3xl">Pedidos</h1>

      {/* Filtros por estado */}
      <div className="mb-5 mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const activo = estado === t.estado || (!estado && !t.estado);
          const href = t.estado ? `/panel?estado=${t.estado}` : "/panel";
          return (
            <Link
              key={t.label}
              href={href}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                activo
                  ? "bg-cobre text-blanco"
                  : "bg-blanco text-cacao-suave hover:text-cobre"
              }`}
            >
              {t.label} <span className="opacity-60">{cuenta(t.estado)}</span>
            </Link>
          );
        })}
      </div>

      {filtrados.length === 0 ? (
        <p className="rounded-lg border border-cacao/10 bg-blanco p-8 text-center text-cacao-suave">
          No hay pedidos en esta vista.
        </p>
      ) : (
        <ul className="grid gap-3">
          {filtrados.map((p) => {
            const e = ESTADOS[p.estado];
            return (
              <li key={p._id}>
                <Link
                  href={`/panel/pedido/${p._id}`}
                  className="flex items-center gap-4 rounded-lg border border-cacao/10 bg-blanco p-4 transition-colors hover:border-cobre/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-cacao">
                      {p.cliente?.nombre ?? "Cliente"}
                    </p>
                    <p className="text-sm text-cacao-suave">
                      {formatFecha(p._creationTime)} ·{" "}
                      {p.items.reduce((s, i) => s + i.cantidad, 0)} bolso(s)
                      {p.canal === "presencial" && (
                        <span className="ml-1 text-cobre">· Presencial</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${e.clase}`}
                    >
                      {e.label}
                    </span>
                    <p className="mt-1 font-titulo text-lg">{formatCop(p.totalCop)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
