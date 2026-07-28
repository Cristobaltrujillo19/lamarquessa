import Link from "next/link";
import type { Metadata } from "next";
import { MENSAJES, enlaceWhatsApp } from "@/lib/site";

export const metadata: Metadata = {
  title: "No se pudo completar el pago | La Marquessa",
  robots: { index: false, follow: false },
};

export default function PagoFallidoPage() {
  return (
    <div className="mx-auto max-w-[640px] px-5 py-20 text-center md:py-28">
      <p className="kicker">Pago no completado</p>
      <h1 className="mt-3 font-titulo text-4xl md:text-5xl">
        No pudimos <span className="script">cobrarlo</span>
      </h1>

      <p className="mt-6 leading-relaxed text-cacao-suave">
        El pago no se completó, así que{" "}
        <strong className="text-cacao">no se te cobró nada</strong>. Suele ser
        un rechazo del banco, un dato mal escrito o un pago que se dejó a medias.
      </p>
      <p className="mt-4 leading-relaxed text-cacao-suave">
        Tu carrito sigue tal como lo dejaste: puedes intentar de nuevo, con otro
        medio de pago si prefieres.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/checkout" className="boton boton-primario">
          Intentar de nuevo
        </Link>
        <a
          href={enlaceWhatsApp(MENSAJES.pedido)}
          target="_blank"
          rel="noopener"
          className="boton boton-fantasma"
        >
          Que nos escriban
        </a>
      </div>

      <p className="mt-10 text-sm text-cacao-suave">
        Si prefieres, cerramos el pedido por WhatsApp y coordinamos el pago
        contigo.
      </p>
    </div>
  );
}
