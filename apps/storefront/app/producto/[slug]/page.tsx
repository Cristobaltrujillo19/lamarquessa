import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import TarjetaProducto from "@/components/v2/TarjetaProducto";
import Aparece from "@/components/v2/Aparece";
import ConfiguradorPieza from "./ConfiguradorPieza";
import ViewItemTracker from "./ViewItemTracker";
import { formatCm } from "@/lib/productos";
import styles from "./producto.module.css";
import {
  ENVIO_DIAS,
  MARCA,
  PRODUCCION_SEMANAS,
  SHIPPING_COP,
  SITE_URL,
  urlAbsoluta,
} from "@/lib/site";

// Meta description por producto: pensada para SERP (bajo 160 caracteres,
// nombre + tipo + diferenciador + urgencia). Se prefiere a la descripción
// editorial larga, que al truncarse cae en frases sueltas. Si mañana se añade
// un producto nuevo desde el panel y no está en el mapa, se cae al resumen
// automático de siempre.
const META_DESCRIPCION_POR_SLUG: Record<string, string> = {
  menorca:
    "Menorca: mini bolso de mano impreso en 3D con textura de espuma tallada a mano. Silueta sin costuras, pieza única. A pedido, listo en 2 semanas.",
  mallorca:
    "Mallorca: bolso de mano grande impreso en 3D con textura de espuma tallada a mano. Talla mayor de Menorca. Pieza única. A pedido, listo en 2 semanas.",
  kruta:
    "Kruta: mini bolso vertical impreso en 3D, superficie lisa con un pliegue tallado a mano. Ideal para salir de noche. Pieza única. A pedido, 2 semanas.",
  montt:
    "Montt: bolso de mano ancho impreso en 3D con pliegue diagonal tallado a mano. Silueta horizontal para el día a día. Pieza única. A pedido, 2 semanas.",
};

// Fallback para productos que aún no tienen meta description propia: primera
// frase(s) de la descripción editorial, recortada al ancho de SERP.
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
  // El subtitulo lleva la frase con palabras clave ("bolso de mano impreso en
  // 3D, hecho a mano en Colombia"); si el producto todavía no lo tiene, cae al
  // texto genérico que se usó siempre.
  const cola = producto.subtitulo ?? "impreso en 3D y hecho a mano";
  const titulo = `Bolso ${producto.nombre} — ${cola} | ${MARCA}`;
  const descripcion =
    META_DESCRIPCION_POR_SLUG[producto.slug] ?? resumen(producto.descripcion);

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
        shippingRate: {
          "@type": "MonetaryAmount",
          value: SHIPPING_COP,
          currency: "COP",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          // Se fabrica a pedido: 2 semanas de producción...
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 10,
            maxValue: PRODUCCION_SEMANAS * 7,
            unitCode: "DAY",
          },
          // ...y después, 2 días hábiles de transportadora.
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: ENVIO_DIAS,
            maxValue: ENVIO_DIAS,
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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProducto) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMigas) }}
      />
      <ViewItemTracker producto={producto} />

      {/* ---------- La pieza: galería + configurador + compra ---------- */}
      <section className="seccion-base" aria-labelledby="titular-pieza">
        <div className="contenedor">
          <ConfiguradorPieza producto={producto} />
        </div>
      </section>

      {/* ---------- Medidas y cuidado ----------
          Superficie elevada para separarla de la ficha sin recurrir a un
          color nuevo. */}
      <section className="seccion-respiro seccion-elevada" aria-labelledby="titular-ficha">
        <div className="contenedor">
          <Aparece>
            <h2 id="titular-ficha" className="h2">
              Medidas y cuidado
            </h2>
          </Aparece>

          <dl className={styles.ficha}>
            {medidas && (
              <>
                <div className={styles.fila}>
                  <dt className={styles.filaClave}>Alto</dt>
                  <dd className={styles.filaValor}>{formatCm(medidas.alto)}</dd>
                </div>
                <div className={styles.fila}>
                  <dt className={styles.filaClave}>Ancho</dt>
                  <dd className={styles.filaValor}>{formatCm(medidas.ancho)}</dd>
                </div>
                <div className={styles.fila}>
                  <dt className={styles.filaClave}>Fondo</dt>
                  <dd className={styles.filaValor}>{formatCm(medidas.prof)}</dd>
                </div>
              </>
            )}
            {producto.material && (
              <div className={styles.fila}>
                <dt className={styles.filaClave}>Material</dt>
                <dd className={styles.filaValor}>{producto.material}</dd>
              </div>
            )}
            <div className={styles.fila}>
              <dt className={styles.filaClave}>Fabricación</dt>
              <dd className={styles.filaValor}>
                A pedido, {PRODUCCION_SEMANAS} semanas
              </dd>
            </div>
            <div className={styles.fila}>
              <dt className={styles.filaClave}>Cuidado</dt>
              <dd className={styles.filaValor}>
                Limpia con un paño suave y seco; evita la exposición prolongada
                al sol.
              </dd>
            </div>
          </dl>

          <p className="texto-suave aire-arriba">
            <Link href="/envios" className="link-terciario">
              Envíos y devoluciones
            </Link>
            {" · "}
            <Link href="/preguntas-frecuentes" className="link-terciario">
              Preguntas frecuentes
            </Link>
          </p>
        </div>
      </section>

      {/* ---------- La descripción larga ---------- */}
      <section className="seccion-respiro" aria-labelledby="titular-relato">
        <div className="contenedor">
          <Aparece className="ancho-texto">
            <h2 id="titular-relato" className="h2">
              Sobre {producto.nombre}
            </h2>
            <div className="aire-arriba">
              {producto.descripcion.split("\n\n").map((parrafo, i) => (
                <p key={i} className="cuerpo aire-arriba">
                  {parrafo}
                </p>
              ))}
            </div>
          </Aparece>
        </div>
      </section>

      {/* ---------- Piezas relacionadas ---------- */}
      {relacionados.length > 0 && (
        <section className="seccion-base" aria-labelledby="titular-relacionadas">
          <div className="contenedor">
            <Aparece>
              <h2 id="titular-relacionadas" className="h2 centrado">
                También te puede gustar
              </h2>
            </Aparece>
            <div className={styles.relacionadas}>
              {relacionados.map((p, i) => (
                <Aparece key={p.slug} paso={i}>
                  <TarjetaProducto producto={p} listName="Relacionados" />
                </Aparece>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
