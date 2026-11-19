"use client";

import { useActionState, useState } from "react";
import { cambiarClaveAction } from "@/app/panel/actions";

/**
 * Restablece la clave de una persona del equipo.
 *
 * Empieza plegado. Son tres acciones por fila (permisos, borrado, activar) y
 * un campo de texto abierto en cada una convertía la lista en un formulario
 * largo donde lo normal —mirar quién hay— costaba más que lo excepcional.
 *
 * El campo es `type="text"` a propósito, igual que al crear la persona: quien
 * la escribe se la va a tener que dictar a otro, y una clave en puntitos que
 * no se puede releer se dicta mal una de cada tres veces.
 */
export function CambiarClaveForm({
  usuarioId,
  nombre,
}: {
  usuarioId: string;
  nombre: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [state, action, pending] = useActionState(cambiarClaveAction, undefined);

  if (!abierto) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="h-9 rounded-sm border border-cacao/25 px-3 text-sm text-cacao-suave transition-colors hover:border-cobre hover:text-cobre"
        >
          Cambiar clave
        </button>
        {state?.ok && <p className="text-xs text-[#3f6b3f]">{state.ok}</p>}
      </div>
    );
  }

  return (
    <form
      action={action}
      className="flex w-full flex-wrap items-end gap-2 rounded-sm border border-cacao/15 bg-arena-clara/40 p-3"
    >
      <input type="hidden" name="usuarioId" value={usuarioId} />
      <label className="flex-1 text-sm font-medium">
        Clave nueva para {nombre}
        <input
          name="password"
          type="text"
          required
          minLength={4}
          autoComplete="off"
          className="mt-1 w-full rounded-sm border border-cacao/25 bg-blanco px-3 py-2 text-cacao outline-none focus:border-cobre"
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="h-10 rounded-sm border border-cacao/25 px-3 text-sm text-cacao-suave hover:border-cobre"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-sm bg-cobre px-4 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {state?.error && (
        <p className="w-full text-sm text-[#8a3b32]">{state.error}</p>
      )}
      {state?.ok && <p className="w-full text-sm text-[#3f6b3f]">{state.ok}</p>}
    </form>
  );
}
