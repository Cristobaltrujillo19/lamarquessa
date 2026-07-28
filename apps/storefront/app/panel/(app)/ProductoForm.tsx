"use client";

import Link from "next/link";
import { useState } from "react";

type Color = { id: string; nombre: string; hex: string };
type Tamano = { id: string; nombre: string; precioCop: number };
type Producto = {
  _id?: string;
  slug: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  colores: Color[];
  tamanos: Tamano[];
  fotos: string[];
  insignia?: string;
};

const input =
  "mt-1 w-full rounded-sm border border-cacao/25 bg-blanco px-3 py-2 focus-visible:border-cobre";

export default function ProductoForm({
  producto,
  action,
  esNuevo,
}: {
  producto?: Producto;
  action: (formData: FormData) => void;
  esNuevo: boolean;
}) {
  const [colores, setColores] = useState<Color[]>(
    producto?.colores ?? [{ id: "arena", nombre: "Arena", hex: "#c1ab99" }],
  );
  const [tamanos, setTamanos] = useState<Tamano[]>(
    producto?.tamanos ?? [
      { id: "mid", nombre: "Mid", precioCop: 0 },
      { id: "mini", nombre: "Mini", precioCop: 0 },
    ],
  );

  const idDesde = (nombre: string) =>
    nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <form action={action} className="space-y-6">
      {!esNuevo && <input type="hidden" name="id" value={producto?._id} />}
      <input type="hidden" name="colores" value={JSON.stringify(colores)} />
      <input type="hidden" name="tamanos" value={JSON.stringify(tamanos)} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Nombre
          <input name="nombre" defaultValue={producto?.nombre} required className={input} />
        </label>
        <label className="block text-sm">
          Slug (URL){esNuevo ? "" : " — no editable"}
          <input
            name="slug"
            defaultValue={producto?.slug}
            required
            readOnly={!esNuevo}
            placeholder="bolso-nombre"
            className={`${input} ${esNuevo ? "" : "opacity-60"}`}
          />
        </label>
      </div>

      <label className="block text-sm">
        Descripción
        <textarea name="descripcion" defaultValue={producto?.descripcion} rows={3} className={input} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Categoría
          <input name="categoria" defaultValue={producto?.categoria ?? "Bolsos"} className={input} />
        </label>
        <label className="block text-sm">
          Insignia (opcional)
          <input name="insignia" defaultValue={producto?.insignia} placeholder="Edición limitada" className={input} />
        </label>
      </div>

      <div>
        <p className="text-sm font-medium">Colores</p>
        <div className="mt-2 space-y-2">
          {colores.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={c.hex}
                onChange={(e) =>
                  setColores((cs) => cs.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))
                }
                className="h-9 w-12 rounded-sm border border-cacao/25"
                aria-label="Color"
              />
              <input
                value={c.nombre}
                onChange={(e) =>
                  setColores((cs) =>
                    cs.map((x, j) =>
                      j === i ? { ...x, nombre: e.target.value, id: idDesde(e.target.value) } : x,
                    ),
                  )
                }
                placeholder="Nombre del color"
                className="flex-1 rounded-sm border border-cacao/25 bg-blanco px-3 py-2"
              />
              <button
                type="button"
                onClick={() => setColores((cs) => cs.filter((_, j) => j !== i))}
                className="px-2 text-cacao-suave hover:text-red-700"
                aria-label="Quitar color"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setColores((cs) => [...cs, { id: "", nombre: "", hex: "#c1ab99" }])}
          className="mt-2 text-sm text-cobre hover:underline"
        >
          + Agregar color
        </button>
      </div>

      <div>
        <p className="text-sm font-medium">Tamaños y precio (COP)</p>
        <div className="mt-2 space-y-2">
          {tamanos.map((t, i) => (
            <div key={t.id} className="flex items-center gap-3">
              <span className="w-16 text-sm">{t.nombre}</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={t.precioCop}
                onChange={(e) =>
                  setTamanos((ts) =>
                    ts.map((x, j) => (j === i ? { ...x, precioCop: Number(e.target.value) } : x)),
                  )
                }
                className="w-44 rounded-sm border border-cacao/25 bg-blanco px-3 py-2"
              />
            </div>
          ))}
        </div>
      </div>

      <label className="block text-sm">
        Fotos (una URL por línea; puedes usar las de muestra en /fotos/…)
        <textarea
          name="fotos"
          defaultValue={producto?.fotos.join("\n")}
          rows={3}
          placeholder={"/fotos/bolso-menorca-impresion-3d-frente.jpg"}
          className={`${input} font-mono text-xs`}
        />
      </label>

      <div className="flex gap-3 pt-2">
        <button className="rounded-sm bg-cobre px-6 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo">
          {esNuevo ? "Crear producto" : "Guardar cambios"}
        </button>
        <Link
          href="/panel/productos"
          className="rounded-sm border border-cacao/25 px-6 py-3 text-xs uppercase tracking-[0.16em] text-cacao"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
