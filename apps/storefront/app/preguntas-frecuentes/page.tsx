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
import Pregunta from "./Pregunta";
import css from "./preguntas.module.css";

export const metadata: Metadata = {
  title: "Preguntas frecuentes — bolsos impresos en 3D | La Marquessa",
  description:
    "Bolsos impresos en 3D La Marquessa: material, medidas, 2 semanas de fabricación, envíos a Colombia y al mundo, cambios y cuidados. Todo antes de comprar.",
  alternates: { canonical: urlAbsoluta("/preguntas-frecuentes") },
  openGraph: {
    type: "website",
    url: urlAbsoluta("/preguntas-frecuentes"),
    title: "Preguntas frecuentes sobre nuestros bolsos impresos en 3D",
    description:
      "Material, medidas, 2 semanas de fabricación, envíos a Colombia y al mundo, cambios y cuidados. Todo antes de comprar.",
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
      titulo: "La pieza",
      preguntas: [
        {
          id: "que-es",
          pregunta: "¿Qué es exactamente un bolso impreso en 3D?",
          respuesta: [
            "Es un bolso cuya estructura se fabrica capa sobre capa con una impresora 3D, en lugar de cortarse y coserse. No se trata de una carcasa de plástico moldeada en serie: la forma se construye desde cero, milímetro a milímetro, y por eso admite curvas continuas y relieves imposibles de lograr con cuero o tela.",
            "Cuando la pieza sale de la impresora aún no es un bolso. Se ensambla, se lija y se remata a mano, una por una. Ese cruce entre máquina y mano es lo que define a La Marquessa.",
          ],
          extra: (
            <p className={css.enlace}>
              <Link href="/nosotros#proceso" className="link-terciario">
                Conocer el proceso completo →
              </Link>
            </p>
          ),
        },
        {
          id: "unicos",
          pregunta: "¿Es cierto que no existen dos bolsos iguales?",
          respuesta: [
            "Sí. El diseño es el mismo —una Menorca es siempre una Menorca—, pero cada pieza se imprime y se termina de manera individual. El relieve, el pliegue y el acabado nunca caen exactamente igual.",
            "No fabricamos por lotes ni conservamos una bodega llena de bolsos idénticos a la espera de un comprador. Su bolso empieza a existir el día en que usted lo pide.",
          ],
        },
        {
          id: "material",
          pregunta: "¿De qué material está hecho? ¿Qué es el PLA?",
          respuesta: [
            "De PLA: un bioplástico de origen vegetal que adquirimos a un proveedor colombiano. Es rígido, liviano y estable en el tiempo.",
            "Al provenir de fuentes vegetales renovables, su huella es menor que la de un plástico derivado del petróleo. Con toda honestidad: el PLA no se degrada por sí solo en casa ni en un relleno sanitario común, requiere compostaje industrial. Una pieza que dura años y no se reemplaza cada temporada sigue siendo, en la práctica, su mejor argumento ambiental.",
          ],
        },
        {
          id: "acabados",
          pregunta: "¿Qué acabados están disponibles?",
          respuesta: [
            "Tres, iguales para los cuatro modelos: Amanecer, un rosa nude cálido; Caribe, un azul con destellos; y Horizonte, un bicolor en negro y rojo con caída de seda.",
            "Cada acabado se comporta de manera distinta según la luz, y ninguna fotografía lo captura del todo. Si duda entre dos, escríbanos y le enviaremos imágenes reales del que le interese. Y si el color que busca no figura entre estos, puede solicitarse a medida.",
          ],
          extra: (
            <p className={css.enlace}>
              <Link href="#personalizacion" className="link-terciario">
                Ver cómo se personaliza →
              </Link>
            </p>
          ),
        },
        {
          id: "capacidad",
          pregunta: "¿Cabe un celular? ¿Qué puede llevarse dentro?",
          // Dato de la marca: en Menorca el celular NO entra. Es la excepción y
          // se dice claro: que llegue y no quepa el teléfono es justo el tipo
          // de sorpresa que termina en devolución.
          respuesta: [
            "En Mallorca, Kruta y Montt, sí: cabe un celular de pantalla grande junto con lo esencial del día — llaves, tarjetas, labial y audífonos.",
            "En Menorca no. Alcanza para lo justo —tarjetas, llaves, labial—, pero el celular no entra. Si le gusta esa silueta y necesita llevar el teléfono, Mallorca es su talla grande: mismo diseño, más cuerpo.",
            "Ninguna de las piezas está pensada para computador ni cuaderno: son bolsos de mano, y esa es precisamente la intención. Estas son las medidas exteriores de cada uno.",
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
                        <Link href={`/producto/${p.slug}`} className="link-terciario">
                          {p.nombre}
                        </Link>
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
            `${rangoPesos} Son piezas huecas, sin forro, sin herrajes ni partes metálicas: casi todo el peso es la estructura impresa, y el PLA es un material notablemente liviano.`,
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
            "Está pensado para llevarse, no solo para admirarse. La estructura impresa es rígida y conserva su forma por sí sola: no se descuelga ni se deforma como un bolso de tela, ni requiere relleno para lucir bien.",
            "Dos cuidados que sí conviene tener presentes. El PLA se ablanda con el calor intenso, por lo que le recomendamos no dejarlo dentro del automóvil al sol ni cerca de una fuente de calor. Y, al ser una pieza rígida, un golpe seco contra el piso lo afecta más que a un bolso blando.",
            "Todas nuestras piezas están cubiertas por la garantía legal que exige la ley colombiana frente a defectos de fabricación.",
          ],
        },
        {
          id: "cuidado",
          pregunta: "¿Cómo se limpia y se cuida?",
          respuesta: [
            "Para el uso cotidiano basta un paño suave y seco. Si se requiere algo más, humedézcalo apenas con agua y seque de inmediato. No emplee limpiadores abrasivos ni solventes, y en ningún caso lo sumerja.",
            "Guárdelo lejos del sol directo y del calor. Con estos cuidados, el acabado se mantiene como el primer día.",
          ],
        },
        {
          id: "donde",
          pregunta: "¿Dónde se fabrican?",
          respuesta: [
            "En Colombia, una a una. El PLA con el que se imprimen también proviene de un proveedor colombiano.",
          ],
        },
      ],
    },
    {
      titulo: "Compra, envío y cambios",
      preguntas: [
        {
          id: "tiempos",
          pregunta: "¿Cuánto tarda en llegar?",
          respuesta: [
            `Cada bolso se fabrica cuando usted lo pide, no antes: la producción toma ${PRODUCCION_SEMANAS} semanas. A ese plazo se le suman ${ENVIO_DIAS} días hábiles de transportadora, de modo que son cerca de ${PRODUCCION_SEMANAS} semanas y media desde que se confirma el pedido hasta que llega a sus manos.`,
            "Si necesita la pieza para una fecha determinada, escríbanos antes de comprar y le confirmaremos si alcanzamos a llegar.",
          ],
          extra: (
            <p className={css.enlace}>
              <a
                href={enlaceWhatsApp(MENSAJES.pedido)}
                target="_blank"
                rel="noopener"
                className="link-terciario"
              >
                Consultar por WhatsApp →
              </a>
            </p>
          ),
        },
        {
          id: "envios",
          pregunta: "¿Cuál es el costo del envío nacional?",
          respuesta: [
            `Enviamos a todo el territorio colombiano con una tarifa plana de ${formatCop(SHIPPING_COP)}, sin importar la ciudad. La entrega toma ${ENVIO_DIAS} días hábiles desde que la pieza está lista.`,
            "Despachamos por transportadora nacional y le entregamos el número de guía para que pueda seguir su pedido hasta la puerta.",
          ],
        },
        {
          id: "internacional",
          pregunta: "¿Realizan envíos internacionales?",
          respuesta: [
            "Sí. Por el momento estos envíos se coordinan uno a uno: escríbanos por WhatsApp con su país y ciudad y le prepararemos una cotización antes de la compra.",
          ],
          extra: (
            <p className={css.enlace}>
              <a
                href={enlaceWhatsApp(MENSAJES.pedido)}
                target="_blank"
                rel="noopener"
                className="link-terciario"
              >
                Cotizar un envío internacional →
              </a>
            </p>
          ),
        },
        {
          id: "personalizacion",
          pregunta: "¿Es posible pedirlo personalizado?",
          // No se anuncia precio porque no hay lista: cada pedido se cotiza en
          // el momento. Tampoco se promete garantía sobre la personalización,
          // pero no se publica una renuncia a la garantía legal: la Ley 1480
          // no permite excluirla y una cláusula así sería ineficaz.
          respuesta: [
            "Sí, en dos formas: puede solicitar un color específico, aunque no figure entre los tres acabados, y puede añadir sus iniciales en la parte inferior de la pieza.",
            "El costo depende de lo que se solicite y se cotiza al momento: escríbanos por WhatsApp, cuéntenos qué tiene en mente y le confirmaremos precio y tiempos allí mismo.",
            "Una pieza personalizada se fabrica exclusivamente para usted, de modo que no aplica el derecho de retracto ni se aceptan cambios una vez aprobado el diseño. Por eso confirmamos con usted el color y las iniciales antes de empezar a imprimir.",
          ],
          extra: (
            <p className={css.enlace}>
              <a
                href={enlaceWhatsApp(MENSAJES.pedido)}
                target="_blank"
                rel="noopener"
                className="link-terciario"
              >
                Cotizar una personalización →
              </a>
            </p>
          ),
        },
        {
          id: "pago",
          pregunta: "¿Qué medios de pago aceptan?",
          respuesta: [
            "El pago se realiza en línea, con Mercado Pago, al finalizar la compra. Puede pagar con tarjeta de crédito o débito, PSE, transferencia con Bancolombia o Efecty.",
            "Nosotros no vemos ni almacenamos los datos de su tarjeta: es Mercado Pago quien los procesa. Recibirá la confirmación por correo tan pronto se acredite el pago.",
            "Si prefiere coordinar la compra de manera personal, también puede hacerlo por WhatsApp.",
          ],
          extra: (
            <p className={css.enlace}>
              <a
                href={enlaceWhatsApp(MENSAJES.pedido)}
                target="_blank"
                rel="noopener"
                className="link-terciario"
              >
                Escribirnos por WhatsApp →
              </a>
            </p>
          ),
        },
        {
          id: "devoluciones",
          pregunta: "¿Se aceptan devoluciones o cambios?",
          // ⚠️ [PENDIENTE: revisión de un abogado]. Política de la marca: sin
          // reembolso si el bolso llegó bien, solo cambio. Ojo: el derecho de
          // retracto (Ley 1480 art. 47) es obligatorio en ventas a distancia y
          // una cláusula que lo niegue sería ineficaz, salvo que un bolso caiga
          // en la excepción de "bienes de uso personal". Eso lo tiene que
          // confirmar un abogado antes de dar este texto por definitivo.
          respuesta: [
            "Si la pieza presenta un defecto de fabricación, la devolución es enteramente gratuita: la reponemos o la reparamos sin costo para usted, envío incluido. Escríbanos con una fotografía y lo resolveremos.",
            "Si el bolso llegó en perfectas condiciones y sencillamente ha cambiado de parecer, no realizamos reembolsos en dinero, pero sí lo cambiamos por otro dentro de los 15 días calendario siguientes a la entrega. La pieza debe encontrarse sin usar y en las mismas condiciones en que la recibió, y el flete de ida y vuelta corre por su cuenta.",
            "Si elige un bolso de mayor valor, puede abonar la diferencia; si es de menor valor, ese es el cambio.",
            "Las piezas personalizadas quedan por fuera de esta política: se fabrican exclusivamente para usted, por lo que no se aceptan cambios una vez aprobado el diseño.",
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

      <section className="seccion-base" aria-labelledby="titular-faq">
        <div className={`contenedor ${css.cuerpo}`}>
          <div className={css.cabecera}>
            <p className="eyebrow eyebrow-seccion">Antes de su compra</p>
            <h1 id="titular-faq" className="h1 aire-arriba">
              Preguntas frecuentes.
            </h1>
            <p className={`cuerpo ${css.entrada}`}>
              Reunimos aquí lo esencial para adquirir una pieza La Marquessa con
              plena confianza: de qué está hecha, cuánto resiste, qué puede
              llevar dentro y qué ocurre si necesita un cambio.
            </p>
          </div>
        {grupos.map((grupo) => (
          <section key={grupo.titulo} className={css.grupo}>
            <h2 className={`h3 ${css.tituloGrupo}`}>{grupo.titulo}</h2>

            <div className={css.acordeon}>
              {grupo.preguntas.map((p, i) => (
                <Pregunta
                  key={p.id}
                  id={p.id}
                  pregunta={p.pregunta}
                  respuesta={p.respuesta}
                  extra={p.extra}
                  // La primera queda abierta: es la objeción que más pesa y da a
                  // entender de un vistazo que esto se despliega.
                  abierta={grupo === grupos[0] && i === 0}
                />
              ))}
            </div>
          </section>
        ))}

        <aside className={css.cierre}>
          <p className="eyebrow eyebrow-seccion">¿Le queda alguna duda?</p>
          <h2 className={`h3 ${css.tituloCierre}`}>Estamos a su disposición</h2>
          <p className={css.entradaCierre}>
            Detrás de {MARCA} hay una persona, no un formulario. Escríbanos con
            toda tranquilidad antes de decidirse.
          </p>
          <div className={css.acciones}>
            <a
              href={enlaceWhatsApp(MENSAJES.general)}
              target="_blank"
              rel="noopener"
              className="btn btn-primario"
            >
              Escribir por WhatsApp
            </a>
            <Link href="/tienda" className="btn btn-secundario">
              Ver la colección
            </Link>
          </div>
        </aside>
        </div>
      </section>
    </>
  );
}
