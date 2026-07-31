import css from "./Beneficios.module.css";

// Franja de confianza: las razones para comprar, de un vistazo. Los cuatro
// datos son verificables. (El plazo de fabricación se explica en la ficha de
// producto, que es donde la clienta lo necesita para decidir.)
//
// En inglés y en plural, por decisión de marca. El envío internacional existe
// pero se cotiza uno a uno por WhatsApp: por eso el subtítulo dice "Colombia
// and beyond" y no promete una tarifa mundial que el checkout no puede cobrar.
const items = [
  { t: "Unique pieces", d: "No two are alike" },
  { t: "3D printed", d: "Hand finished" },
  { t: "Made in Colombia", d: "With local materials" },
  { t: "Worldwide shipping", d: "Colombia and beyond" },
];

export default function Beneficios() {
  // lang="en": la página es es-CO, así que sin esto un lector de pantalla
  // leería estas frases con fonética española.
  return (
    <section className={css.beneficios} lang="en">
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
