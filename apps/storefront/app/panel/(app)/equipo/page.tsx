import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { secreto } from "@/app/panel/lib/auth";
import {
  setUsuarioActivoAction,
  setPermisoCuentasAction,
  setPermisoBorrarPedidosAction,
} from "@/app/panel/actions";
import { NuevoUsuarioForm } from "./NuevoUsuarioForm";
import { CambiarClaveForm } from "./CambiarClaveForm";

export const dynamic = "force-dynamic";

export default async function EquipoPage() {
  const usuarios = await fetchQuery(api.admin.listarUsuarios, { secret: secreto() });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-titulo text-3xl">Equipo</h1>
      <p className="mt-1 text-sm text-cacao-suave">
        Cada persona entra con su propio usuario y clave. Las ventas quedan
        atribuidas a quien las registra. (Tú entras como Administración con el
        usuario <strong>admin</strong>.)
      </p>
      <p className="mt-2 text-sm text-cacao-suave">
        <strong>Borrar pedidos</strong> deja eliminar un pedido en cualquier
        estado, sin cancelarlo antes — también uno pagado, enviado o entregado.
        Esa venta desaparece de Finanzas y no se puede recuperar. Sin este
        permiso solo se pueden borrar los cancelados.
      </p>

      {usuarios.length === 0 ? (
        <p className="mt-5 rounded-lg border border-cacao/10 bg-blanco p-6 text-center text-cacao-suave">
          Aún no hay personas. Crea la primera abajo.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {usuarios.map((u) => (
            <li
              key={u._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cacao/10 bg-blanco p-4"
            >
              {/* `key` por usuario en el formulario de clave: sin él, React
                  reusaría el estado (y el acuse "clave guardada") de una fila
                  al reordenarse la lista, y el mensaje aparecería bajo la
                  persona equivocada. */}
              <div>
                <p className="font-medium text-cacao">
                  {u.nombre}{" "}
                  {!u.activo && (
                    <span className="text-xs text-cacao/40">(inactivo)</span>
                  )}
                  {u.puedeVerCuentas && (
                    <span className="ml-1 rounded-full bg-arena-clara px-2 py-0.5 text-xs font-medium text-cobre">
                      finanzas
                    </span>
                  )}
                  {/* En rojo y no en arena: las otras insignias dicen qué
                      puede VER esta persona; esta dice qué puede destruir. */}
                  {u.puedeBorrarPedidos && (
                    <span className="ml-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
                      borra pedidos
                    </span>
                  )}
                </p>
                <p className="text-sm text-cacao-suave">usuario: {u.usuario}</p>
              </div>
              <div className="flex items-center gap-2">
                <form action={setPermisoCuentasAction}>
                  <input type="hidden" name="usuarioId" value={u._id} />
                  <input
                    type="hidden"
                    name="puede"
                    value={u.puedeVerCuentas ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="h-9 rounded-sm border border-cacao/25 px-3 text-sm text-cacao-suave transition-colors hover:border-cobre hover:text-cobre"
                  >
                    {u.puedeVerCuentas ? "Quitar finanzas" : "Dar finanzas"}
                  </button>
                </form>
                <form action={setPermisoBorrarPedidosAction}>
                  <input type="hidden" name="usuarioId" value={u._id} />
                  <input
                    type="hidden"
                    name="puede"
                    value={u.puedeBorrarPedidos ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="h-9 rounded-sm border border-cacao/25 px-3 text-sm text-cacao-suave transition-colors hover:border-red-700/60 hover:text-red-800"
                  >
                    {u.puedeBorrarPedidos
                      ? "Quitar borrar pedidos"
                      : "Dar borrar pedidos"}
                  </button>
                </form>
                <form action={setUsuarioActivoAction}>
                  <input type="hidden" name="usuarioId" value={u._id} />
                  <input type="hidden" name="activo" value={u.activo ? "false" : "true"} />
                  <button
                    type="submit"
                    className="h-9 rounded-sm border border-cacao/25 px-3 text-sm text-cacao-suave transition-colors hover:border-cobre hover:text-cobre"
                  >
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>
                </form>
              </div>
              <div className="w-full">
                <CambiarClaveForm
                  key={u._id}
                  usuarioId={u._id}
                  nombre={u.nombre}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <NuevoUsuarioForm />
    </div>
  );
}
