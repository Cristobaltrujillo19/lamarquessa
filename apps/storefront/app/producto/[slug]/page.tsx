import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProductCard from "@/components/ProductCard";
import Galeria from "./Galeria";
import ComprarPanel from "./ComprarPanel";

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = await fetchQuery(api.productos.obtener, { slug });
  if (!producto || !producto.activo) notFound();

  const todos = await fetchQuery(api.productos.catalogo, {});
  const relacionados = todos.filter((p) => p.slug !== producto.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
      <Link href="/tienda" className="text-sm text-cacao-suave transition-colors hover:text-cobre">
        ← Volver a la colección
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-14">
        <Galeria fotos={producto.fotos} nombre={producto.nombre} />

        <div>
          {producto.insignia && (
            <span className="inline-block rounded-full bg-cobre px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-blanco">
              {producto.insignia}
            </span>
          )}
          <h1 className="mt-3 font-titulo text-4xl md:text-5xl">{producto.nombre}</h1>
          <p className="mt-4 leading-relaxed text-cacao-suave">{producto.descripcion}</p>

          <ComprarPanel producto={producto} />

          <div className="mt-8 border-t border-cacao/10">
            <details className="border-b border-cacao/10 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between font-titulo text-lg">
                Materiales y cuidado
                <span className="text-cobre">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-cacao-suave">
                Diseñada e impresa en 3D, terminada a mano con materiales colombianos. Limpia con
                un paño suave y seco; evita la exposición prolongada al sol.
              </p>
            </details>
            <details className="border-b border-cacao/10 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between font-titulo text-lg">
                Envíos y devoluciones
                <span className="text-cobre">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-cacao-suave">
                Envíos a todo Colombia. Cambios y devoluciones dentro de los 15 días posteriores a
                la entrega.
              </p>
            </details>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-20 md:mt-28">
          <h2 className="text-center font-titulo text-3xl">También te puede gustar</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {relacionados.map((p) => (
              <ProductCard key={p.slug} producto={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
