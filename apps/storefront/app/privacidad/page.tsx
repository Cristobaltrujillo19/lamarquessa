import Link from "next/link";
import type { Metadata } from "next";
import { EMAIL, urlAbsoluta } from "@/lib/site";
import css from "./privacidad.module.css";

export const metadata: Metadata = {
  title: "Política de privacidad y tratamiento de datos | La Marquessa",
  description:
    "Cómo La Marquessa recoge, usa y protege tus datos personales, y cómo ejercer tus derechos conforme a la Ley 1581 de 2012 de Colombia.",
  alternates: { canonical: urlAbsoluta("/privacidad") },
};

export default function PrivacidadPage() {
  return (
    <main className="seccion">
      <article className={`contenedor ${css.texto}`}>
        <p className="kicker">Legal</p>
        <h1>Política de privacidad</h1>
        <p className={css.aviso}>
          ⚠️ Borrador de referencia. Debe revisarlo un abogado y completarse con
          los datos legales reales de la marca (razón social, NIT) antes de
          publicarse como definitivo.
        </p>

        <h2>Responsable</h2>
        <p>
          La Marquessa es responsable del tratamiento de los datos personales que
          nos compartes. Para cualquier solicitud relacionada con tus datos,
          escríbenos a <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </p>

        <h2>Qué datos recopilamos</h2>
        <p>
          Recopilamos los datos que nos entregas voluntariamente al contactarnos
          o realizar un pedido: nombre, número de contacto, correo y dirección de
          envío. También podemos recoger datos de navegación de forma anónima
          para mejorar el sitio.
        </p>

        <h2>Para qué los usamos</h2>
        <p>
          Usamos tus datos para responder tus mensajes, gestionar y enviar tus
          pedidos, y mantenerte al tanto de novedades si así lo autorizas. No
          vendemos ni compartimos tus datos con terceros ajenos a estos fines.
        </p>

        <h2>Tus derechos</h2>
        <p>
          Conforme a la Ley 1581 de 2012 (Habeas Data) de Colombia, puedes
          conocer, actualizar, rectificar y solicitar la eliminación de tus datos
          en cualquier momento, escribiéndonos al correo indicado.
        </p>

        <h2>Cambios</h2>
        <p>
          Podemos actualizar esta política. Publicaremos cualquier cambio en esta
          misma página.
        </p>

        <p className={css.volver}>
          <Link href="/">← Volver al inicio</Link>
        </p>
      </article>
    </main>
  );
}
