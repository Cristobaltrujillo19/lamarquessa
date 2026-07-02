import Link from "next/link";
import { type Producto, precioDesde, formatCop } from "@/lib/productos";

export default function ProductCard({ producto }: { producto: Producto }) {
  return (
    <Link href={`/producto/${producto.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-arena-clara">
        {producto.insignia && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-cobre px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-blanco">
            {producto.insignia}
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={producto.fotos[0]}
          alt={producto.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-3">
        <h3 className="font-titulo text-xl text-cacao">{producto.nombre}</h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          {producto.colores.map((c) => (
            <span
              key={c.id}
              title={c.nombre}
              className="h-3 w-3 rounded-full border border-cacao/15"
              style={{ background: c.hex }}
            />
          ))}
        </div>
        <p className="mt-2 font-cita text-lg text-cacao">
          Desde {formatCop(precioDesde(producto))}
        </p>
      </div>
    </Link>
  );
}
