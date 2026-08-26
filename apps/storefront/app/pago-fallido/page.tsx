import Link from "next/link";
import type { Metadata } from "next";
import Aparece from "@/components/v2/Aparece";
import { MENSAJES, enlaceWhatsApp } from "@/lib/site";
import styles from "../gracias/gracias.module.css";

// Misma maqueta que /gracias —encabezado editorial y acciones al pie—, con el
// contenido que ya estaba publicado. Reutiliza su hoja de estilos en vez de
// duplicarla: son la misma pieza con distinto desenlace.
//
// El enlace de WhatsApp se conserva: es donde vive `whatsapp_click` en esta
// ruta, y es además la vía de rescate de una venta que acaba de fallar.

export const metadata: Metadata = {
  title: "No se pudo completar el pago | La Marquessa",
  robots: { index: false, follow: false },
};

export default function PagoFallidoPage() {
  return (
    <section className="seccion-base" aria-labelledby="titular-pago-fallido">
      <div className="contenedor">
        <Aparece className={styles.encabezado}>
          <p className="eyebrow eyebrow-seccion">Pago no completado</p>
          <h1 id="titular-pago-fallido" className="h1 aire-arriba">
            No pudimos cobrarlo.
          </h1>
          <p className="cuerpo aire-arriba">
            No se te cobró nada. Tu carrito sigue tal como lo dejaste.
          </p>
        </Aparece>

        <Aparece>
          <p className={styles.aviso}>
            Suele ser un rechazo del banco, un dato mal escrito o un pago que
            se dejó a medias. Puedes intentar de nuevo, con otro medio de pago
            si prefieres.
          </p>
        </Aparece>

        <Aparece>
          <div className={styles.acciones}>
            <Link href="/checkout" className="btn btn-primario">
              Intentar de nuevo
            </Link>
            <a
              href={enlaceWhatsApp(MENSAJES.pedido)}
              target="_blank"
              rel="noopener"
              className="btn btn-secundario"
            >
              Que nos escriban
            </a>
          </div>

          <p className={styles.instagram}>
            Si prefieres, cerramos el pedido por WhatsApp y coordinamos el pago
            contigo.
          </p>
        </Aparece>
      </div>
    </section>
  );
}
