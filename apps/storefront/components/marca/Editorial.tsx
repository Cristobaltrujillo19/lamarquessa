import Carrusel from "./Carrusel";
import css from "./Editorial.module.css";

// Segundo carrete de la home: las fotos editoriales que no salen en ningún otro
// sitio. El hero muestra el producto en contexto; este lo muestra llevado, que
// es lo que ayuda a imaginárselo propio.
//
// `enfoque` (object-position) por foto. Las fotos son verticales y la franja es
// apaisada, así que solo se ve una banda: el porcentaje decide CUÁL. Estos
// valores están calculados para que el bolso quede dentro del recorte, no
// elegidos a ojo — en el bolso está la venta, no en el paisaje.
const slides = [
  {
    src: "/fotos/bolso-kruta-en-uso.jpg",
    alt: "Bolso Kruta de La Marquessa sostenido a mano frente al mar al atardecer",
    ancho: 1023,
    alto: 1537,
    enfoque: "50% 40%",
  },
  {
    src: "/fotos/bolso-menorca-en-uso.jpg",
    alt: "Mujer sentada junto al mar con el bolso Menorca de La Marquessa en el regazo",
    ancho: 1086,
    alto: 1448,
    enfoque: "50% 82%",
  },
  {
    src: "/fotos/bolso-mallorca-en-uso.jpg",
    alt: "Bolso Mallorca de La Marquessa apoyado en una terraza frente a la costa",
    ancho: 1055,
    alto: 1491,
    enfoque: "55% 85%",
  },
  {
    src: "/fotos/bolso-montt-ambiente.jpg",
    alt: "Bolso Montt de La Marquessa sobre una piedra en la playa, con el sol cayendo sobre el mar",
    ancho: 1122,
    alto: 1402,
    enfoque: "50% 65%",
  },
];

export default function Editorial() {
  return (
    <section className={`seccion ${css.editorial}`}>
      <div className="contenedor">
        <header className={`${css.encabezado} reveal`}>
          <p className="kicker">La colección en uso</p>
          <h2 className="titulo-seccion">
            Cómo se ven <span className="script">de verdad</span>
          </h2>
        </header>

        <div className={css.carrete}>
          <Carrusel slides={slides} />
        </div>
      </div>
    </section>
  );
}
