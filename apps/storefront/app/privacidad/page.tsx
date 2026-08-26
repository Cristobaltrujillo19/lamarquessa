import Link from "next/link";
import type { Metadata } from "next";
import { EMAIL, MARCA, urlAbsoluta } from "@/lib/site";
import css from "./privacidad.module.css";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos personales | La Marquessa",
  description:
    "Política de tratamiento de datos personales de La Marquessa. Cómo recogemos, usamos y protegemos tus datos, y cómo ejercer tus derechos (Ley 1581, Colombia).",
  alternates: { canonical: urlAbsoluta("/privacidad") },
};

// Fecha de la última revisión del documento. Actualizarla en cada cambio: la
// ley exige que la política indique su fecha de entrada en vigencia.
const ACTUALIZADA = "28 de julio de 2026";

export default function PrivacidadPage() {
  return (
    <section className="seccion-base" aria-labelledby="titular-privacidad">
      <article className={`contenedor ${css.texto}`}>
        <p className="eyebrow eyebrow-seccion">Legal</p>
        <h1 id="titular-privacidad" className="h2 aire-arriba">
          Política de tratamiento de datos personales
        </h1>
        <p className={css.meta}>
          Ley 1581 de 2012 y Decreto 1377 de 2013 · Última actualización:{" "}
          {ACTUALIZADA}
        </p>

        <p className={css.aviso}>
          ⚠️ <strong>Borrador de referencia.</strong> Este texto debe ser
          revisado por un abogado y completado con los datos legales reales de
          la marca (razón social, NIT, domicilio y teléfono) antes de
          considerarse definitivo. Los campos marcados como{" "}
          <em>[pendiente]</em> están sin diligenciar.
        </p>

        <h2>1. Responsable del tratamiento</h2>
        <p>
          {MARCA} <em>[pendiente: razón social]</em>, identificada con NIT{" "}
          <em>[pendiente]</em>, con domicilio en <em>[pendiente]</em>, Colombia,
          es la responsable del tratamiento de los datos personales que recoge a
          través de este sitio.
        </p>
        <ul>
          <li>
            Correo de contacto: <a href={`mailto:${EMAIL}`} className="link-terciario">
            {EMAIL}
          </a>
          </li>
          <li>
            Teléfono / WhatsApp: <em>[pendiente]</em>
          </li>
        </ul>

        <h2>2. Qué datos recogemos</h2>
        <p>Recogemos únicamente los datos necesarios para operar la tienda:</p>
        <ul>
          <li>
            <strong>Identificación y contacto:</strong> nombre, correo
            electrónico y número de teléfono o WhatsApp.
          </li>
          <li>
            <strong>Datos de envío:</strong> dirección, ciudad y departamento.
          </li>
          <li>
            <strong>Datos de la compra:</strong> productos, montos y estado del
            pedido. <strong>No almacenamos datos de tarjetas de crédito ni
            débito:</strong> el pago lo procesa la pasarela, que recibe esos
            datos directamente.
          </li>
          <li>
            <strong>Datos de navegación:</strong> páginas vistas y
            comportamiento agregado, mediante cookies y tecnologías similares
            (ver sección 8).
          </li>
        </ul>
        <p>
          No recogemos datos sensibles (salud, origen étnico, convicciones
          religiosas o políticas, datos biométricos) ni datos de niñas, niños y
          adolescentes.
        </p>

        <h2>3. Para qué los usamos</h2>
        <ul>
          <li>Gestionar, preparar y enviar tus pedidos.</li>
          <li>Responder tus mensajes y solicitudes de información.</li>
          <li>
            Informarte sobre el estado de tu pedido y coordinar la entrega.
          </li>
          <li>
            Enviarte novedades, lanzamientos y promociones,{" "}
            <strong>solo si lo autorizas expresamente</strong>.
          </li>
          <li>
            Entender de forma agregada cómo se usa el sitio para mejorarlo.
          </li>
          <li>Cumplir obligaciones legales, contables y tributarias.</li>
        </ul>

        <h2>4. Autorización</h2>
        <p>
          Al entregarnos tus datos para realizar un pedido o contactarnos,
          autorizas su tratamiento conforme a esta política. La autorización
          para envíos comerciales se solicita de forma separada y puedes
          revocarla en cualquier momento, sin que ello afecte la gestión de tus
          compras.
        </p>

        <h2>5. Tus derechos como titular</h2>
        <p>
          Conforme al artículo 8 de la Ley 1581 de 2012, en cualquier momento
          puedes:
        </p>
        <ul>
          <li>
            <strong>Conocer, actualizar y rectificar</strong> tus datos
            personales.
          </li>
          <li>
            <strong>Solicitar prueba</strong> de la autorización que nos
            otorgaste.
          </li>
          <li>
            <strong>Ser informado</strong> sobre el uso que le hemos dado a tus
            datos.
          </li>
          <li>
            <strong>Presentar quejas</strong> ante la Superintendencia de
            Industria y Comercio (SIC) por infracciones a la ley.
          </li>
          <li>
            <strong>Revocar la autorización</strong> o solicitar la supresión de
            tus datos, cuando no exista un deber legal o contractual que lo
            impida.
          </li>
          <li>
            <strong>Acceder gratuitamente</strong> a tus datos personales.
          </li>
        </ul>

        <h2>6. Cómo ejercerlos: consultas y reclamos</h2>
        <p>
          Escríbenos a <a href={`mailto:${EMAIL}`} className="link-terciario">
            {EMAIL}
          </a> indicando tu
          nombre, tu solicitud y un dato de contacto. Los plazos que cumplimos
          son los que fija la ley:
        </p>
        <ul>
          <li>
            <strong>Consultas:</strong> se atienden en un máximo de{" "}
            <strong>diez (10) días hábiles</strong>. Si no fuera posible, te
            informamos los motivos y la fecha de respuesta, que no superará los
            cinco (5) días hábiles siguientes.
          </li>
          <li>
            <strong>Reclamos:</strong> se atienden en un máximo de{" "}
            <strong>quince (15) días hábiles</strong>. Si no fuera posible, te
            informamos los motivos y la nueva fecha, que no superará los ocho
            (8) días hábiles siguientes.
          </li>
        </ul>
        <p>
          Si el reclamo llega incompleto, te pediremos que lo completes dentro
          de los cinco (5) días siguientes a su recepción.
        </p>

        <h2>7. Con quién compartimos tus datos</h2>
        <p>
          No vendemos tus datos. Los compartimos únicamente con proveedores que
          nos permiten operar la tienda, y solo con esa finalidad:
        </p>
        <ul>
          <li>
            <strong>Pasarela de pagos</strong> (Mercado Pago): procesa el pago;
            recibe tus datos de pago directamente.
          </li>
          <li>
            <strong>Transportadoras:</strong> reciben tu nombre, dirección y
            teléfono para entregarte el pedido.
          </li>
          <li>
            <strong>Proveedores de infraestructura</strong> (alojamiento web y
            base de datos): almacenan la información del sitio y de los pedidos.
          </li>
          <li>
            <strong>Herramientas de analítica y publicidad</strong> (Google,
            Meta): reciben datos de navegación de forma agregada. Algunos de
            estos proveedores están fuera de Colombia, por lo que puede existir
            transferencia internacional de datos, siempre bajo estándares de
            seguridad equivalentes.
          </li>
        </ul>

        <h2>8. Cookies y tecnologías de seguimiento</h2>
        <p>
          Este sitio usa cookies propias y de terceros para que la tienda
          funcione (por ejemplo, recordar tu carrito) y para entender de forma
          agregada cómo se navega. Puedes borrarlas o bloquearlas desde la
          configuración de tu navegador; ten en cuenta que algunas funciones,
          como el carrito, podrían dejar de funcionar correctamente.
        </p>

        <h2>9. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y administrativas razonables para proteger
          tus datos contra pérdida, acceso no autorizado o uso indebido. Ningún
          sistema es infalible, pero trabajamos para reducir ese riesgo.
        </p>

        <h2>10. Vigencia</h2>
        <p>
          Esta política rige desde el {ACTUALIZADA}. Tus datos se conservarán
          mientras exista una relación comercial contigo y, después, durante los
          plazos que exijan las obligaciones legales, contables y tributarias
          aplicables.
        </p>

        <h2>11. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política. Cualquier cambio se publicará en
          esta misma página, con su nueva fecha de actualización.
        </p>

        <p className={css.volver}>
          <Link href="/" className="link-terciario">
            ← Volver al inicio
          </Link>
        </p>
      </article>
    </section>
  );
}
