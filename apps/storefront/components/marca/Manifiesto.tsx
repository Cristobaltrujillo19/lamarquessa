import IconoMarca from "./IconoMarca";
import css from "./Manifiesto.module.css";

// Cierre editorial: el manifiesto de marca + el lockup de olas del manual.
export default function Manifiesto() {
  return (
    <section className={css.manifiesto}>
      <div className={`${css.inner} reveal`}>
        <div className={css.texto}>
          <p>
            La vida, como el mar, no es lineal ni predecible. Todo está en constante
            movimiento, renovándose, por eso, creemos que la verdadera plenitud no
            está en la linealidad, sino en el vivir en paz con la incertidumbre, en
            conexión profunda con nosotros mismos y con el mundo que nos rodea.
          </p>
          <p>
            Cada una de las olas tiene una historia, y juntas componen un relato tan
            mágico como indescifrable.
          </p>
          <p>
            Ellas nos inspiran a soñar, a ser y especialmente a crear. Así nacen
            nuestras piezas, llevando la pureza del mar, su constante fluir y su
            inquebrantable poder de renovación.
          </p>
          <p className={css.cierre}>
            De ahí venimos, del amor, del mar, y del amor al mar.
          </p>
          {/* Nota: si mañana este texto se parte con <br />, poner espacio
              literal antes (ver comentario en app/nosotros/page.tsx). */}
        </div>

        <div className={css.sello}>
          <IconoMarca nombre="waves" tamano={230} />
        </div>
      </div>
    </section>
  );
}
