import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { secreto } from "@/app/panel/lib/auth";
import { ajustarInventarioAction } from "@/app/panel/actions";
import { muestraColor } from "@/lib/productos";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const [inv, productos] = await Promise.all([
    fetchQuery(api.admin.listarInventario, { secret: secreto() }),
    fetchQuery(api.productos.listar, { secret: secreto() }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-titulo text-3xl">Inventario</h1>
      <p className="mt-1 text-sm text-cacao-suave">
        Stock por variante (color × tamaño) en la bodega. Agregas producción o
        corriges aquí; el stock baja solo al vender o despachar.
      </p>

      <div className="mt-5 grid gap-4">
        {productos.map((p) => {
          const filas = inv.filter((r) => r.slug === p.slug);
          const total = filas.reduce((s, r) => s + r.cantidad, 0);
          const qty = (colorId: string, tamanoId: string) =>
            filas.find((r) => r.colorId === colorId && r.tamanoId === tamanoId)
              ?.cantidad ?? 0;

          return (
            <div
              key={p._id}
              className="rounded-lg border border-cacao/10 bg-blanco p-5"
            >
              <div className="flex items-center justify-between gap-3 border-b border-cacao/10 pb-3">
                <p className="font-medium text-cacao">
                  {p.nombre}
                  {!p.activo && (
                    <span className="ml-1 text-xs text-cacao-suave">(oculto)</span>
                  )}
                </p>
                <div className="text-right">
                  <p className="text-xs text-cacao-suave">Total</p>
                  <p
                    className={`font-titulo text-2xl ${
                      total <= 0 ? "text-[#8a3b32]" : "text-cacao"
                    }`}
                  >
                    {total}
                  </p>
                </div>
              </div>

              {/* Grilla color × tamaño (solo lectura) */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-cacao-suave">
                      <th className="pb-2 text-left font-normal">Color</th>
                      {p.tamanos.map((t) => (
                        <th key={t.id} className="pb-2 text-center font-normal">
                          {t.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p.colores.map((c) => (
                      <tr key={c.id} className="border-t border-cacao/5">
                        <td className="py-1.5">
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block h-4 w-4 rounded-full border border-cacao/20"
                              style={{ background: muestraColor(c) }}
                            />
                            {c.nombre}
                          </span>
                        </td>
                        {p.tamanos.map((t) => {
                          const n = qty(c.id, t.id);
                          return (
                            <td
                              key={t.id}
                              className={`py-1.5 text-center font-medium ${
                                n <= 0 ? "text-[#8a3b32]" : "text-cacao"
                              }`}
                            >
                              {n}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ajustar una variante (agregar producción o corregir) */}
              <form
                action={ajustarInventarioAction}
                className="mt-3 flex flex-wrap items-end gap-2 border-t border-cacao/10 pt-3"
              >
                <input type="hidden" name="slug" value={p.slug} />
                <label className="text-xs text-cacao-suave">
                  Color
                  <select
                    name="colorId"
                    required
                    className="mt-1 block h-9 rounded-sm border border-cacao/25 bg-blanco px-2 text-sm text-cacao outline-none focus:border-cobre"
                  >
                    {p.colores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-cacao-suave">
                  Tamaño
                  <select
                    name="tamanoId"
                    required
                    className="mt-1 block h-9 rounded-sm border border-cacao/25 bg-blanco px-2 text-sm text-cacao outline-none focus:border-cobre"
                  >
                    {p.tamanos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-cacao-suave">
                  Ajuste
                  <input
                    type="number"
                    name="delta"
                    inputMode="numeric"
                    placeholder="+12 / -1"
                    className="mt-1 block h-9 w-24 rounded-sm border border-cacao/25 bg-blanco px-2 text-sm text-cacao outline-none focus:border-cobre"
                  />
                </label>
                <button
                  type="submit"
                  className="h-9 rounded-sm bg-cobre px-4 text-xs uppercase tracking-[0.14em] text-blanco transition-colors hover:bg-cobre-hondo"
                >
                  Ajustar
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
