import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProductCard from "@/components/ProductCard";
import Galeria from "./Galeria";
import ComprarPanel from "./ComprarPanel";
import { formatCm } from "@/lib/productos";
import {
  MARCA,
  PRODUCCION_SEMANAS,
  SITE_URL,
  urlAbsoluta,
} from "@/lib/site";

// Resumen corto para el meta description: la primera frase de la descripción,
// recortada a la longitud que muestran los buscadores.
function resumen(texto: string, max = 155): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max);
  return corte.slice(0, corte.lastIndexOf(" ")) + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = await fetchQuery(api.productos.obtener, { slug });
  if (!producto) return { title: "Bolso no encontrado | La Marquessa" };

  const url = urlAbsoluta(`/producto/${producto.slug}`);
  const titulo = `Bolso ${producto.nombre} — impreso en 3D y hecho a mano | ${MARCA}`;
  const descripcion = resumen(producto.descripcion);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: titulo,
      description: descripcion,
      images: producto.fotos[0]
        ? [{ url: producto.fotos[0], alt: `Bolso ${producto.nombre}` }]
        : undefined,
    },
  };
}

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

  const precio = Math.min(...producto.tamanos.map((t) => t.precioCop));
  const url = urlAbsoluta(`/producto/${producto.slug}`);
  const medidas =
    producto.altoCm && producto.anchoCm && producto.profundidadCm
      ? { alto: producto.altoCm, ancho: producto.anchoCm, prof: producto.profundidadCm }
      : null;

  // Datos estructurados del producto. El precio y la disponibilidad son reales;
  // el plazo de fabricación (se hace a pedido) va como handlingTime.
  const schemaProducto = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Bolso ${producto.nombre}`,
    description: producto.descripcion.replace(/\s+/g, " ").trim(),
    image: producto.fotos.map((f) => urlAbsoluta(f)),
    sku: producto.slug,
    brand: { "@type": "Brand", name: MARCA },
    ...(producto.material ? { material: producto.material } : {}),
    ...(medidas
      ? {
          height: { "@type": "QuantitativeValue", value: medidas.alto, unitCode: "CMT" },
          width: { "@type": "QuantitativeValue", value: medidas.ancho, unitCode: "CMT" },
          depth: { "@type": "QuantitativeValue", value: medidas.prof, unitCode: "CMT" },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "COP",
      price: precio,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: MARCA },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "CO",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          // Se fabrica a pedido: 2 semanas de producción.
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 10,
            maxValue: PRODUCCION_SEMANAS * 7,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  const schemaMigas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Colección", item: urlAbsoluta("/tienda") },
      { "@type": "ListItem", position: 3, name: producto.nombre, item: url },
    ],
  };

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProducto) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMigas) }}
      />

      <nav aria-label="Ruta de navegación" className="text-sm text-cacao-suave">
        <Link href="/" className="transition-colors hover:text-cobre-texto">
          Inicio
        </Link>
        <span className="px-2">/</span>
        <Link href="/tienda" className="transition-colors hover:text-cobre-texto">
          Colección
        </Link>
        <span className="px-2">/</span>
        <span className="text-cacao">{producto.nombre}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-14">
        <Galeria fotos={producto.fotos} nombre={producto.nombre} />

        <div>
          <h1 className="font-titulo text-4xl md:text-5xl">
            Bolso {producto.nombre}
          </h1>

          <div className="mt-4 space-y-4 leading-relaxed text-cacao-suave">
            {producto.descripcion.split("\n\n").map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
          </div>

          <ComprarPanel producto={producto} />

          <p className="mt-4 text-sm text-cacao-suave">
            Se fabrica a pedido: tu bolso estará listo en{" "}
            <strong className="text-cacao">{PRODUCCION_SEMANAS} semanas</strong>.
          </p>

          <div className="mt-8 border-t border-cacao/10">
            {medidas && (
              <details className="border-b border-cacao/10 py-3" open>
                <summary className="flex cursor-pointer list-none items-center justify-between font-titulo text-lg">
                  Medidas
                  <span className="text-cobre-texto">+</span>
                </summary>
                <ul className="mt-2 space-y-1 text-sm text-cacao-suave">
                  <li>Alto: {formatCm(medidas.alto)}</li>
                  <li>Ancho: {formatCm(medidas.ancho)}</li>
                  <li>Profundidad: {formatCm(medidas.prof)}</li>
                </ul>
              </details>
            )}
            <details className="border-b border-cacao/10 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between font-titulo text-lg">
                Materiales y cuidado
                <span className="text-cobre-texto">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-cacao-suave">
                {producto.material ??
                  "Diseñada e impresa en 3D, terminada a mano con materiales colombianos."}{" "}
                Limpia con un paño suave y seco; evita la exposición prolongada al
                sol.{" "}
                <Link
                  href="/preguntas-frecuentes#cuidado"
                  className="text-cobre-texto underline-offset-4 hover:underline"
                >
                  Cómo cuidarlo →
                </Link>
              </p>
            </details>
            <details className="border-b border-cacao/10 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between font-titulo text-lg">
                Envíos y devoluciones
                <span className="text-cobre-texto">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-cacao-suave">
                Cada pieza se fabrica a pedido y se despacha en{" "}
                {PRODUCCION_SEMANAS} semanas. Envíos a todo Colombia, con
                derecho de retracto dentro de los 5 días hábiles siguientes a la
                entrega.{" "}
                {/* ⚠️ [PENDIENTE: política propia de cambios, revisada por un
                    abogado. Lo que se afirma aquí es el piso legal (Ley 1480). */}
                <Link
                  href="/preguntas-frecuentes#devoluciones"
                  className="text-cobre-texto underline-offset-4 hover:underline"
                >
                  Ver condiciones →
                </Link>
              </p>
            </details>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-20 md:mt-28">
          <h2 className="text-center font-titulo text-3xl">
            También te puede gustar
          </h2>
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
