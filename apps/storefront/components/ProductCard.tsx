import Link from "next/link";
import Foto, { altDeFoto } from "./Foto";
import { type Producto, precioDesde, formatCop, muestraColor } from "@/lib/productos";

export default function ProductCard({ producto }: { producto: Producto }) {
  const portada = producto.fotos[0];

  return (
    <Link href={`/producto/${producto.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-arena-clara">
        {portada && (
          <Foto
            src={portada}
            alt={altDeFoto(portada, producto.nombre)}
            ancho={1600}
            alto={1600}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-titulo text-xl text-cacao">{producto.nombre}</h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          {producto.colores.map((c) => (
            <span
              key={c.id}
              title={c.nombre}
              className="h-3 w-3 rounded-full border border-cacao/15"
              style={{ background: muestraColor(c) }}
            />
          ))}
        </div>
        <p className="mt-2 font-cita text-lg text-cacao">
          {formatCop(precioDesde(producto))}
        </p>
      </div>
    </Link>
  );
}
