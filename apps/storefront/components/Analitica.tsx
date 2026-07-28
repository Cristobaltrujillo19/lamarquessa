"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Google Tag Manager. El contenedor se configura por variable de entorno
// (NEXT_PUBLIC_GTM_ID): desde GTM se activan GA4, el pixel de Meta y lo que
// haga falta sin volver a tocar el código.
//
// No se carga en /panel: es la trastienda y ensuciaría las métricas del sitio.
export default function Analitica({ id }: { id?: string }) {
  const pathname = usePathname();

  if (!id) return null;
  if (pathname?.startsWith("/panel")) return null;

  return (
    <>
      <Script
        id="gtm"
        // afterInteractive: la analítica no debe competir con el contenido por
        // el hilo principal; cargarla antes empeoraría LCP e INP.
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${id}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}

/** Envía un evento al dataLayer para que GTM lo reenvíe a GA4 / Meta.
 *  Si GTM no está configurado, no hace nada (no rompe nada). */
export function enviarEvento(
  nombre: string,
  datos: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: nombre, ...datos });
}
