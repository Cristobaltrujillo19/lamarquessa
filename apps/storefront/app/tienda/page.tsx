import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import TarjetaProducto from "@/components/v2/TarjetaProducto";
import Aparece from "@/components/v2/Aparece";
import { CATEGORIAS, categoriaDe, precioDesde } from "@/lib/productos";
import { PRODUCCION_SEMANAS, SITE_URL, urlAbsoluta } from "@/lib/site";
import ViewItemListTracker from "./ViewItemListTracker";
import styles from "./coleccion.module.css";

// La colección con la interfaz nueva.
//
// LA RUTA NO CAMBIA. El mockup la llama /coleccion; aquí sigue siendo /tienda,
// que lleva meses indexada, está en el sitemap y es el canonical. Renombrarla
// habría costado posiciones a cambio de nada que el visitante note: lo que ve
// es el rótulo, y ese ya dice "Colección" en el nav.
//
// La metadata se conserva tal cual: fue escrita para el SERP y medida bajo los
// 160 caracteres. El titular del mockup ("Cuatro piezas.") sí entra, porque es
// el H1 y ahí manda el diseño aprobado.

export const metadata: Metadata = {
  title: "Bolsos artesanales hechos a mano en Colombia | La Marquessa",
  description:
    "Colección completa de La Marquessa: 4 bolsos de mano impresos en 3D y hechos a mano en Colombia. Cada pieza es única. Fabricados a pedido, listos en 2 semanas.",
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

  // Agrupado en el orden de CATEGORIAS, no en el de llegada: los bolsos
  // primero. Las categorías sin piezas se caen solas.
  const porCategoria = CATEGORIAS.map(
    (c) => [c, items.filter((p) => categoriaDe(p) === c)] as const,
  ).filter(([, piezas]) => piezas.length > 0);
  const hayVariasCategorias = porCategoria.length > 1;
  const bolsos = items.filter((p) => categoriaDe(p) === "Bolsos");

  return (
    <div>
      <section className="seccion-base" aria-labelledby="titular-coleccion">
        <div className="contenedor">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMigas) }}
          />
          <ViewItemListTracker
            listName="Colección"
            items={items.map((p) => ({
              slug: p.slug,
              nombre: p.nombre,
              precioDesde: precioDesde(p),
              categoria: categoriaDe(p),
            }))}
          />

          <Aparece className={styles.encabezado}>
            <p className="eyebrow eyebrow-seccion">Serie abierta · 2026</p>
            <h1 id="titular-coleccion" className="h1 aire-arriba">
              {bolsos.length === 4 ? "Cuatro piezas." : `${bolsos.length} piezas.`}
            </h1>
            <p className="cuerpo aire-arriba">
              Cada una se imprime en Medellín y se pule a mano cuando ya tiene
              dueña. El relieve Nácar no se repite: cada pieza sale del molde con
              su propio patrón.
            </p>
          </Aparece>

          {items.length === 0 ? (
            <p className="cuerpo">Muy pronto verás aquí nuestras piezas.</p>
          ) : (
            /* Sin filtro por color: con solo cuatro piezas, un filtro cuyas
               únicas opciones eran Amanecer, Horizonte y Caribe añadía un paso
               antes de ver el catálogo entero, que cabe de una vez en pantalla.
               La rejilla se pinta ahora en el servidor. */
            /* Una sección por categoría, en el orden de CATEGORIAS: los bolsos
               primero, que son lo que la marca vende. Una categoría vacía no
               pinta encabezado — con solo bolsos, la página se ve exactamente
               como antes de que existieran los accesorios. */
            <>
              {porCategoria.map(([categoria, piezas]) => (
                <section
                  key={categoria}
                  className={styles.bloqueCategoria}
                  aria-label={categoria}
                >
                  {hayVariasCategorias && (
                    <Aparece>
                      <h2 className="h3 aire-arriba-lg">{categoria}</h2>
                    </Aparece>
                  )}
                  <div className={styles.grilla}>
                    {piezas.map((p, i) => (
                      <Aparece key={p.slug} paso={i}>
                        {/* nivel 3 si hay encabezado de categoría encima;
                            nivel 2 si la pieza cuelga directa del H1. */}
                        <TarjetaProducto
                          producto={p}
                          prioridad={categoria === "Bolsos" && i < 2}
                          nivel={hayVariasCategorias ? 3 : 2}
                        />
                      </Aparece>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}

          <p className="texto-suave aire-arriba-lg">
            {hayVariasCategorias
              ? "Todo se fabrica a pedido. El plazo de cada pieza está en su ficha."
              : `Todas se fabrican a pedido y están listas en ${PRODUCCION_SEMANAS} semanas.`}
          </p>
        </div>
      </section>
    </div>
  );
}
