import type { Metadata } from "next";
import Aparece from "@/components/v2/Aparece";
import { formatCop } from "@/lib/productos";
import {
  ENVIO_DIAS,
  PRODUCCION_SEMANAS,
  SHIPPING_COP,
  urlAbsoluta,
} from "@/lib/site";

// Ruta nueva: no existía en producción. La maqueta viene del mockup; los datos
// son los que ya estaban publicados en la FAQ, no los briefs del mockup.
//
// El mockup traía tres de los cuatro bloques sin escribir ("Aquí van
// transportadora, plazo en días hábiles y costo"). Esos datos existen y están
// verificados en /preguntas-frecuentes, así que se traen de ahí en lugar de
// publicar un brief.
//
// NO se menciona el umbral de envío gratis: ENVIO_GRATIS_DESDE está marcado
// como [PENDIENTE: confirmar] en lib/site.ts y anunciarlo sin confirmar sería
// prometer algo que quizá no se cumple.

export const metadata: Metadata = {
  title: "Envíos y devoluciones | La Marquessa",
  description: `Cada pieza se fabrica a pedido en ${PRODUCCION_SEMANAS} semanas. Envíos a toda Colombia y cotización a medida para el resto del mundo.`,
  alternates: { canonical: urlAbsoluta("/envios") },
};

const BLOQUES = [
  {
    titulo: "Plazo de producción",
    parrafos: [
      `Cada pieza se imprime y se termina cuando ya tiene dueña. El plazo es de ${PRODUCCION_SEMANAS} semanas desde que confirmas el pedido, antes del tiempo de tránsito.`,
    ],
  },
  {
    titulo: "Colombia",
    parrafos: [
      `Tarifa plana de ${formatCop(SHIPPING_COP)} a cualquier ciudad del país. La transportadora tarda ${ENVIO_DIAS} días hábiles una vez la pieza sale del taller.`,
      "Despachamos por transportadora nacional y te entregamos el número de guía para que puedas seguir tu pedido hasta la puerta.",
    ],
  },
  {
    titulo: "Resto del mundo",
    parrafos: [
      "Enviamos fuera de Colombia. Por el momento estos envíos se coordinan uno a uno: escríbenos por WhatsApp con tu país y ciudad y te preparamos una cotización antes de la compra.",
      "Los aranceles e impuestos de destino corren por cuenta de quien recibe.",
    ],
  },
  {
    titulo: "Devoluciones",
    parrafos: [
      "Si la pieza presenta un defecto de fabricación, la devolución es enteramente gratuita: la reponemos o la reparamos sin costo, envío incluido. Escríbenos con una fotografía y lo resolvemos.",
      "Todas nuestras piezas están cubiertas por la garantía legal que exige la ley colombiana frente a defectos de fabricación.",
      "Una pieza personalizada se fabrica exclusivamente para ti, de modo que no aplica el derecho de retracto ni se aceptan cambios una vez aprobado el diseño. Por eso confirmamos contigo el color y las iniciales antes de empezar a imprimir.",
    ],
  },
];

export default function Envios() {
  return (
    <div>
      <section className="seccion-base" aria-labelledby="titular-envios">
        <div className="contenedor">
          <Aparece className="ancho-texto">
            <p className="eyebrow eyebrow-seccion">Envíos y devoluciones</p>
            <h1 id="titular-envios" className="h1 aire-arriba">
              Dos semanas de trabajo, después el viaje.
            </h1>
          </Aparece>

          <div className="aire-arriba-lg">
            {BLOQUES.map((b, i) => (
              <Aparece key={b.titulo} paso={i}>
                <div className="bloque-hairline">
                  <h2 className="h3">{b.titulo}</h2>
                  {b.parrafos.map((p, j) => (
                    <p key={j} className="cuerpo aire-arriba">
                      {p}
                    </p>
                  ))}
                </div>
              </Aparece>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
