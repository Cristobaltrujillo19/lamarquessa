"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";

// Analítica: carga Google Tag Manager (marketing multi-destino), Google
// Analytics 4 vía gtag.js (envío directo a GA4) y Meta Pixel (Facebook /
// Instagram Ads). Cada uno se activa solo si su ID está en la env.
//
// Por qué separadas y no todo por GTM:
//  - gtag.js ↔ GA4 directo, sin intermediario. Recibe eventos con la mínima
//    latencia y sin depender de la configuración de GTM.
//  - Meta Pixel también directo: mismos motivos + Meta prefiere el pixel
//    nativo para atribución y optimización de anuncios.
//  - GTM queda libre para futuros destinos (TikTok, LinkedIn, etc.) sin
//    tocar código.
//  - IMPORTANTE: NO añadir GA4 ni Meta Pixel tags DENTRO de GTM: los
//    eventos llegarían dos veces (una por el pixel directo, otra por GTM).
//
// No se carga en /panel: es la trastienda y ensuciaría las métricas.

type Props = {
  /** Contenedor de Google Tag Manager (opcional). */
  gtmId?: string;
  /** Measurement ID de GA4, gtag.js (opcional). */
  ga4Id?: string;
  /** Pixel ID de Meta (Facebook + Instagram Ads). Opcional. */
  metaPixelId?: string;
};

export default function Analitica({ gtmId, ga4Id, metaPixelId }: Props) {
  const pathname = usePathname();

  if (pathname?.startsWith("/panel")) return null;
  if (!gtmId && !ga4Id && !metaPixelId) return null;

  return (
    <>
      {gtmId && <GtmScripts id={gtmId} />}
      {ga4Id && (
        <>
          <Ga4Scripts id={ga4Id} />
          {/* El Suspense se conserva aunque ya no se use useSearchParams:
              aísla estos componentes del árbol si alguna vez vuelven a
              suspender, y no cuesta nada. */}
          <Suspense fallback={null}>
            <Ga4PageViews id={ga4Id} />
          </Suspense>
        </>
      )}
      {metaPixelId && (
        <>
          <MetaPixelScripts id={metaPixelId} />
          <Suspense fallback={null}>
            <MetaPixelPageViews />
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

function MetaPixelScripts({ id }: { id: string }) {
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          // Snippet oficial de Meta. Termina con fbq('track','PageView') para
          // registrar la primera carga; las navegaciones SPA las dispara
          // MetaPixelPageViews manualmente (saltándose la primera para no
          // duplicar esta PageView).
          __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');`,
        }}
      />
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1" />`,
        }}
      />
    </>
  );
}

function MetaPixelPageViews() {
  const pathname = usePathname();
  // El init del snippet ya disparó la primera PageView; saltamos la primera
  // ejecución del efecto para no contarla dos veces. Toda navegación
  // SPA posterior sí manda un PageView explícito.
  const primero = useRef(true);

  // Igual que en GA4: solo el pathname. Los searchParams como dependencia
  // hacían que cada color tanteado en la ficha —que se escribe en ?color=
  // con replaceState— mandara una PageView de más. En Meta eso es peor que
  // un número inflado: distorsiona las audiencias construidas sobre
  // frecuencia de visita.
  useEffect(() => {
    if (primero.current) {
      primero.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    if (typeof w.fbq !== "function") return;
    w.fbq("track", "PageView");
  }, [pathname]);

  return null;
}

function Ga4PageViews({ id }: { id: string }) {
  const pathname = usePathname();

  // Solo el PATHNAME entra en las dependencias, nunca los searchParams.
  //
  // El configurador de la ficha escribe el color elegido en ?color= con
  // history.replaceState, y eso hace que useSearchParams se actualice. Con
  // los searchParams como dependencia, cada color que el visitante tanteaba
  // mandaba un page_view: medido, dos toques de color daban dos páginas
  // vistas falsas. Eso infla el conteo e inutiliza la tasa de rebote y el
  // tiempo por página.
  //
  // En este sitio ninguna query string significa "otra página": son estado
  // de interfaz (?color=) o retorno de la pasarela (?payment_id=), y ese
  // último llega junto con un cambio de ruta, así que se registra igual.
  //
  // La URL completa sí viaja en page_location, que se lee en el momento del
  // disparo, así que no se pierde información: solo se deja de contar dos
  // veces lo mismo.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (!w.gtag) return;
    w.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
      send_to: id,
    });
  }, [pathname, id]);

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

/** Envía un evento al Meta Pixel. Distingue eventos estándar (los que Meta
 *  optimiza y muestra en Ads Manager) de eventos personalizados. Si el
 *  pixel aún no cargó, fbq() ya está definido por el snippet inline y
 *  encola en n.queue hasta que el script termina de cargar. */
export function enviarEventoMeta(
  nombre: string,
  datos: Record<string, unknown> = {},
  tipo: "track" | "trackCustom" = "track",
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (typeof w.fbq !== "function") return;
  w.fbq(tipo, nombre, datos);
}
