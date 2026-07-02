import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProductCard from "@/components/ProductCard";

export const metadata = {
  title: "Colección — La Marquessa",
};

export default async function TiendaPage() {
  const items = await fetchQuery(api.productos.catalogo, {});

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
      <div className="text-center">
        <p className="kicker">La colección</p>
        <h1 className="mt-2 font-titulo text-4xl md:text-5xl">
          Todos los <span className="font-script text-cobre">bolsos</span>
        </h1>
        <p className="mt-3 text-cacao-suave">
          Cada pieza es exclusiva, impresa en 3D con materiales colombianos.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-16 text-center text-cacao-suave">
          Muy pronto verás aquí nuestras piezas.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.slug} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
