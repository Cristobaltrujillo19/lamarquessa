import css from "./Beneficios.module.css";

// Franja de confianza: las razones para comprar, de un vistazo. Los cuatro
// datos son verificables. (El plazo de fabricación se explica en la ficha de
// producto, que es donde la clienta lo necesita para decidir.)
const items = [
  { t: "Pieza única", d: "No existen dos iguales" },
  { t: "Impresa en 3D", d: "Terminada a mano" },
  { t: "Hecha en Colombia", d: "Con materiales locales" },
  { t: "Envíos", d: "A todo el país" },
];

export default function Beneficios() {
  return (
    <section className={css.beneficios}>
      <div className={`contenedor ${css.grid}`}>
        {items.map((i) => (
          <div key={i.t} className={css.item}>
            <span className={css.t}>{i.t}</span>
            <span className={css.d}>{i.d}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
