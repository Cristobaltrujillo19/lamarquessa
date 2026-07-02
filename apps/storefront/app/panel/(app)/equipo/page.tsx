import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { secreto } from "@/app/panel/lib/auth";
import { setUsuarioActivoAction, setPermisoCuentasAction } from "@/app/panel/actions";
import { NuevoUsuarioForm } from "./NuevoUsuarioForm";

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
            </li>
          ))}
        </ul>
      )}

      <NuevoUsuarioForm />
    </div>
  );
}
