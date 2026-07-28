import Link from "next/link";
import type { Metadata } from "next";
import VaciarCarrito from "./VaciarCarrito";
import {
  ENVIO_DIAS,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  MENSAJES,
  PRODUCCION_SEMANAS,
  enlaceWhatsApp,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "¡Gracias por tu compra! | La Marquessa",
  // Una página de confirmación no aporta nada en Google y, si se indexa, compite
  // con las páginas que sí venden.
  robots: { index: false, follow: false },
};

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment_id?: string }>;
}) {
  const { status } = await searchParams;
  // Mercado Pago devuelve "approved" o "pending" (PSE y efectivo tardan).
  const enProceso = status === "pending" || status === "in_process";

  return (
    <div className="mx-auto max-w-[640px] px-5 py-20 text-center md:py-28">
      <VaciarCarrito />

      <p className="kicker">{enProceso ? "Pago en proceso" : "Pedido confirmado"}</p>
      <h1 className="mt-3 font-titulo text-4xl md:text-5xl">
        {enProceso ? (
          <>
            Estamos esperando <span className="script">tu pago</span>
          </>
        ) : (
          <>
            Gracias por <span className="script">confiar</span>
          </>
        )}
      </h1>

      {enProceso ? (
        <p className="mt-6 leading-relaxed text-cacao-suave">
          Tu pago quedó en proceso, algo normal con PSE y con los pagos en
          efectivo. En cuanto Mercado Pago nos confirme, te llega el correo de
          confirmación y empezamos a fabricar tu bolso.
        </p>
      ) : (
        <>
          <p className="mt-6 leading-relaxed text-cacao-suave">
            Tu bolso ya entró a producción. Te mandamos la confirmación por
            correo con el detalle de tu pedido.
          </p>
          <p className="mt-4 leading-relaxed text-cacao-suave">
            Recuerda que cada pieza se fabrica una por una: estará lista en{" "}
            <strong className="text-cacao">{PRODUCCION_SEMANAS} semanas</strong> y
            la transportadora tarda {ENVIO_DIAS} días hábiles más. Te escribimos
            para coordinar la entrega.
          </p>
        </>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a
          href={enlaceWhatsApp(MENSAJES.pedido)}
          target="_blank"
          rel="noopener"
          className="boton boton-primario"
        >
          Escribirnos por WhatsApp
        </a>
        <Link href="/tienda" className="boton boton-fantasma">
          Seguir viendo
        </Link>
      </div>

      <p className="mt-10 text-sm text-cacao-suave">
        Cuando te llegue, nos encantaría verlo:{" "}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener"
          className="text-cobre-texto underline-offset-4 hover:underline"
        >
          {INSTAGRAM_HANDLE}
        </a>
      </p>
    </div>
  );
}
