import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { secreto } from "@/app/panel/lib/auth";
import { accionToggle, accionEliminar } from "@/app/panel/actions";
import { formatCop } from "@/lib/productos";

export const dynamic = "force-dynamic";

export default async function PanelProductos() {
  const items = await fetchQuery(api.productos.listar, { secret: secreto() });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-titulo text-3xl">Productos ({items.length})</h1>
        <Link
          href="/panel/nuevo"
          className="rounded-sm bg-cobre px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo"
        >
          + Nuevo
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-cacao-suave">
          Aún no hay productos. Crea el primero con “+ Nuevo”.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-cacao/10 border-y border-cacao/10">
          {items.map((p) => (
            <div key={p._id} className="flex items-center gap-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.fotos[0] ?? "/marca/logo-cobre.png"}
                alt=""
                className="h-16 w-14 rounded-sm bg-arena-clara object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {p.nombre}{" "}
                  {!p.activo && (
                    <span className="text-xs font-normal text-cacao-suave">(oculto)</span>
                  )}
                </p>
                <p className="text-xs text-cacao-suave">
                  {p.colores.length} colores · desde{" "}
                  {formatCop(Math.min(...p.tamanos.map((t) => t.precioCop)))}
                </p>
              </div>
              <Link href={`/panel/editar/${p._id}`} className="text-sm text-cobre hover:underline">
                Editar
              </Link>
              <form action={accionToggle}>
                <input type="hidden" name="id" value={p._id} />
                <input type="hidden" name="activo" value={(!p.activo).toString()} />
                <button className="text-sm text-cacao-suave transition-colors hover:text-cobre">
                  {p.activo ? "Ocultar" : "Mostrar"}
                </button>
              </form>
              <form action={accionEliminar}>
                <input type="hidden" name="id" value={p._id} />
                <button className="text-sm text-cacao-suave transition-colors hover:text-red-700">
                  Eliminar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
