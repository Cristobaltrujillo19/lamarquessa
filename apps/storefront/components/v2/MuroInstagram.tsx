import { getPosts } from "@/lib/instagram";
import MuroInstagramPiezas from "./MuroInstagramPiezas";
import styles from "./CarruselInstagram.module.css";

/**
 * Muro de publicaciones de Instagram.
 *
 * La reticula se ajusta al ancho de la ventana y las publicaciones caben
 * siempre: solo cambia el reparto —6 columnas en escritorio, 4 en tableta,
 * 3 en movil—, asi que no hay desplazamiento, ni flechas, ni el JavaScript
 * que hacia falta para gestionarlos.
 *
 * Componente de SERVIDOR: aqui se descarga el feed, cacheado una hora. Es lo
 * que mantiene el consumo de Behold atado al reloj y no al trafico. Ver el
 * calculo en lib/instagram.ts antes de mover nada de esto al navegador.
 *
 * Sin publicaciones no hay seccion: si Behold falla, si el feed se vacia o si
 * alguien desconecta la cuenta, el muro desaparece en vez de dejar un hueco
 * roto. Mismo criterio que testimonios y destinos.
 */
export default async function MuroInstagram() {
  const posts = await getPosts();
  if (posts.length === 0) return null;

  return (
    // Sin titular visible, el nombre accesible de la seccion lo da aria-label.
    <section
      className={styles.seccion}
      aria-label="Últimas publicaciones en Instagram"
    >
      <MuroInstagramPiezas posts={posts} />
    </section>
  );
}
