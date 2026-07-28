import Link from "next/link";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { formatCm, formatCop } from "@/lib/productos";
import {
  ENVIO_DIAS,
  MARCA,
  MENSAJES,
  PRODUCCION_SEMANAS,
  SHIPPING_COP,
  SITE_URL,
  enlaceWhatsApp,
  urlAbsoluta,
} from "@/lib/site";
import AbrirDelHash from "./AbrirDelHash";
import css from "./preguntas.module.css";

export const metadata: Metadata = {
  title: "Preguntas frecuentes — bolsos impresos en 3D | La Marquessa",
  description:
    "¿Es realmente único? ¿Resiste? ¿Cuánto pesa? ¿Cuánto tarda? ¿Puedo devolverlo? Resolvemos las dudas reales antes de comprar un bolso impreso en 3D.",
  alternates: { canonical: urlAbsoluta("/preguntas-frecuentes") },
  openGraph: {
    type: "website",
    url: urlAbsoluta("/preguntas-frecuentes"),
    title: "Preguntas frecuentes sobre nuestros bolsos impresos en 3D",
    description:
      "Material, resistencia, capacidad, tiempos de entrega, envíos a Colombia y devoluciones. Sin letra pequeña.",
  },
};

/** Una pregunta del FAQ.
 *  `respuesta` va en texto plano a propósito: el mismo array alimenta lo que se
 *  ve en pantalla y lo que se declara en el schema FAQPage, así nunca se
 *  desincronizan (Google exige que la respuesta marcada sea la visible).
 *  `extra` es complemento visual (enlaces, tablas) que no entra al schema. */
type Pregunta = {
  /** Ancla estable: permite enlazar a una respuesta concreta (#devoluciones). */
  id: string;
  pregunta: string;
  respuesta: string[];
  extra?: React.ReactNode;
};

type Grupo = { titulo: string; preguntas: Pregunta[] };

// Peso real de cada bolso, en gramos (dato de la marca). La respuesta arma el
// rango sola, así que basta con actualizar aquí si entra un modelo nuevo.
const PESOS_GRAMOS: Record<string, number> = {
  menorca: 290,
  mallorca: 350,
  kruta: 190,
  montt: 290,
};

export default async function PreguntasFrecuentesPage() {
  const productos = await fetchQuery(api.productos.catalogo, {}).catch(() => []);

  // Las medidas salen del catálogo real (Convex), no de una copia: si se
  // corrigen desde el panel, esta página se corrige sola.
  const conMedidas = productos.filter(
    (p) => p.altoCm && p.anchoCm && p.profundidadCm,
  );
  const pesos = productos
    .map((p) => ({ nombre: p.nombre, gramos: PESOS_GRAMOS[p.slug] }))
    .filter((p): p is { nombre: string; gramos: number } => Boolean(p.gramos));
  const gramos = pesos.map((p) => p.gramos);
  const rangoPesos =
    gramos.length > 0
      ? `Entre ${Math.min(...gramos)} y ${Math.max(...gramos)} gramos, según el modelo.`
      : "Mucho menos de lo que sugiere su tamaño.";

  const grupos: Grupo[] = [
    {
      titulo: "El bolso",
      preguntas: [
        {
          id: "que-es",
          pregunta: "¿Qué es exactamente un bolso impreso en 3D?",
          respuesta: [
            "Es un bolso cuya estructura se fabrica capa sobre capa con una impresora 3D, en lugar de cortarse y coserse. No es una carcasa de plástico moldeada en serie: la forma se construye desde cero, milímetro a milímetro, y por eso puede tener curvas continuas y relieves que no se lograrían cosiendo cuero o tela.",
            "Cuando la pieza sale de la impresora todavía no es un bolso. Se ensambla, se lija y se remata a mano, una por una. Ese cruce entre máquina y mano es lo que define a La Marquessa.",
          ],
          extra: (
            <p className={css.enlace}>
              <Link href="/nosotros#proceso">Ver el proceso completo →</Link>
            </p>
          ),
        },
        {
          id: "unicos",
          pregunta: "¿De verdad no hay dos bolsos iguales?",
          respuesta: [
            "Sí, y vale la pena ser precisos: el diseño es el mismo —una Menorca es siempre una Menorca—, pero cada pieza se imprime y se termina individualmente. El relieve, el pliegue y el acabado nunca caen exactamente igual.",
            "No fabricamos por lotes ni tenemos una bodega llena de bolsos idénticos esperando comprador. Tu bolso empieza a existir el día que lo pides.",
          ],
        },
        {
          id: "material",
          pregunta: "¿De qué material está hecho? ¿Qué es el PLA?",
          respuesta: [
            "De PLA, un bioplástico de origen vegetal que compramos a un proveedor colombiano. Es rígido, liviano y estable en el tiempo.",
            "Al venir de fuentes vegetales renovables, su huella es menor que la de un plástico derivado del petróleo. Dicho con honestidad: el PLA no se degrada solo en casa ni en un relleno sanitario común, necesita compostaje industrial. Un bolso que dura años y no se reemplaza cada temporada sigue siendo, en la práctica, su mejor argumento ambiental.",
          ],
        },
        {
          id: "acabados",
          pregunta: "¿Qué acabados existen?",
          respuesta: [
            "Tres, iguales para los cuatro modelos: Amanecer, un rosa nude cálido; Caribe, un azul con destellos; y Horizonte, un bicolor en negro y rojo con caída de seda.",
            "Cada acabado se comporta distinto según la luz, así que ninguna foto lo cuenta del todo. Si dudas entre dos, escríbenos y te mandamos fotos reales del que te interese. Y si el color que buscas no está, se puede pedir a la medida.",
          ],
          extra: (
            <p className={css.enlace}>
              <Link href="#personalizacion">Ver cómo se personaliza →</Link>
            </p>
          ),
        },
        {
          id: "capacidad",
          pregunta: "¿Cabe un celular? ¿Qué cabe adentro?",
          respuesta: [
            "Sí. Un celular de pantalla grande ronda los 16 cm de alto y entra en los cuatro modelos, junto con lo esencial del día: llaves, tarjetas, labial y audífonos.",
            "Ninguno es un bolso de laptop ni de cuaderno: son piezas de mano, y esa es justamente la idea. Estas son las medidas exteriores de cada uno.",
          ],
          extra: conMedidas.length > 0 && (
            <div className={css.tablaEnvoltura}>
              <table className={css.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Bolso</th>
                    <th scope="col">Alto</th>
                    <th scope="col">Ancho</th>
                    <th scope="col">Profundidad</th>
                  </tr>
                </thead>
                <tbody>
                  {conMedidas.map((p) => (
                    <tr key={p.slug}>
                      <th scope="row">
                        <Link href={`/producto/${p.slug}`}>{p.nombre}</Link>
                      </th>
                      <td>{formatCm(p.altoCm!)}</td>
                      <td>{formatCm(p.anchoCm!)}</td>
                      <td>{formatCm(p.profundidadCm!)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: "peso",
          pregunta: "¿Cuánto pesa?",
          respuesta: [
            `${rangoPesos} Son piezas huecas, sin forro, sin herrajes y sin partes metálicas: casi todo el peso es la estructura impresa, y el PLA es un material liviano.`,
          ],
          extra: pesos.length > 0 && (
            <ul className={css.listaPesos}>
              {pesos.map((p) => (
                <li key={p.nombre}>
                  {p.nombre}: {p.gramos} g
                </li>
              ))}
            </ul>
          ),
        },
        {
          id: "resistencia",
          pregunta: "¿Resiste el uso diario?",
          respuesta: [
            "Está hecho para usarse, no para mirarse. La estructura impresa es rígida y mantiene su forma sola: no se descuelga ni se deforma como un bolso de tela, y no necesita relleno para verse bien.",
            "Dos cuidados que sí importan. El PLA se ablanda con el calor fuerte, así que no lo dejes dentro del carro cerrado al sol ni junto a una fuente de calor. Y al ser una pieza rígida, un golpe seco contra el piso lo afecta más que a un bolso blando.",
            "Todos nuestros bolsos están cubiertos por la garantía legal que exige la ley colombiana frente a defectos de fabricación.",
          ],
        },
        {
          id: "cuidado",
          pregunta: "¿Cómo lo limpio y lo cuido?",
          respuesta: [
            "Para el día a día basta un paño suave y seco. Si hace falta más, humedécelo apenas con agua y seca enseguida. No uses limpiadores abrasivos ni solventes, y no lo sumerjas.",
            "Guárdalo lejos del sol directo y del calor. Bien cuidado, el acabado se mantiene como el primer día.",
          ],
        },
        {
          id: "donde",
          pregunta: "¿Dónde se fabrican?",
          respuesta: [
            "En Colombia, uno por uno. El PLA con el que se imprimen también lo compramos a un proveedor colombiano.",
          ],
        },
      ],
    },
    {
      titulo: "Compra, envío y devoluciones",
      preguntas: [
        {
          id: "tiempos",
          pregunta: "¿Cuánto tarda en llegar?",
          respuesta: [
            `Cada bolso se fabrica cuando lo pides, no antes: la producción toma ${PRODUCCION_SEMANAS} semanas. A eso se le suman ${ENVIO_DIAS} días hábiles de transportadora, así que en total son unas ${PRODUCCION_SEMANAS} semanas y media desde que confirmas el pedido hasta que lo tienes en la mano.`,
            "Si lo necesitas para una fecha concreta, escríbenos antes de comprar y te confirmamos si alcanzamos a llegar.",
          ],
          extra: (
            <p className={css.enlace}>
              <a
                href={enlaceWhatsApp(MENSAJES.pedido)}
                target="_blank"
                rel="noopener"
              >
                Preguntar por WhatsApp →
              </a>
            </p>
          ),
        },
        {
          id: "envios",
          pregunta: "¿Envían a toda Colombia? ¿Cuánto cuesta el envío?",
          respuesta: [
            `Sí, a todo el país. El envío tiene una tarifa plana de ${formatCop(SHIPPING_COP)}, sin importar la ciudad, y tarda ${ENVIO_DIAS} días hábiles una vez el bolso está listo.`,
            "Despachamos por transportadora nacional y te entregamos el número de guía para que puedas seguir tu pedido hasta la puerta.",
          ],
        },
        {
          id: "internacional",
          pregunta: "¿Envían fuera de Colombia?",
          respuesta: [
            "Sí, pero por ahora esos envíos los coordinamos uno a uno. Escríbenos por WhatsApp con tu país y ciudad y te cotizamos el envío antes de que compres.",
          ],
          extra: (
            <p className={css.enlace}>
              <a
                href={enlaceWhatsApp(MENSAJES.pedido)}
                target="_blank"
                rel="noopener"
              >
                Cotizar un envío internacional →
              </a>
            </p>
          ),
        },
        {
          id: "personalizacion",
          pregunta: "¿Puedo pedirlo personalizado?",
          // No se anuncia precio porque no hay lista: cada pedido se cotiza en
          // el momento. Tampoco se promete garantía sobre la personalización,
          // pero no se publica una renuncia a la garantía legal: la Ley 1480
          // no permite excluirla y una cláusula así sería ineficaz.
          respuesta: [
            "Sí, de dos formas: puedes pedir un color específico, aunque no esté entre los tres acabados, y puedes agregar tus iniciales en la parte inferior del bolso.",
            "El costo depende de lo que pidas y te lo cotizamos en el momento: nos escribes por WhatsApp, nos cuentas qué tienes en mente y te confirmamos precio y tiempos ahí mismo.",
            "Una pieza personalizada se fabrica solo para ti, así que no aplica el derecho de retracto ni aceptamos cambios una vez apruebas el diseño. Por eso confirmamos contigo el color y las iniciales antes de empezar a imprimir.",
          ],
          extra: (
            <p className={css.enlace}>
              <a
                href={enlaceWhatsApp(MENSAJES.pedido)}
                target="_blank"
                rel="noopener"
              >
                Cotizar una personalización →
              </a>
            </p>
          ),
        },
        {
          id: "pago",
          pregunta: "¿Cómo puedo pagar?",
          // ⚠️ Actualizar esta respuesta en cuanto Mercado Pago quede conectado
          // (PSE, tarjetas y billeteras). Hoy /checkout no cobra, así que decir
          // que se paga en línea sería falso.
          respuesta: [
            "Hoy cerramos cada pedido por WhatsApp: nos escribes, confirmamos el bolso y el acabado que quieres, y de ahí coordinamos el pago y el envío.",
            "Es un paso más, pero también significa que hablas con una persona antes de que empecemos a fabricar tu pieza.",
          ],
          extra: (
            <p className={css.enlace}>
              <a
                href={enlaceWhatsApp(MENSAJES.pedido)}
                target="_blank"
                rel="noopener"
              >
                Escribir por WhatsApp →
              </a>
            </p>
          ),
        },
        {
          id: "devoluciones",
          pregunta: "¿Puedo devolverlo o cambiarlo?",
          // ⚠️ [PENDIENTE: revisión de un abogado y política propia de la marca].
          // Lo que dice aquí es el piso legal colombiano (Ley 1480 de 2011):
          // retracto en ventas a distancia y garantía legal por defectos.
          respuesta: [
            "Si el bolso tiene un defecto de fabricación, la devolución es totalmente gratis: lo reponemos o lo reparamos sin ningún costo para ti, envío incluido. Escríbenos con una foto y lo resolvemos.",
            "Si simplemente te arrepentiste, también puedes devolverlo: al ser una compra a distancia tienes derecho de retracto dentro de los cinco (5) días hábiles siguientes a la entrega, devolviendo el bolso en el mismo estado en que lo recibiste. En ese caso el flete de la devolución lo asumes tú, y te reembolsamos a más tardar treinta (30) días calendario después.",
            "Las piezas personalizadas quedan por fuera de todo esto: se fabrican solo para ti, así que no aceptamos retracto ni cambios una vez apruebas el diseño.",
          ],
        },
      ],
    },
  ];

  const todas = grupos.flatMap((g) => g.preguntas);

  // Datos estructurados de la página de preguntas. Nota realista: desde 2023
  // Google ya casi no muestra el resultado enriquecido de FAQ para sitios
  // comerciales, pero el marcado sigue siendo lo que leen los buscadores con IA
  // (AI Overviews, ChatGPT, Perplexity) para citar respuestas concretas.
  const schemaFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "es-CO",
    mainEntity: todas.map((p) => ({
      "@type": "Question",
      name: p.pregunta,
      acceptedAnswer: { "@type": "Answer", text: p.respuesta.join(" ") },
    })),
  };

  const schemaMigas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Preguntas frecuentes",
        item: urlAbsoluta("/preguntas-frecuentes"),
      },
    ],
  };

  return (
    <>
      <AbrirDelHash />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMigas) }}
      />

      <section className={css.cabecera}>
        <div className="contenedor">
          <p className="kicker">Antes de comprar</p>
          <h1 className={css.titulo}>
            Preguntas <span className="script">frecuentes</span>
          </h1>
          <p className={css.entrada}>
            Todo lo que solemos responder por WhatsApp sobre un bolso impreso en
            3D: de qué está hecho, cuánto aguanta, qué cabe adentro y qué pasa si
            te arrepientes.
          </p>
        </div>
      </section>

      <div className={`contenedor ${css.cuerpo}`}>
        {grupos.map((grupo) => (
          <section key={grupo.titulo} className={css.grupo}>
            <h2 className={css.tituloGrupo}>{grupo.titulo}</h2>

            <div className={css.acordeon}>
              {grupo.preguntas.map((p, i) => (
                <details
                  key={p.id}
                  id={p.id}
                  className={css.item}
                  // La primera queda abierta: es la objeción que más pesa y da a
                  // entender de un vistazo que esto se despliega.
                  open={grupo === grupos[0] && i === 0}
                >
                  <summary className={css.pregunta}>
                    <h3 className={css.textoPregunta}>{p.pregunta}</h3>
                    <span className={css.signo} aria-hidden="true" />
                  </summary>
                  <div className={css.respuesta}>
                    {p.respuesta.map((parrafo, j) => (
                      <p key={j}>{parrafo}</p>
                    ))}
                    {p.extra}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <aside className={css.cierre}>
          <p className="kicker">¿Te quedó una duda?</p>
          <h2 className={css.tituloCierre}>Escríbenos y te respondemos</h2>
          <p className={css.entradaCierre}>
            Detrás de {MARCA} hay una persona, no un formulario. Pregunta lo que
            necesites antes de decidirte.
          </p>
          <div className={css.acciones}>
            <a
              href={enlaceWhatsApp(MENSAJES.general)}
              target="_blank"
              rel="noopener"
              className="boton boton-primario"
            >
              Escribir por WhatsApp
            </a>
            <Link href="/tienda" className="boton boton-fantasma">
              Ver la colección
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
