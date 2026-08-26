import Link from "next/link";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import TarjetaProducto from "@/components/v2/TarjetaProducto";
import Aparece from "@/components/v2/Aparece";
import Cortina from "@/components/v2/Cortina";
import Cintilla from "@/components/v2/Cintilla";
import HeroVideo from "@/components/v2/HeroVideo";
import { PRODUCCION_SEMANAS, TAGLINE, urlAbsoluta } from "@/lib/site";
import styles from "./home.module.css";

// Home con la interfaz nueva.
//
// DOS COMPONENTES DEL MOCKUP QUE NO SE PORTAN, Y POR QUÉ:
//
// PruebaSocial y CarruselInstagram se auto-ocultan cuando no hay datos, y
// hoy no los hay: no existen testimonios recogidos, ni destinos entregados,
// ni publicaciones de Instagram descargadas. Portarlos habría añadido dos
// componentes y sus ficheros de datos vacíos para renderizar exactamente
// nada. Entran cuando el material exista.
//
// El vídeo del hero SÍ se porta, pero con una salvedad que el capítulo 8 del
// handoff ya anota como decisión abierta: lleva "La Marquessa" incrustado y
// compite con el H1. Queda pendiente de resolver con el dueño de la marca.

export const metadata: Metadata = {
  title: "La Marquessa",
  description:
    "Bolsos impresos en 3D y hechos a mano en Colombia. Cada pieza es única — no existen dos iguales. Fabricados a pedido, listos en 2 semanas. Envíos globales.",
  alternates: { canonical: urlAbsoluta("/") },
};

export default async function Home() {
  const piezas = await fetchQuery(api.productos.catalogo, {});

  return (
    <div className="ui-v2">
      <Cortina />

      {/* ---------- HERO ----------
          A sangre: el vídeo ocupa el ancho completo de la ventana, así que
          esta sección NO va dentro de .contenedor. El texto sí se alinea a
          la columna, para que el titular no se despegue del resto del sitio. */}
      <section className={`${styles.hero} sobre-foto`} aria-labelledby="titular-hero">
        <HeroVideo />
        <div className={styles.heroVelo} aria-hidden="true" />

        <div className={styles.heroTexto}>
          <div className="contenedor">
            <h1 id="titular-hero" className={`h1 ${styles.heroTitular}`}>
              Piezas de autor inspiradas en el mar Caribe.
            </h1>
            <p className={`cuerpo ${styles.heroSubtitulo}`}>{TAGLINE}</p>
            <div className={styles.heroAccion}>
              <Link href="/tienda" className="btn btn-primario">
                Ver la colección
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CINTILLA DE MARCA ----------
          Va a sangre y trae su propio velo, así que no necesita contenedor. */}
      <Cintilla />

      {/* ---------- COLECCIÓN ---------- */}
      <section className="seccion-base" aria-labelledby="titular-coleccion">
        <div className="contenedor">
          <div className={styles.encabezadoSeccion}>
            <h2 id="titular-coleccion" className="h2">
              La colección
            </h2>
            <Link href="/tienda" className="link-terciario">
              {piezas.length === 4
                ? "Ver las cuatro piezas"
                : `Ver las ${piezas.length} piezas`}
            </Link>
          </div>

          <div className={styles.grilla}>
            {piezas.map((p, i) => (
              <Aparece key={p.slug} paso={i % 2}>
                {/* Sin precio: aquí la tarjeta invita a entrar en la pieza.
                    El precio vive en la colección y en la ficha. Está en la
                    lista de "no tocar" del handoff. */}
                <TarjetaProducto
                  producto={p}
                  mostrarPrecio={false}
                  prioridad={i < 2}
                  listName="Home"
                />
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HECHO A PEDIDO ----------
          Ancla la frase más importante del sitio en --tinta a sangre. */}
      <section className="seccion-base seccion-tinta" aria-labelledby="titular-pedido">
        <div className="contenedor">
          <Aparece className={styles.pedido}>
            <h2 id="titular-pedido" className={`h2 ${styles.pedidoTitular}`}>
              Cada bolso se imprime y se termina a mano solo cuando ya es tuyo.
            </h2>
            <p className={`cuerpo ${styles.pedidoLinea}`}>
              Listo en {PRODUCCION_SEMANAS === 2 ? "dos" : PRODUCCION_SEMANAS}{" "}
              semanas.
            </p>
          </Aparece>
        </div>
      </section>
    </div>
  );
}
