"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// Analítica: carga Google Tag Manager (para Meta Pixel, LinkedIn, etc.) y
// Google Analytics 4 vía gtag.js (envío directo a GA4). Ambos por variable
// de entorno; cada uno se activa solo si su ID está presente.
//
// Por qué las dos rutas y no una:
//  - gtag.js ↔ GA4 directo, sin intermediario. Recibe eventos y page_views
//    con la mínima latencia.
//  - GTM queda libre para conectar otros destinos (Meta Pixel, TikTok, etc.)
//    sin volver a tocar código: se leen los mismos pushes al dataLayer.
//  - IMPORTANTE: NO añadir un "GA4 Configuration Tag" dentro de GTM: los
//    eventos llegarían dos veces a GA4 (una por gtag.js, otra por GTM).
//
// No se carga en /panel: es la trastienda y ensuciaría las métricas.

type Props = {
  /** Contenedor de Google Tag Manager (opcional). */
  gtmId?: string;
  /** Measurement ID de GA4, gtag.js (opcional). */
  ga4Id?: string;
};

export default function Analitica({ gtmId, ga4Id }: Props) {
  const pathname = usePathname();

  if (pathname?.startsWith("/panel")) return null;
  if (!gtmId && !ga4Id) return null;

  return (
    <>
      {gtmId && <GtmScripts id={gtmId} />}
      {ga4Id && (
        <>
          <Ga4Scripts id={ga4Id} />
          {/* useSearchParams necesita un Suspense boundary en Next 15+. */}
          <Suspense fallback={null}>
            <Ga4PageViews id={ga4Id} />
          </Suspense>
        </>
      )}
    </>
  );
}

function GtmScripts({ id }: { id: string }) {
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

function Ga4Scripts({ id }: { id: string }) {
  return (
    <>
      <Script
        id="ga4-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          // send_page_view: false — lo disparamos manualmente en cada cambio
          // de ruta con <Ga4PageViews>. Sin esto gtag.js solo cuenta la carga
          // inicial y se pierden todas las navegaciones SPA de Next.
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${id}', { send_page_view: false });`,
        }}
      />
    </>
  );
}

function Ga4PageViews({ id }: { id: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (!w.gtag) return;
    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    w.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: id,
    });
  }, [pathname, searchParams, id]);

  return null;
}

/** Envía un evento a GA4 (vía gtag.js) y al dataLayer de GTM. Si un helper
 *  se llama antes de que gtag.js termine de cargar, el shim inline empuja
 *  al dataLayer en formato Arguments; cuando gtag.js llega, procesa la cola
 *  pendiente. Ninguno de los dos destinos rompe si el ID correspondiente
 *  no está configurado. */
export function enviarEvento(
  nombre: string,
  datos: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  // Formato GTM: {event, ...params} — GTM enruta según el nombre del evento.
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: nombre, ...datos });
  // Formato gtag.js. Si gtag aún no cargó, se crea un shim que empuja al
  // dataLayer en formato Arguments; gtag.js consume la cola al iniciar.
  if (typeof w.gtag !== "function") {
    w.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    };
  }
  w.gtag("event", nombre, datos);
}
