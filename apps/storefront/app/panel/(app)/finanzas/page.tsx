import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { requireAuth, secreto } from "@/app/panel/lib/auth";
import { puedeVerCuentas } from "@/app/panel/lib/permisos";
import { eliminarMovimientoAction } from "@/app/panel/actions";
import { formatCop } from "@/lib/productos";
import { formatFecha } from "@/app/panel/lib/ui";
import { MovimientoForm } from "./MovimientoForm";

export const dynamic = "force-dynamic";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Tope superior para la vista "Todo el historial" (≈ año 2100).
const HASTA_MAX = 4102444800000;

function mesActual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function desplazarMes(mes: string, delta: number): string {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const tarjeta = "rounded-lg border border-cacao/10 bg-blanco p-5";
const boton = "rounded-sm border border-cacao/25 px-3 py-1 transition-colors hover:border-cobre";

export default async function FinanzasPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; vista?: string }>;
}) {
  const sesion = await requireAuth();
  if (!(await puedeVerCuentas(sesion.uid))) redirect("/panel");

  const sp = await searchParams;
  const todo = sp.vista === "todo";
  const mes = /^\d{4}-\d{2}$/.test(sp.mes ?? "") ? sp.mes! : mesActual();
  const [y, m] = mes.split("-").map(Number);

  const desde = todo ? 0 : new Date(y, m - 1, 1).getTime();
  const hasta = todo ? HASTA_MAX : new Date(y, m, 1).getTime();

  const [reporte, historial] = await Promise.all([
    fetchQuery(api.cuentas.reporteCuentas, { secret: secreto(), desde, hasta }),
    fetchQuery(api.cuentas.historialCuentas, { secret: secreto(), desde, hasta }),
  ]);

  const positivo = reporte.balanceCop >= 0;
  const egresosCats = reporte.egresosPorCategoria;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-titulo text-3xl">Finanzas</h1>
        <div className="flex items-center gap-2 text-sm">
          {todo ? (
            <>
              <span className="text-center">Todo el historial</span>
              <Link href={`/panel/finanzas?mes=${mesActual()}`} className={boton}>
                Ver por mes
              </Link>
            </>
          ) : (
            <>
              <Link
                href={`/panel/finanzas?mes=${desplazarMes(mes, -1)}`}
                className={boton}
                aria-label="Mes anterior"
              >
                ←
              </Link>
              <span className="min-w-[8.5rem] text-center capitalize">
                {MESES[m - 1]} {y}
              </span>
              <Link
                href={`/panel/finanzas?mes=${desplazarMes(mes, 1)}`}
                className={boton}
                aria-label="Mes siguiente"
              >
                →
              </Link>
              <Link href="/panel/finanzas?vista=todo" className={boton}>
                Ver todo
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className={tarjeta}>
          <p className="text-sm font-medium text-cacao-suave">Ingresos</p>
          <p className="mt-1 font-titulo text-2xl text-[#3f6b3f]">
            {formatCop(reporte.ingresosCop)}
          </p>
        </div>
        <div className={tarjeta}>
          <p className="text-sm font-medium text-cacao-suave">Egresos</p>
          <p className="mt-1 font-titulo text-2xl text-[#8a3b32]">
            {formatCop(reporte.egresosCop)}
          </p>
        </div>
        <div
          className={`rounded-lg border border-cacao/10 p-5 ${
            positivo ? "bg-[#e6efe6]" : "bg-[#f5e3e1]"
          }`}
        >
          <p className="text-sm font-medium text-cacao-suave">Balance</p>
          <p
            className={`mt-1 font-titulo text-2xl ${
              positivo ? "text-[#3f6b3f]" : "text-[#8a3b32]"
            }`}
          >
            {formatCop(reporte.balanceCop)}
          </p>
        </div>
      </div>

      {/* Desgloses */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className={tarjeta}>
          <h2 className="font-titulo text-lg">De dónde entró</h2>
          <ul className="mt-3 grid gap-1.5 text-sm">
            <li className="flex justify-between">
              <span className="text-cacao-suave">
                Ventas de bolsos ({reporte.numVentas})
              </span>
              <span className="font-medium">{formatCop(reporte.ventasCop)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-cacao-suave">Otros ingresos</span>
              <span className="font-medium">
                {formatCop(reporte.ingresosManualesCop)}
              </span>
            </li>
          </ul>
        </div>
        <div className={tarjeta}>
          <h2 className="font-titulo text-lg">En qué se fue</h2>
          {egresosCats.length === 0 ? (
            <p className="mt-3 text-sm text-cacao-suave">Sin egresos en este periodo.</p>
          ) : (
            <ul className="mt-3 grid gap-1.5 text-sm">
              {egresosCats.map((e) => (
                <li key={e.categoria} className="flex justify-between">
                  <span className="text-cacao-suave">{e.categoria}</span>
                  <span className="font-medium">{formatCop(e.montoCop)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <MovimientoForm />

      {/* Historial */}
      <h2 className="mt-8 font-titulo text-lg">
        Historial {todo ? "completo" : "del mes"}
      </h2>
      {historial.length === 0 ? (
        <p className="mt-3 rounded-lg border border-cacao/10 bg-blanco p-6 text-center text-cacao-suave">
          No hay movimientos en este periodo.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {historial.map((e) => {
            const ingreso = e.tipo === "ingreso";
            return (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-cacao/10 bg-blanco p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-cacao">{e.concepto}</p>
                  <p className="truncate text-sm text-cacao-suave">
                    {formatFecha(e.fecha)}
                    {e.detalle ? ` · ${e.detalle}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`font-titulo text-lg ${
                      ingreso ? "text-[#3f6b3f]" : "text-[#8a3b32]"
                    }`}
                  >
                    {ingreso ? "+" : "−"}
                    {formatCop(e.montoCop)}
                  </span>
                  {e.borrable && (
                    <form action={eliminarMovimientoAction}>
                      <input type="hidden" name="movimientoId" value={e.id} />
                      <button
                        type="submit"
                        aria-label="Borrar movimiento"
                        className="rounded-sm border border-cacao/25 px-2 py-1 text-xs text-cacao-suave transition-colors hover:border-[#c9a] hover:text-[#8a3b32]"
                      >
                        ✕
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
