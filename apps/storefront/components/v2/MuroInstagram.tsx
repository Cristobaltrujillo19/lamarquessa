"use client";

import Image from "next/image";
import { getPosts } from "@/lib/instagram";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";
import { trackInstagramClick } from "@/lib/analytics";
import styles from "./CarruselInstagram.module.css";

/**
 * Muro de publicaciones de Instagram.
 *
 * Portado de LM_MOCKUP/components/CarruselInstagram.tsx. Alli el nombre
 * decia "carrusel" por herencia de una version anterior; ya no lo es. La
 * reticula se ajusta al ancho de la ventana y las doce publicaciones caben
 * siempre: solo cambia el reparto (6x2 en escritorio, 4x3 en tableta, 3x4
 * en movil). Por eso no hay desplazamiento, ni flechas, ni el JavaScript
 * que hacia falta para gestionarlos. La hoja de estilos conserva el nombre
 * original para que el CSS portado no haya que reescribirlo.
 *
 * DIFERENCIA CON EL MOCKUP: es componente de CLIENTE, no de servidor.
 * El mockup no tiene analitica; produccion si, y cada enlace que sale a
 * Instagram tiene que disparar `instagram_click`. Un muro de doce enlaces
 * salientes sin instrumentar seria el mayor punto ciego del sitio.
 * `link_location` distingue este muro del enlace del pie, que ya existia:
 * es un parametro nuevo, no un evento nuevo, asi que el contrato de los 17
 * eventos no se toca.
 *
 * Sin publicaciones reales no hay seccion: mismo criterio que testimonios
 * y destinos. Ver lib/instagram.ts.
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

export default function MuroInstagram() {
  const posts = getPosts();
  if (posts.length === 0) return null; // ausencia > placeholder en produccion

  return (
    // Sin titular visible, el nombre accesible de la seccion lo da aria-label.
    <section
      className={styles.seccion}
      aria-label="Últimas publicaciones en Instagram"
    >
      <ul className={styles.muro}>
        {posts.map((post, i) => (
          <li key={post.imagen + i} className={styles.pieza}>
            <a
              href={post.url}
              className={styles.enlace}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackInstagramClick("muro_home")}
            >
              <Image
                src={post.imagen}
                alt={post.alt}
                fill
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 17vw"
                loading="lazy"
              />
              {/* Al pasar por encima aparece el glifo: sin titular de seccion,
                  es lo que dice de donde viene esto. */}
              <span className={styles.velo} aria-hidden="true">
                <IconoInstagram />
              </span>
              <span className="sr-solo">
                Abrir publicación en Instagram (se abre en una pestaña nueva)
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
    </section>
  );
}
