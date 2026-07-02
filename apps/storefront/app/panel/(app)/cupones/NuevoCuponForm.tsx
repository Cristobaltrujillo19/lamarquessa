"use client";

import { useActionState, useState } from "react";
import { crearCuponAction } from "@/app/panel/actions";

const inputClass =
  "mt-1 w-full rounded-sm border border-cacao/25 bg-blanco px-3 py-2 text-cacao outline-none focus:border-cobre";

type Tipo = "porcentaje" | "fijo" | "envio_gratis";

export function NuevoCuponForm() {
  const [state, action, pending] = useActionState(crearCuponAction, undefined);
  const [tipo, setTipo] = useState<Tipo>("porcentaje");

  return (
    <form
      action={action}
      className="mt-6 grid gap-3 rounded-lg border border-cacao/10 bg-blanco p-5"
    >
      <h2 className="font-titulo text-lg">Crear cupón</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Código
          <input
            name="codigo"
            required
            placeholder="BIENVENIDA10"
            autoCapitalize="characters"
            className={`${inputClass} uppercase`}
          />
        </label>
        <label className="block text-sm font-medium">
          Tipo de descuento
          <select
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Tipo)}
            className={inputClass}
          >
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="fijo">Valor fijo ($)</option>
            <option value="envio_gratis">Envío gratis</option>
          </select>
        </label>
      </div>

      {tipo !== "envio_gratis" && (
        <label className="block text-sm font-medium">
          {tipo === "porcentaje" ? "Porcentaje (1–100)" : "Valor del descuento (COP)"}
          <input
            name="valor"
            type="number"
            min="1"
            step="1"
            required
            inputMode="numeric"
            placeholder={tipo === "porcentaje" ? "10" : "20000"}
            className={inputClass}
          />
        </label>
      )}

      <p className="mt-1 text-sm font-medium text-cacao-suave">
        Reglas (todas opcionales)
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm font-medium">
          Vence el
          <input name="vence" type="date" className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Límite de usos
          <input
            name="usosMax"
            type="number"
            min="1"
            step="1"
            placeholder="sin límite"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Compra mínima (COP)
          <input
            name="minCompra"
            type="number"
            min="0"
            step="1"
            placeholder="sin mínimo"
            className={inputClass}
          />
        </label>
      </div>

      {state?.error && (
        <p className="text-sm font-medium text-[#8a3b32]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-cobre px-6 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear cupón"}
      </button>
    </form>
  );
}
