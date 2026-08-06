import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProductCard from "@/components/ProductCard";
import { PRODUCCION_SEMANAS, SITE_URL, urlAbsoluta } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bolsos artesanales hechos a mano en Colombia | La Marquessa",
  description:
    "Descubre la colección de bolsos de La Marquessa: piezas únicas impresas en 3D y terminadas a mano. Hechas a pedido y enviadas a todo el mundo.",
  alternates: { canonical: urlAbsoluta("/tienda") },
};

const schemaMigas = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Colección", item: urlAbsoluta("/tienda") },
  ],
};

export default async function TiendaPage() {
  const items = await fetchQuery(api.productos.catalogo, {});

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMigas) }}
      />

      <div className="text-center">
        <p className="kicker">La colección</p>
        <h1 className="mt-2 font-titulo text-4xl md:text-5xl">
          Todos los <span className="script">bolsos</span>
        </h1>
        {/* Respuesta directa a "¿qué es esto?" en las dos primeras frases:
            es lo que extraen los buscadores con IA para citar. */}
        <p className="mx-auto mt-4 max-w-[62ch] text-cacao-suave">
          Cada bolso de La Marquessa se fabrica uno por uno, combinando impresión
          3D con acabado artesanal a mano. Por eso el relieve nunca cae igual y no
          existen dos piezas idénticas. Se hacen a pedido y están listas en{" "}
          {PRODUCCION_SEMANAS} semanas.
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
