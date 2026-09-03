import { SITE_URL, urlAbsoluta } from "./site";

/**
 * Miga de pan en JSON-LD (`BreadcrumbList`).
 *
 * Google la usa para enseñar la ruta de la página en el resultado de búsqueda
 * en vez de la URL cruda: "lamarquessa.co › Nuestra historia" se lee mejor que
 * "lamarquessa.co/nosotros".
 *
 * Estaba escrito a mano en tres páginas y faltaba en otras cuatro
 * (`/nosotros`, `/envios`, `/contacto`, `/privacidad`), que llevan indexables
 * desde siempre. Vive aquí para que añadir una página nueva sea una línea y no
 * un bloque copiado.
 *
 * `/gracias` y `/pago-fallido` NO llevan miga a propósito: no son páginas de
 * navegación, son el final de un flujo, y no deberían aparecer en búsqueda.
 */
export type Miga = { nombre: string; ruta: string };

export function schemaMigas(migas: Miga[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      // "Inicio" siempre es la primera y apunta a la raíz del sitio.
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      ...migas.map((m, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: m.nombre,
        item: urlAbsoluta(m.ruta),
      })),
    ],
  };
}
