"use client";

import { useActionState, useState } from "react";
import { crearMovimientoAction } from "@/app/panel/actions";

const CATS_EGRESO = [
  "Insumos/materiales",
  "Envíos",
  "Comisiones (MP)",
  "Publicidad",
  "Operación",
  "Otros",
];
const CATS_INGRESO = ["Venta directa", "Aporte", "Otro"];

const inputClass =
  "mt-1 w-full rounded-sm border border-cacao/25 bg-blanco px-3 py-2 text-cacao outline-none focus:border-cobre";

function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function MovimientoForm() {
  const [state, action, pending] = useActionState(crearMovimientoAction, undefined);
  const [tipo, setTipo] = useState<"egreso" | "ingreso">("egreso");
  const cats = tipo === "egreso" ? CATS_EGRESO : CATS_INGRESO;

  return (
    <form
      action={action}
      className="mt-6 rounded-lg border border-cacao/10 bg-blanco p-5"
    >
      <h2 className="font-titulo text-lg">Registrar movimiento</h2>

      <div className="mt-3 inline-flex rounded-sm border border-cacao/15 bg-arena-clara p-1">
        {(["egreso", "ingreso"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`rounded-sm px-4 py-1.5 text-sm font-medium transition ${
              tipo === t ? "bg-cobre text-blanco" : "text-cacao-suave"
            }`}
          >
            {t === "egreso" ? "Gasto" : "Ingreso"}
          </button>
        ))}
      </div>
      <input type="hidden" name="tipo" value={tipo} />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Categoría
          <select name="categoria" key={tipo} defaultValue={cats[0]} className={inputClass}>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Monto (COP)
          <input
            name="montoCop"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Fecha
          <input name="fecha" type="date" defaultValue={hoyISO()} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Nota (opcional)
          <input name="nota" placeholder="Detalle" className={inputClass} />
        </label>
      </div>

      {state?.error && (
        <p className="mt-3 text-sm font-medium text-[#8a3b32]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-sm bg-cobre px-6 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Registrar"}
      </button>
    </form>
  );
}
