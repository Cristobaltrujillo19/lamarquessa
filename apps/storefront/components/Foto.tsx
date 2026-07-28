// Imagen de producto: sirve AVIF a quien lo soporte y JPEG al resto.
// Las dos versiones se generan al importar las fotos, con el mismo nombre.
export default function Foto({
  src,
  alt,
  className,
  ancho,
  alto,
  prioridad = false,
}: {
  src: string;
  alt: string;
  className?: string;
  ancho: number;
  alto: number;
  prioridad?: boolean;
}) {
  const avif = src.replace(/\.(jpe?g|png)$/i, ".avif");
  return (
    <picture>
      <source srcSet={avif} type="image/avif" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
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
