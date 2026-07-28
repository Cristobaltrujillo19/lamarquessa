import Link from "next/link";
import Carrusel from "./Carrusel";
import { TAGLINE } from "@/lib/site";
import css from "./Hero.module.css";

// Mezcla de fotos de los productos en contexto: es lo que despierta el deseo
// y, de paso, muestra piezas distintas de la colección.
const slides = [
  {
    src: "/fotos/bolso-menorca-ambiente.jpg",
    alt: "Bolso Menorca de La Marquessa sobre un pedestal frente al mar, al atardecer",
    ancho: 1472,
    alto: 1068,
    enfoque: "50% 58%",
  },
  {
    src: "/fotos/bolso-montt-en-uso.jpg",
    alt: "Bolso Montt de La Marquessa llevado a mano en la playa",
    ancho: 1023,
    alto: 1537,
    enfoque: "42% 82%",
  },
  {
    src: "/fotos/bolso-mallorca-ambiente.jpg",
    alt: "Bolso Mallorca de La Marquessa sobre la cubierta de un velero al atardecer",
    ancho: 1083,
    alto: 1453,
    enfoque: "52% 60%",
  },
  {
    src: "/fotos/bolso-kruta-ambiente.jpg",
    alt: "Bolso Kruta de La Marquessa sobre una roca junto al mar",
    ancho: 1086,
    alto: 1448,
    enfoque: "50% 55%",
  },
];

export default function Hero() {
  return (
    <section id="inicio" className={css.hero}>
      <div className={css.top}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marca/logo-cobre.png"
          alt="La Marquessa"
          className={css.logo}
          width={1000}
          height={285}
          fetchPriority="high"
        />
        <h1 className={css.titular}>
          Bolsos únicos, impresos en 3D y terminados a mano
        </h1>
        <p className={css.tagline}>{TAGLINE}</p>
      </div>

      <Carrusel slides={slides} />

      <div className={css.cta}>
        <Link className="boton boton-primario" href="/tienda">
          Ver la colección
        </Link>
        <Link className="boton boton-fantasma" href="/nosotros">
          Cómo se hacen
        </Link>
      </div>
    </section>
  );
}
