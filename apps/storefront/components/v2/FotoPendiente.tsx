/**
 * Contenedor con la proporción correcta para una toma que aún no existe.
 * Nunca se rellena con stock ni con imagen generada: en una marca cuyo valor
 * es el hecho a mano, una foto de stock es una contradicción.
 *
 * Portado literal del mockup.
 */
export default function FotoPendiente({
  descripcion,
  proporcion = "4 / 5",
}: {
  descripcion: string;
  proporcion?: string;
}) {
  return (
    <div
      className="foto-pendiente"
      style={{ aspectRatio: proporcion }}
      role="img"
      aria-label={`Foto pendiente: ${descripcion}`}
    >
      <span>Foto pendiente: {descripcion}</span>
    </div>
  );
}
