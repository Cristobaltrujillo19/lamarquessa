import { IconoOlas } from "./IconoMarca";
import css from "./Concepto.module.css";

export default function Concepto() {
  return (
    <section id="concepto" className={`seccion ${css.concepto}`}>
      <div className={`contenedor ${css.centro} reveal`}>
        <p className="kicker">Concepto de marca</p>
        <IconoOlas className={css.olas} />

        <p className={css.intro}>
          En una isla olvidada por el tiempo, existía un rincón donde el mar
          conservaba su esencia: su poder, su pureza.
        </p>

        <p className={css.cuerpo}>
          Las mujeres que lo visitaban se volvían parte de él, como musas que
          danzaban entre la arena y las olas, eternas y en paz, viviendo esa
          sensación de libertad sin fin que solo el mar puede ofrecer.
        </p>

        <p className={css.cierre}>
          Eso es La Marquessa: un refugio para quienes eligen vivir en armonía con
          el océano, en paz con la naturaleza y en absoluta conexión con uno mismo.
        </p>
      </div>
    </section>
  );
}
