/**
 * Publicaciones de Instagram, servidas por Behold.
 *
 * POR QUE UN INTERMEDIARIO Y NO LA API DE META DIRECTA: hablar con Instagram
 * exige una app de Meta, y la marca no puede crear una por un problema con
 * Facebook sin resolver. Behold aporta EXACTAMENTE esa pieza —su app, su
 * token, y la descarga de las imagenes a su CDN— y nada mas. El marcado, el
 * diseno y la analitica siguen siendo nuestros, asi que no hay marca de agua
 * de nadie ni estilos ajenos en la pagina.
 *
 * ⚠️ LA REGLA QUE NO SE PUEDE ROMPER: este feed se pide DESDE EL SERVIDOR y
 * cacheado. Behold cuenta una vista por cada peticion que llega a sus
 * servidores, no por visitante:
 *
 *   · Con su widget    → 1 vista por cada persona que carga la home.
 *   · Con este JSON    → 1 vista por hora, la haga quien la haga.
 *
 * El plan gratuito son 1.200 vistas al mes. Refrescando cada hora gastamos
 * 24 x 30 = 720, y ese numero NO sube aunque el trafico se multiplique,
 * porque depende del reloj. Las peticiones de imagenes no cuentan.
 *
 * Si alguien baja REVALIDAR_SEGUNDOS por debajo de ~1800, o mueve esta
 * llamada al navegador, el consumo pasa a depender del trafico y la seccion
 * se apaga sola a mitad de mes. Es el mismo fallo que nos hizo descartar el
 * widget de Elfsight, cuyo plan gratuito son 200 vistas mensuales.
 */

/** Feed de @lamarquessa.co en Behold. No es un secreto: es de solo lectura y
 *  publico. Para cambiar de feed se cambia esta linea. */
const FEED = "https://feeds.behold.so/xiyojrSWUaXCpWgQpyB2";

/** Una hora. Ver el calculo de arriba antes de tocarlo. */
const REVALIDAR_SEGUNDOS = 3600;

/** Cuantas publicaciones pinta el muro como maximo. */
export const MAX_POSTS = 12;

/** Una imagen ya optimizada por Behold (webp) en su CDN. A diferencia de las
 *  URL del CDN de Instagram, estas NO caducan. */
type Tamano = { width: number; height: number; mediaUrl: string };

/** Lo que devuelve Behold, recortado a lo que el muro usa. */
type PostBehold = {
  id: string;
  permalink: string;
  timestamp: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  /** URL del CDN de Instagram. CADUCA — no usar para pintar. */
  mediaUrl?: string;
  caption?: string;
  /** Texto alternativo puesto por quien publico, en Instagram. Suele venir
   *  vacio porque casi nadie lo rellena. */
  altText?: string | null;
  sizes?: Record<string, Tamano>;
  colorPalette?: { dominant?: string };
};

/** Lo que el muro necesita, ya resuelto. */
export type PostInstagram = {
  id: string;
  url: string;
  /** Del CDN de Behold, permanente. */
  imagen: string;
  /** Vacio = imagen decorativa; el nombre accesible lo pone el enlace. */
  alt: string;
  /** Texto del pie, para dar nombre accesible al enlace. */
  pie: string;
  /** "r,g,b" — color de fondo mientras carga, para que no haya un hueco gris. */
  fondo?: string;
};

/** El pie recortado a algo que se pueda leer en voz alta sin cansar. */
function resumirPie(pie: string | undefined): string {
  if (!pie) return "";
  const limpio = pie.replace(/\s+/g, " ").trim();
  return limpio.length > 120 ? `${limpio.slice(0, 117)}...` : limpio;
}

/**
 * Publicaciones listas para pintar. Devuelve [] ante cualquier problema:
 * la home NUNCA puede caerse porque Behold o Instagram tengan un mal dia.
 * Sin publicaciones, el muro no se renderiza — ausencia mejor que hueco roto.
 */
export async function getPosts(): Promise<PostInstagram[]> {
  let datos: { posts?: PostBehold[] };

  try {
    const res = await fetch(FEED, {
      next: { revalidate: REVALIDAR_SEGUNDOS },
    });
    if (!res.ok) return [];
    datos = await res.json();
  } catch {
    return [];
  }

  const posts = datos?.posts;
  if (!Array.isArray(posts)) return [];

  return posts
    .map((p): PostInstagram | null => {
      // Solo el CDN de Behold. `mediaUrl` es de Instagram y caduca en dias:
      // usarlo daria un muro que se ve bien hoy y sale roto la semana que
      // viene, sin ningun error que lo delate.
      const imagen =
        p.sizes?.medium?.mediaUrl ??
        p.sizes?.small?.mediaUrl ??
        p.sizes?.large?.mediaUrl;
      if (!imagen || !p.permalink) return null;

      return {
        id: p.id,
        url: p.permalink,
        imagen,
        // El alt SOLO sale de Instagram. Si esta vacio se queda vacio y el
        // nombre accesible lo da el pie a traves del enlace: describir una
        // foto que nadie ha mirado seria inventarsela, y quien usa lector de
        // pantalla no puede detectar el error.
        alt: p.altText?.trim() || "",
        pie: resumirPie(p.caption),
        fondo: p.colorPalette?.dominant,
      };
    })
    .filter((p): p is PostInstagram => p !== null)
    .slice(0, MAX_POSTS);
}
