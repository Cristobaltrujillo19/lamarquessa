import type { Metadata } from "next";
import Concepto from "@/components/marca/Concepto";
import ComoSeHace from "@/components/marca/ComoSeHace";
import Elementos from "@/components/marca/Elementos";
import CierreCta from "@/components/marca/CierreCta";
import { urlAbsoluta } from "@/lib/site";
import css from "./nosotros.module.css";

export const metadata: Metadata = {
  title: "Cómo se hace un bolso La Marquessa | Nuestra historia",
  description:
    "Impresión 3D y acabado a mano, pieza por pieza, en Colombia. Conoce el proceso, los materiales y la historia detrás de cada bolso de La Marquessa.",
  alternates: { canonical: urlAbsoluta("/nosotros") },
};

export default function NosotrosPage() {
  return (
    <>
      <section className={css.cabecera}>
        <div className="contenedor" style={{ textAlign: "center" }}>
          <p className="kicker">Nuestra historia</p>
          <h1 className={css.titulo}>
            <span className="script">Del amor</span>
            <br />y del mar
          </h1>
        </div>
      </section>

      <Concepto />

      <section className={`seccion ${css.relato}`}>
        <div className={`contenedor ${css.centro} reveal`}>
          <p className={css.parrafo}>
            La vida, como el mar, no es lineal ni predecible. Todo está en
            constante movimiento, renovándose. Por eso creemos que la verdadera
            plenitud no está en la línea recta, sino en vivir en paz con la
            incertidumbre, en conexión profunda con nosotros mismos y con el
            mundo que nos rodea.
          </p>
          <p className={css.parrafo}>
            Cada ola trae una historia, y juntas componen un relato tan mágico
            como indescifrable. Ellas nos inspiran a soñar, a ser y, sobre todo,
            a crear. Así nacen nuestros bolsos: llevando la pureza del mar, su
            constante fluir y su poder de renovación.
          </p>
          <p className={css.lema}>
            De ahí venimos: del amor, del mar y del amor al mar.
          </p>
        </div>
      </section>

      <ComoSeHace />
      <Elementos />
      <CierreCta />
    </>
  );
}
