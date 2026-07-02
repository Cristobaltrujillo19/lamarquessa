"use client";

import { useActionState } from "react";
import { login } from "@/app/panel/actions";

const inputClass =
  "mt-1 w-full rounded-sm border border-cacao/25 bg-blanco px-4 py-3 text-cacao outline-none focus:border-cobre";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <div className="rounded-sm bg-blanco p-8 shadow-[0_10px_30px_rgba(74,58,44,0.12)]">
        <div className="mb-6 text-center">
          <h1 className="font-titulo text-3xl">Panel</h1>
          <p className="mt-1 text-sm text-cacao-suave">La Marquessa · entra con tu usuario</p>
        </div>

        <form action={action} className="grid gap-4">
          <label className="block text-sm font-medium text-cacao">
            Usuario
            <input name="usuario" required autoFocus autoComplete="username" className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-cacao">
            Contraseña
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </label>

          {state?.error && (
            <p className="rounded-sm bg-[#f5e3e1] px-4 py-3 text-sm text-[#8a3b32]">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-sm bg-cobre px-6 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
