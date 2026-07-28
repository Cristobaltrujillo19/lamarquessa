import IconoMarca, { type SimboloMarca } from "./IconoMarca";
import css from "./ComoSeHace.module.css";

// El proceso: artesanía + impresión 3D. Es lo que justifica el precio y lo que
// nadie más cuenta, así que cada paso lleva un dato concreto y verificable.
const pasos: { icono: SimboloMarca; titulo: string; texto: string; dato: string }[] = [
  {
    icono: "concha",
    titulo: "Lo diseñamos",
    texto:
      "Cada bolso parte de un trazo propio, dibujado a mano e inspirado en el mar. La forma se modela en 3D hasta que la curva cae como debe.",
    dato: "Diseño propio",
  },
  {
    icono: "velero",
    titulo: "Lo imprimimos en 3D",
    texto:
      "Se imprime capa sobre capa en PLA, un bioplástico de origen vegetal que compramos en Colombia. La impresión permite formas que no se podían fabricar de otra manera.",
    dato: "PLA de origen colombiano",
  },
  {
    icono: "hibisco",
    titulo: "Lo terminamos a mano",
    texto:
      "Ensamblado, lijado y rematado a mano, pieza por pieza. Por eso el relieve nunca cae igual dos veces y no existen dos bolsos idénticos.",
    dato: "Listo en 2 semanas",
  },
];

export default function ComoSeHace() {
  return (
    <section id="proceso" className={`seccion ${css.proceso}`}>
      <div className="contenedor">
        <header className={`${css.encabezado} reveal`}>
          <p className="kicker">Capa sobre capa</p>
          <h2 className="titulo-seccion">
            Cada capa, una <span className="script">ola</span>
          </h2>
          <p className={css.sub}>
            Un bolso de La Marquessa se hace uno por uno, combinando impresión 3D
            con acabado artesanal a mano. Ese cruce es lo que permite formas
            imposibles de fabricar antes, y lo que hace que cada pieza sea la
            única que existe.
          </p>
        </header>

        <ol className={css.pasos}>
          {pasos.map((p) => (
            <li key={p.titulo} className={`${css.paso} reveal`}>
              <div className={css.iconoSlot}>
                <IconoMarca nombre={p.icono} tamano={76} />
              </div>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
              <span className={css.dato}>{p.dato}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
