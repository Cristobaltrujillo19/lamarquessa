"use client";

import type { PostInstagram } from "@/lib/instagram";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";
import { trackInstagramClick } from "@/lib/analytics";
import styles from "./CarruselInstagram.module.css";

/**
 * La parte interactiva del muro. Es de cliente SOLO para poder disparar
 * `instagram_click`: doce enlaces salientes sin instrumentar serian el mayor
 * punto ciego del sitio. La descarga del feed la hace el componente padre,
 * en el servidor.
 *
 * Las fotos van con <img> normal y no con next/image a proposito: Behold ya
 * las sirve en webp y al tamano pedido, asi que optimizarlas otra vez seria
 * pagar dos veces por lo mismo. Ademas evita tener que declarar su dominio
 * en la configuracion de Next.
 */

/** Glifo de Instagram. Va en linea y no como archivo para que herede el
 *  color del contexto y escale sin pedir una descarga extra. */
function IconoInstagram() {
  return (
    <svg
      className={styles.icono}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function MuroInstagramPiezas({
  posts,
}: {
  posts: PostInstagram[];
}) {
  return (
    <>
      <ul className={styles.muro}>
        {posts.map((post) => (
          <li key={post.id} className={styles.pieza}>
            <a
              href={post.url}
              className={styles.enlace}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackInstagramClick("muro_home")}
              // El color dominante de la propia foto tapa el hueco mientras
              // carga. Menos brusco que el gris de relleno.
              style={
                post.fondo
                  ? { backgroundColor: `rgb(${post.fondo})` }
                  : undefined
              }
            >
              <img
                src={post.imagen}
                alt={post.alt}
                loading="lazy"
                decoding="async"
                width={525}
                height={700}
              />
              {/* Al pasar por encima aparece el glifo: sin titular de seccion,
                  es lo que dice de donde viene esto. */}
              <span className={styles.velo} aria-hidden="true">
                <IconoInstagram />
              </span>
              {/* El nombre accesible del enlace. Cuando Instagram no trae
                  texto alternativo, el pie es lo unico REAL que se puede
                  decir de la publicacion sin inventarla. */}
              <span className="sr-solo">
                {post.pie
                  ? `Ver en Instagram: ${post.pie}`
                  : "Ver publicacion en Instagram"}{" "}
                (se abre en una pestana nueva)
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="contenedor">
        <p className={styles.pie}>
          <a
            href={INSTAGRAM_URL}
            className="link-terciario"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackInstagramClick("muro_home_pie")}
          >
            {INSTAGRAM_HANDLE}
          </a>
        </p>
      </div>
    </>
  );
}
