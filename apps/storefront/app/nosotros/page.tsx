import type { Metadata } from "next";
import Concepto from "@/components/marca/Concepto";
import Manifiesto from "@/components/marca/Manifiesto";
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
            {/* Espacio literal antes del <br />: sin él, innerText concatena
                "amor" y "y" sin separación y los lectores de pantalla lo leen
                "amory". Visualmente no cambia nada. */}
            <span className="script">Del amor</span>{" "}
            <br />y del mar
          </h1>
        </div>
      </section>

      <Concepto />

      {/* El relato estaba escrito dos veces: aquí suelto y en <Manifiesto/>, que
          además trae el lockup de olas del manual. Se queda el componente. */}
      <Manifiesto />

      <ComoSeHace />
      <Elementos />
      <CierreCta />
    </>
  );
}
