import type { Metadata } from "next";
import Link from "next/link";
import Aparece from "@/components/v2/Aparece";
import FotoPendiente from "@/components/v2/FotoPendiente";
import Foto from "@/components/Foto";
import { urlAbsoluta } from "@/lib/site";
import styles from "./nosotros.module.css";

// Primera ruta con la interfaz nueva. Va envuelta en `.ui-v2`, que es lo que
// activa el sistema de diseño portado del mockup (app/globals-v2.css). El
// resto del sitio sigue con la paleta anterior hasta que le toque.
//
// La MAQUETA viene del mockup aprobado; el COPY es el que ya estaba publicado
// en esta ruta. El mockup traía instrucciones a un redactor en el cuerpo
// ("Aquí va el lugar concreto y el momento concreto en que nace la marca")
// y sustituir texto terminado por un brief en una tienda que está vendiendo
// habría sido exactamente lo contrario de "ausencia mejor que placeholder".
//
// Los titulares y la cita SÍ son del mockup: ahí el texto está escrito, no
// esbozado, y es mejor que lo que había.

const FOTO_EDITORIAL = "/fotos/editorial-menorca-mallorca.jpg";

export const metadata: Metadata = {
  title: "Nuestra historia | La Marquessa",
  description:
    "Un taller en Medellín, una impresora 3D y unas manos. De dónde nace La Marquessa y por qué no hay dos piezas iguales.",
  alternates: { canonical: urlAbsoluta("/nosotros") },
};

export default function Nosotros() {
  return (
    <div className="ui-v2">
      <section className="seccion-base" aria-labelledby="titular-historia">
        <div className="contenedor">
          <Aparece className={styles.encabezado}>
            <p className="eyebrow eyebrow-seccion">Nuestra historia</p>
            <h1 id="titular-historia" className="h1 aire-arriba">
              Empezó mirando el agua.
            </h1>
          </Aparece>

          <div className={styles.bloque}>
            <Aparece className={styles.texto}>
              <p className={`cuerpo ${styles.anchoTexto}`}>
                En una isla olvidada por el tiempo, existía un rincón donde el
                mar conservaba su esencia: su poder, su pureza.
              </p>
              <p className={`cuerpo ${styles.anchoTexto}`}>
                Las mujeres que lo visitaban se volvían parte de él, como musas
                que danzaban entre la arena y las olas —eternas y en paz—
                viviendo esa sensación de libertad sin fin que solo el mar puede
                ofrecer.
              </p>
              <p className={`cuerpo ${styles.anchoTexto}`}>
                Eso es La Marquessa: un refugio para quienes eligen vivir en
                armonía con el océano, en paz con la naturaleza y en absoluta
                conexión con uno mismo.
              </p>

              <blockquote className={`display-italic ${styles.cita}`}>
                La tecnología permite formas que la mano no podría cortar. La
                mano las vuelve irrepetibles.
              </blockquote>
            </Aparece>

            <Aparece paso={1}>
              <div className={styles.retrato}>
                <FotoPendiente
                  descripcion="retrato en el estudio, junto a la impresora"
                  proporcion="3 / 4"
                />
              </div>
              <p className="eyebrow eyebrow-dato aire-arriba">
                Quién está detrás
              </p>
              <p className="pendiente-inline">Foto pendiente</p>
            </Aparece>
          </div>

          <Aparece className={styles.fotoAncha}>
            <Foto
              src={FOTO_EDITORIAL}
              alt="Los bolsos Menorca y Mallorca de La Marquessa dispuestos juntos junto a la piscina"
              ancho={1600}
              alto={900}
            />
          </Aparece>
        </div>
      </section>

      {/* Peso énfasis sin cambio de superficie: la variación tonal la lleva
          el hairline superior. Un fondo aquí competiría con la ancla marina
          del bloque de arriba (retrato + foto ancha). */}
      <section className="seccion-enfasis hairline" aria-labelledby="titular-tension">
        <div className="contenedor">
          <Aparece>
            <h2 id="titular-tension" className="h2">
              Una máquina precisa y unas manos que no lo son.
            </h2>
            <p className="cuerpo aire-arriba">
              Cada bolso parte de un trazo propio, dibujado a mano e inspirado
              en el mar. La forma se modela en 3D hasta que la curva cae como
              debe, y se imprime capa sobre capa en PLA, un bioplástico de
              origen vegetal que compramos en Colombia. La impresión permite
              formas que no se podían fabricar de otra manera.
            </p>
            <p className="cuerpo aire-arriba">
              Después viene lo que ninguna máquina resuelve: ensamblado, lijado
              y rematado a mano, pieza por pieza. Por eso el relieve nunca cae
              igual dos veces y no existen dos bolsos idénticos.
            </p>
          </Aparece>
        </div>
      </section>

      <section className="seccion-momento" aria-labelledby="titular-cierre-historia">
        <div className="contenedor centrado">
          <Aparece>
            <h2 id="titular-cierre-historia" className="h2">
              Tener una pieza única.
            </h2>
            <p className="cuerpo aire-arriba centrado-caja">
              La vida, como el mar, no es lineal ni predecible: todo está en
              constante movimiento, renovándose. Cada una de las olas tiene una
              historia, y juntas componen un relato tan mágico como
              indescifrable. De ahí venimos, del amor, del mar, y del amor al
              mar.
            </p>
            <div className="aire-arriba-lg">
              {/* El mockup enlaza a /coleccion, que en producción no existe:
                  la ruta real del catálogo es /tienda. */}
              <Link href="/tienda" className="btn btn-primario">
                Ver la colección
              </Link>
            </div>
          </Aparece>
        </div>
      </section>
    </div>
  );
}
