import Link from "next/link";
import type { Metadata } from "next";
import VaciarCarrito from "./VaciarCarrito";
import PurchaseTracker from "./PurchaseTracker";
import Aparece from "@/components/v2/Aparece";
import {
  ENVIO_DIAS,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  MENSAJES,
  PRODUCCION_SEMANAS,
  enlaceWhatsApp,
} from "@/lib/site";
import styles from "./gracias.module.css";

// Confirmación con la interfaz nueva. La MAQUETA viene de la /confirmacion
// del mockup —encabezado, hitos del proceso y aviso al pie—; la SUSTANCIA es
// la que ya estaba publicada aquí.
//
// Dos cosas del mockup NO viajan, y por lo mismo de siempre:
//
// · El titular del mockup nombra la pieza y su número de serie ("Menorca
//   Nº 042, color Amanecer"). Aquí no se puede: al volver de Mercado Pago el
//   carrito ya está vacío, y la numeración de piezas sigue sin decidirse.
//
// · "Sale del taller la semana del [Fecha pendiente]" es un marcador del
//   mockup. En su lugar van los plazos reales, que ya estaban escritos.
//
// LO QUE NO SE TOCA: <VaciarCarrito /> y <PurchaseTracker />. El segundo es
// donde vive el evento `purchase` —el final del embudo— y consume el
// snapshot que checkout guardó en sessionStorage antes de redirigir a la
// pasarela. Sin él no hay compra medida.

export const metadata: Metadata = {
  title: "¡Gracias por tu compra! | La Marquessa",
  // Una página de confirmación no aporta nada en Google y, si se indexa, compite
  // con las páginas que sí venden.
  robots: { index: false, follow: false },
};

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    payment_id?: string;
    preference_id?: string;
  }>;
}) {
  const { status, payment_id, preference_id } = await searchParams;
  // Mercado Pago devuelve "approved" o "pending" (PSE y efectivo tardan).
  const enProceso = status === "pending" || status === "in_process";

  // transaction_id para GA4: preferimos el payment_id (identifica el pago
  // real), y si aún no lo hay (pendiente), caemos al preference_id que
  // siempre viene y es único por intento de compra.
  const transactionId = payment_id ?? preference_id ?? null;

  return (
    <section className="seccion-base" aria-labelledby="titular-confirmacion">
      <div className="contenedor">
        <VaciarCarrito />
        <PurchaseTracker transactionId={transactionId} />

        <Aparece className={styles.encabezado}>
          <p className="eyebrow eyebrow-seccion">
            {enProceso ? "Pago en proceso" : "Encargo recibido"}
          </p>
          <h1 id="titular-confirmacion" className="h1 aire-arriba">
            {enProceso ? "Estamos esperando tu pago." : "Gracias por confiar."}
          </h1>
          <p className="cuerpo aire-arriba">
            {enProceso
              ? "En cuanto Mercado Pago nos confirme, empezamos."
              : "Empezamos mañana. Te escribimos cuando entre a pulido."}
          </p>
        </Aparece>

        {enProceso ? (
          <Aparece>
            <p className={styles.aviso}>
              Tu pago quedó en proceso, algo normal con PSE y con los pagos en
              efectivo. En cuanto Mercado Pago nos confirme, te llega el correo
              de confirmación y empezamos a fabricar tu bolso.
            </p>
          </Aparece>
        ) : (
          <>
            {/* Los tres hitos del proceso, tal como los define el mockup. */}
            <ol className={styles.hitos}>
              <Aparece as="li" paso={0} className={styles.hito}>
                <p className={`eyebrow ${styles.hitoNumero}`}>01</p>
                <h2 className={`h3 ${styles.hitoTitulo}`}>Molde</h2>
              </Aparece>
              <Aparece as="li" paso={1} className={styles.hito}>
                <p className={`eyebrow ${styles.hitoNumero}`}>02</p>
                <h2 className={`h3 ${styles.hitoTitulo}`}>Impresión</h2>
              </Aparece>
              <Aparece as="li" paso={2} className={styles.hito}>
                <p className={`eyebrow ${styles.hitoNumero}`}>03</p>
                <h2 className={`h3 ${styles.hitoTitulo}`}>Pulido a mano</h2>
              </Aparece>
            </ol>

            <Aparece>
              <p className={styles.salida}>
                Cada pieza se fabrica una por una: la tuya estará lista en{" "}
                {PRODUCCION_SEMANAS} semanas, y la transportadora tarda{" "}
                {ENVIO_DIAS} días hábiles más.
              </p>
            </Aparece>

            <Aparece>
              <p className={styles.aviso}>
                Te mandamos la confirmación al correo con el detalle del
                pedido. Si necesitas cambiar algún detalle, respóndenos ahí —
                hasta el momento en que empiece la impresión, se puede.
              </p>
            </Aparece>
          </>
        )}

        <Aparece>
          <div className={styles.acciones}>
            {/* Este enlace es donde vive `whatsapp_click` en esta ruta. */}
            <a
              href={enlaceWhatsApp(MENSAJES.pedido)}
              target="_blank"
              rel="noopener"
              className="btn btn-primario"
            >
              Escribirnos por WhatsApp
            </a>
            <Link href="/tienda" className="btn btn-secundario">
              Seguir viendo
            </Link>
          </div>

          <p className={styles.instagram}>
            Cuando te llegue, nos encantaría verlo:{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener"
              className="link-terciario"
            >
              {INSTAGRAM_HANDLE}
            </a>
          </p>
        </Aparece>
      </div>
    </section>
  );
}
