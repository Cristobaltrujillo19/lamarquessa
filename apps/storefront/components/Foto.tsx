import { ANCHOS_FOTO } from "@/lib/fotos-anchos";

// Imagen de producto: sirve AVIF a quien lo soporte y JPEG al resto, en varias
// tallas para que un teléfono no baje la foto de 1600 px.
//
// Medido el 2 de septiembre de 2026 (§15 del ESTADO): sin `srcset` se
// desperdiciaban 882 KB por página, y el elemento LCP de la ficha era un AVIF
// de 1600×2000 servido tal cual a un móvil.

/** Construye el `srcset` de una extensión a partir de los anchos que EXISTEN.
 *  El ancho mayor es el original y va sin sufijo; los demás son
 *  `<nombre>-<ancho>.<ext>`. */
function srcSet(src: string, ext: string): string | undefined {
  const anchos = ANCHOS_FOTO[src];
  if (!anchos || anchos.length < 2) return undefined;
  const sinExt = src.replace(/\.(jpe?g|png)$/i, "");
  const mayor = anchos[anchos.length - 1];
  return anchos
    .map((w) => `${w === mayor ? sinExt : `${sinExt}-${w}`}.${ext} ${w}w`)
    .join(", ");
}

export default function Foto({
  src,
  alt,
  className,
  ancho,
  alto,
  prioridad = false,
  tallas = "100vw",
}: {
  src: string;
  alt: string;
  className?: string;
  ancho: number;
  alto: number;
  prioridad?: boolean;
  /** Qué ancho ocupará la foto en pantalla, para que el navegador elija talla.
   *  Por defecto `100vw`, que nunca se queda corto aunque desperdicie: cada
   *  sitio de uso debería pasar el suyo. */
  tallas?: string;
}) {
  const avif = src.replace(/\.(jpe?g|png)$/i, ".avif");
  const setAvif = srcSet(src, "avif");
  const setJpg = srcSet(src, "jpg");

  return (
    <picture>
      <source
        // Sin variantes conocidas cae al fichero único de siempre: una foto
        // nueva sin regenerar sigue mostrándose, solo que sin tallas.
        srcSet={setAvif ?? avif}
        sizes={setAvif ? tallas : undefined}
        type="image/avif"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={setJpg}
        sizes={setJpg ? tallas : undefined}
        alt={alt}
        className={className}
        width={ancho}
        height={alto}
        loading={prioridad ? "eager" : "lazy"}
        fetchPriority={prioridad ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}

/** Texto alternativo derivado del rol de la foto (lo dice su nombre de archivo).
 *  Se escribe para alguien que no ve la imagen, no para meter palabras clave. */
export function altDeFoto(src: string, nombre: string): string {
  if (src.includes("-en-uso")) {
    return `Bolso ${nombre} de La Marquessa llevado a mano frente al mar`;
  }
  if (src.includes("-ambiente")) {
    return `Bolso ${nombre} de La Marquessa fotografiado junto al mar al atardecer`;
  }
  if (src.includes("-angulo")) {
    return `Bolso ${nombre} de La Marquessa visto en ángulo, con el relieve de su superficie impresa en 3D`;
  }
  if (src.includes("-frente")) {
    return `Bolso ${nombre} de La Marquessa visto de frente`;
  }
  return `Bolso ${nombre} de La Marquessa`;
}
