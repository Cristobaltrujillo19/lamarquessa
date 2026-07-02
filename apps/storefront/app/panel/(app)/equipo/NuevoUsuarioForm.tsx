"use client";

import { useActionState } from "react";
import { crearUsuarioAction } from "@/app/panel/actions";

const inputClass =
  "mt-1 w-full rounded-sm border border-cacao/25 bg-blanco px-4 py-3 text-cacao outline-none focus:border-cobre";

export function NuevoUsuarioForm() {
  const [state, action, pending] = useActionState(crearUsuarioAction, undefined);
  return (
    <form
      action={action}
      className="mt-5 grid gap-3 rounded-lg border border-cacao/10 bg-blanco p-5"
    >
      <h2 className="font-titulo text-lg">Agregar persona</h2>
      <label className="block text-sm font-medium">
        Nombre
        <input name="nombre" required className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Usuario (para entrar)
          <input name="usuario" required autoCapitalize="none" className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Contraseña
          <input name="password" type="text" required className={inputClass} />
        </label>
      </div>
      {state?.error && <p className="text-sm text-[#8a3b32]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-cobre px-6 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear persona"}
      </button>
    </form>
  );
}
