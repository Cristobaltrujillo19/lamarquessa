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
    // Hero editorial: dos Kruta Caribe flotando en la piscina, vista cenital.
    src: "/fotos/editorial-bolsos-piscina.jpg",
    alt: "Dos bolsos Kruta de La Marquessa flotando sobre agua cristalina turquesa",
    ancho: 1600,
    alto: 1200,
    enfoque: "60% 50%",
  },
  {
    src: "/fotos/bolso-kruta-en-uso.jpg",
    alt: "Mujer bebiendo agua de coco con el bolso Kruta Caribe de La Marquessa en mano",
    ancho: 1080,
    alto: 1440,
    enfoque: "50% 90%",
  },
  {
    src: "/fotos/editorial-amanecer-torso.jpg",
    alt: "Dos bolsos Menorca y Montt en acabado Amanecer junto a la piscina",
    ancho: 1080,
    alto: 1440,
    enfoque: "50% 85%",
  },
  {
    src: "/fotos/bolso-menorca-en-uso.jpg",
    alt: "Bolso Menorca de La Marquessa en tono Amanecer, sostenido con la mano junto al agua",
    ancho: 1080,
    alto: 1440,
    enfoque: "50% 80%",
  },
  {
    src: "/fotos/bolso-mallorca-en-uso.jpg",
    alt: "Bolso Mallorca de La Marquessa en acabado Horizonte, alzado frente al cielo",
    ancho: 1080,
    alto: 1440,
    enfoque: "50% 40%",
  },
  {
    src: "/fotos/editorial-menorca-mallorca.jpg",
    alt: "Menorca y Mallorca de La Marquessa en pareja, junto a la piscina",
    ancho: 1080,
    alto: 1440,
    enfoque: "50% 60%",
  },
];

export default function Editorial() {
  return (
    <section className={`seccion ${css.editorial}`}>
      <div className="contenedor">
        <div className={css.carrete}>
          <Carrusel slides={slides} ajuste="contain" />
        </div>
      </div>
    </section>
  );
}
