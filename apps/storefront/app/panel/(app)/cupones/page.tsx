import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { secreto } from "@/app/panel/lib/auth";
import { setCuponActivoAction, eliminarCuponAction } from "@/app/panel/actions";
import { formatCop } from "@/lib/productos";
import { formatFecha } from "@/app/panel/lib/ui";
import { NuevoCuponForm } from "./NuevoCuponForm";

export const dynamic = "force-dynamic";

function descripcionDescuento(c: { tipo: string; valor: number }): string {
  if (c.tipo === "porcentaje") return `${c.valor}% off`;
  if (c.tipo === "fijo") return `${formatCop(c.valor)} off`;
  return "Envío gratis";
}

export default async function CuponesPage() {
  const cupones = await fetchQuery(api.cupones.listarCupones, { secret: secreto() });
  const ahora = Date.now();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-titulo text-3xl">Cupones</h1>
      <p className="mt-1 text-sm text-cacao-suave">
        Códigos de descuento para la compra web. Valen al instante en el checkout
        (cuando esté conectado Mercado Pago).
      </p>

      {cupones.length === 0 ? (
        <p className="mt-5 rounded-lg border border-cacao/10 bg-blanco p-6 text-center text-cacao-suave">
          Aún no hay cupones. Crea el primero abajo.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {cupones.map((c) => {
            const vencido = c.expiraEn !== undefined && ahora > c.expiraEn;
            const agotado = c.usosMax !== undefined && c.usados >= c.usosMax;
            const vigente = c.activo && !vencido && !agotado;
            const motivo = !c.activo
              ? "inactivo"
              : vencido
                ? "vencido"
                : agotado
                  ? "agotado"
                  : null;
            return (
              <li
                key={c._id}
                className="flex items-start justify-between gap-4 rounded-lg border border-cacao/10 bg-blanco p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-cacao">
                    {c.codigo}{" "}
                    <span className="ml-1 text-sm font-medium text-cobre">
                      {descripcionDescuento(c)}
                    </span>
                    {!vigente && motivo && (
                      <span className="ml-1 text-xs text-cacao/40">({motivo})</span>
                    )}
                  </p>
                  <p className="text-sm text-cacao-suave">
                    {c.usosMax !== undefined
                      ? `${c.usados}/${c.usosMax} usos`
                      : `${c.usados} usos`}
                    {c.expiraEn !== undefined
                      ? ` · vence ${formatFecha(c.expiraEn)}`
                      : ""}
                    {c.minCompraCop !== undefined
                      ? ` · mín. ${formatCop(c.minCompraCop)}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <form action={setCuponActivoAction}>
                    <input type="hidden" name="cuponId" value={c._id} />
                    <input
                      type="hidden"
                      name="activo"
                      value={c.activo ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className="h-9 rounded-sm border border-cacao/25 px-3 text-sm text-cacao-suave transition-colors hover:border-cobre hover:text-cobre"
                    >
                      {c.activo ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                  <form action={eliminarCuponAction}>
                    <input type="hidden" name="cuponId" value={c._id} />
                    <button
                      type="submit"
                      aria-label="Borrar cupón"
                      className="h-9 rounded-sm border border-cacao/25 px-2 text-sm text-cacao-suave transition-colors hover:border-[#c9a] hover:text-[#8a3b32]"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <NuevoCuponForm />
    </div>
  );
}
