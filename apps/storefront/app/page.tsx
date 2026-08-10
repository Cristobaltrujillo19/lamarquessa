import Link from "next/link";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProductCard from "@/components/ProductCard";
import Hero from "@/components/marca/Hero";
import Beneficios from "@/components/marca/Beneficios";
import Editorial from "@/components/marca/Editorial";
import FranjaIconos from "@/components/marca/FranjaIconos";
import { DESCRIPCION_MARCA, urlAbsoluta } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bolsos únicos impresos en 3D y hechos a mano | La Marquessa",
  description:
    "Bolsos impresos en 3D y hechos a mano en Colombia. Cada pieza es única — no existen dos iguales. Fabricados a pedido, listos en 2 semanas. Envíos globales.",
  alternates: { canonical: urlAbsoluta("/") },
};

export default async function Home() {
  const destacados = await fetchQuery(api.productos.catalogo, {});

  return (
    <>
      <Hero />
      <Beneficios />

      <section id="coleccion" className="seccion">
        <div className="contenedor">
          <header className="reveal" style={{ textAlign: "center" }}>
            <p className="kicker">La colección</p>
            <h2 className="titulo-seccion">
              Nuestros <span className="script">bolsos</span>
            </h2>
            <p
              style={{
                margin: "18px auto 0",
                maxWidth: "58ch",
                color: "var(--cacao-suave)",
              }}
            >
              {DESCRIPCION_MARCA}
            </p>
          </header>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {destacados.map((p) => (
              <ProductCard key={p.slug} producto={p} />
            ))}
          </div>

          {destacados.length === 0 && (
            <p className="mt-12 text-center text-cacao-suave">
              Muy pronto verás aquí nuestras piezas.
            </p>
          )}
        </div>
      </section>

      {/* El proceso (ComoSeHace) y el manifiesto viven ahora solo en /nosotros:
          estaban duplicados aquí y allá. En su lugar, un segundo carrete con
          las fotos editoriales que no se mostraban en ningún sitio. */}
      <Editorial />
      <FranjaIconos />

      <section className="seccion" style={{ background: "var(--arena-clara)" }}>
        <div className="contenedor reveal" style={{ textAlign: "center" }}>
          <h2 className="titulo-seccion">
            Elige el <span className="script">tuyo</span>
          </h2>
          <p
            style={{
              margin: "18px auto 32px",
              maxWidth: "46ch",
              color: "var(--cacao-suave)",
            }}
          >
            Cada bolso se fabrica a pedido y llega en poco más de dos semanas.
            El que elijas será el único con ese relieve.
          </p>
          <Link className="boton boton-primario" href="/tienda">
            Ver la colección
          </Link>
        </div>
      </section>
    </>
  );
}
