import IconoMarca, { type SimboloMarca } from "./IconoMarca";
import css from "./Elementos.module.css";

const elementos: { icono: SimboloMarca; titulo: string; texto: string }[] = [
  { icono: "concha", titulo: "La concha", texto: "En honor a nuestra primera pieza." },
  { icono: "velero", titulo: "El velero", texto: "Por el sueño de recorrer el mundo navegando." },
  { icono: "hibisco", titulo: "El hibisco", texto: "La clara representación del Caribe en una flor." },
];

export default function Elementos() {
  return (
    <section className={`seccion ${css.elementos}`}>
      <div className="contenedor">
        <header className={`${css.encabezado} reveal`}>
          <p className="kicker">Elementos</p>
          <h2 className="titulo-seccion">
            Nuestros <span className="script">símbolos</span>
          </h2>
        </header>

        <div className={css.grilla}>
          {elementos.map((e) => (
            <div key={e.titulo} className={`${css.elemento} reveal`}>
              <IconoMarca nombre={e.icono} tamano={84} />
              <h3>{e.titulo}</h3>
              <p>{e.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
