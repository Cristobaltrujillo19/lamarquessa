import { getTestimonios } from "@/lib/testimonios";
import { PIEZAS_ENTREGADAS, numeroEnPalabras } from "@/lib/marca";
import Aparece from "./Aparece";
import styles from "./PruebaSocial.module.css";

/**
 * Prueba social honesta: si no hay datos reales, no hay seccion.
 * Orden interno cuando hay datos: testimonios -> contador.
 *
 * Portado de LM_MOCKUP/components/PruebaSocial.tsx con dos ajustes:
 *
 * 1. Los nombres de las piezas llegan por `piezas` desde el catalogo de
 *    Convex, no de un modulo de datos estatico. La home ya hace ese fetch,
 *    asi que no anade ni una consulta.
 *
 * 2. La atribucion NO lleva numero de serie. El mockup firmaba cada
 *    testimonio con `Nº 019` para volverlo verificable, pero la numeracion
 *    de piezas no se pinta en ninguna parte del sitio mientras no se decida
 *    desde que numero arranca. Pintarla solo aqui seria la unica cifra de
 *    serie del sitio, y ademas una inventada.
 *
 * La procedencia (las ciudades a las que ha salido una pieza) no vive aqui:
 * esta integrada en la cintilla de marca. Ver components/v2/Cintilla.tsx.
 */
export default function PruebaSocial({
  piezas,
}: {
  /** Catalogo, solo para resolver slug -> nombre en la atribucion. */
  piezas: { slug: string; nombre: string }[];
}) {
  const testimonios = getTestimonios();

  const mostrarTestimonios = testimonios.length > 0;
  const mostrarContador =
    typeof PIEZAS_ENTREGADAS === "number" && PIEZAS_ENTREGADAS > 0;

  // Ausencia mejor que placeholder: sin dato real, la seccion no existe.
  if (!mostrarTestimonios && !mostrarContador) return null;

  return (
    <section
      className="seccion-momento hairline"
      aria-labelledby="titular-prueba-social"
    >
      <div className="contenedor">
        <Aparece className={styles.encabezado}>
          <p className="eyebrow eyebrow-seccion">Quienes ya tienen la suya</p>
          <h2 id="titular-prueba-social" className="h2 aire-arriba">
            Voces y trayectos.
          </h2>
        </Aparece>

        {mostrarTestimonios && (
          <ul className={styles.testimonios} role="list">
            {testimonios.map((t, i) => {
              const pieza = piezas.find((p) => p.slug === t.piezaSlug);
              return (
                <Aparece
                  key={`${t.autor}-${i}`}
                  paso={i}
                  as="li"
                  className={styles.testimonio}
                >
                  <blockquote className={`display-italic ${styles.cita}`}>
                    &ldquo;{t.cita}&rdquo;
                  </blockquote>
                  <p className={`eyebrow eyebrow-dato ${styles.atribucion}`}>
                    {t.autor} &middot; {t.ciudad}
                  </p>
                  {pieza && (
                    <p className={`eyebrow ${styles.referenciaPieza}`}>
                      {pieza.nombre}
                    </p>
                  )}
                </Aparece>
              );
            })}
          </ul>
        )}

        {mostrarContador && (
          <Aparece className={styles.contador}>
            <p className="display-italic">
              {numeroEnPalabras(PIEZAS_ENTREGADAS as number)} piezas únicas han
              salido de Medellín.
            </p>
          </Aparece>
        )}
      </div>
    </section>
  );
}
