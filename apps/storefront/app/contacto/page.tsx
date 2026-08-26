import type { Metadata } from "next";
import Aparece from "@/components/v2/Aparece";
import BotonWhatsApp from "./BotonWhatsApp";
import { EMAIL, WHATSAPP_VISIBLE, urlAbsoluta } from "@/lib/site";

// Ruta nueva: no existía en producción. Maqueta del mockup, datos reales.
//
// El mockup traía dos marcadores de posición que aquí se sustituyen por lo
// verificado: el correo era hola@lamarquessa.co (no recibe nada) y el WhatsApp
// era 573000000000. Se usan los de lib/site.ts, que son los que responden.
//
// Se conserva un PENDIENTE real: el horario de atención. Nadie lo ha fijado,
// y anunciar "lunes a viernes en horario laboral" sin que sea cierto es peor
// que no decir nada.

export const metadata: Metadata = {
  title: "Contacto | La Marquessa",
  description:
    "Escríbenos por WhatsApp o correo antes de encargar tu pieza. Medellín, Colombia.",
  alternates: { canonical: urlAbsoluta("/contacto") },
};

export default function Contacto() {
  return (
    <div>
      <section className="seccion-base" aria-labelledby="titular-contacto">
        <div className="contenedor">
          <Aparece className="ancho-texto">
            <p className="eyebrow eyebrow-seccion">Contacto</p>
            <h1 id="titular-contacto" className="h1 aire-arriba">
              Escríbenos antes de encargar.
            </h1>
            <p className="cuerpo aire-arriba">
              Escríbenos si dudas con la medida, si quieres un color que no está
              en la colección, o si vas a enviar la pieza fuera de Colombia.
            </p>
          </Aparece>

          <Aparece paso={1}>
            <div className="bloque-hairline ancho-texto">
              <h2 className="h3">WhatsApp</h2>
              <p className="cuerpo aire-arriba">
                Es la vía más rápida, y por donde cotizamos los envíos
                internacionales y las piezas a medida.
              </p>
              <p className="pendiente-inline">Horario de atención pendiente</p>
              <div className="aire-arriba">
                <BotonWhatsApp />
              </div>
              <p className="texto-suave aire-arriba">+57 {WHATSAPP_VISIBLE}</p>
            </div>
          </Aparece>

          <Aparece paso={2}>
            <div className="bloque-hairline ancho-texto">
              <h2 className="h3">Correo</h2>
              <p className="cuerpo aire-arriba">
                <a href={`mailto:${EMAIL}`} className="link-terciario">
                  {EMAIL}
                </a>
              </p>
            </div>
          </Aparece>

          <Aparece paso={3}>
            <div className="bloque-hairline ancho-texto">
              <h2 className="h3">Dónde estamos</h2>
              <p className="cuerpo aire-arriba">Medellín, Colombia.</p>
            </div>
          </Aparece>
        </div>
      </section>
    </div>
  );
}
