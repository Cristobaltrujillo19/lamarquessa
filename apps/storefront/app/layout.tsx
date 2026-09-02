import type { Metadata } from "next";
import {
  Jost,
  Cormorant_Garamond,
  Pinyon_Script,
  Fraunces,
  Archivo,
} from "next/font/google";
import "./globals.css";
import "./globals-v2.css";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import Chrome from "./Chrome";
import Reveal from "@/components/marca/Reveal";
import FabWhatsApp from "@/components/marca/FabWhatsApp";
import Analitica from "@/components/Analitica";
import FondoTopografico from "@/components/v2/FondoTopografico";
import { CarritoProvider } from "@/lib/carrito";
import {
  MARCA,
  MARCA_VARIANTE,
  DESCRIPCION_MARCA,
  EMAIL,
  INSTAGRAM_URL,
  MENSAJES,
  SITE_URL,
  urlAbsoluta,
} from "@/lib/site";

// ⚠️ `preload: false` en las tres, y no es un detalle.
//
// Medido el 2 de septiembre de 2026 (§15 del ESTADO): next/font precarga por
// defecto TODA familia declarada en el layout, la pinte la página o no. Eso
// ponía OCHO ficheros y 264 KB en prioridad alta en cada visita. Comprobado en
// producción con `document.fonts`: la home y la ficha solo pintan Archivo,
// Fraunces y Queens. Estas tres no se pintaban en ninguna de las dos.
//
// El problema no era el peso sino la COLA: bajo la red simulada de Lighthouse
// el póster del hero —el recurso del LCP— pedía turno detrás de estos 264 KB,
// y esa espera era el 42% del LCP.
//
// `preload: false` NO las quita: siguen declaradas y disponibles. Solo deja de
// forzarlas por adelantado, así que se descargan cuando algo las pinta de
// verdad. Quién las pinta:
//   - Jost y Cormorant: el panel de administración (`globals.css`), que va
//     tras un login y donde medio segundo de más no le cuesta una venta a nadie.
//   - Cormorant, además: la vista previa de las iniciales grabadas, que solo
//     aparece si el cliente abre la personalización.
//   - Pinyon: respaldo de "Beauty Angelique" para la letra manuscrita.
//
// El comentario que había más abajo decía que convivían "sin coste". La
// medición dice que costaban 264 KB por delante del LCP.
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500"],
  preload: false,
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  preload: false,
});
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  variable: "--font-pinyon",
  weight: "400",
  preload: false,
});

// Tipografías de la nueva interfaz (globals-v2.css). El mockup se diseñó y
// midió con estas dos; usar las de la interfaz vieja cambiaría el ritmo de
// lectura que ya se validó. Estas dos SÍ van precargadas: son las que pinta
// la primera pantalla de todas las páginas públicas.
//
// Fraunces cubre además los glifos que a Queen Serif FREE le faltan (acentos,
// eñe, comillas tipográficas) por fallback por-glifo.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "La Marquessa",
    template: "%s",
  },
  description: DESCRIPCION_MARCA,
  openGraph: {
    type: "website",
    siteName: MARCA,
    locale: "es_CO",
    url: SITE_URL,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: MARCA }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

// Entidad de marca para buscadores y modelos de IA. La grafía oficial es
// "La Marquessa"; "La Marquesa" queda como alternateName para que quien la
// escriba con una sola s también llegue.
const schemaOrganizacion = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: MARCA,
  alternateName: MARCA_VARIANTE,
  url: SITE_URL,
  logo: urlAbsoluta("/marca/logo-cobre.png"),
  image: urlAbsoluta("/og.jpg"),
  email: EMAIL,
  description: DESCRIPCION_MARCA,
  address: { "@type": "PostalAddress", addressCountry: "CO" },
  sameAs: [INSTAGRAM_URL],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: EMAIL,
    areaServed: "CO",
    availableLanguage: ["es"],
  },
};

const schemaSitio = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: MARCA,
  url: SITE_URL,
  inLanguage: "es-CO",
  publisher: { "@type": "Organization", name: MARCA },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-CO"
      className={`${jost.variable} ${cormorant.variable} ${pinyon.variable} ${fraunces.variable} ${archivo.variable} antialiased`}
    >
      <head>
        {/* Queen Serif es la tipografía del titular del hero y del logotipo:
            precargarla evita el parpadeo al fallback en el LCP. Vive en
            /public/fonts, así que la sirve el propio dominio (sin CDN). */}
        <link
          rel="preload"
          href="/fonts/queen-serif.otf"
          as="font"
          type="font/otf"
          crossOrigin=""
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganizacion) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSitio) }}
        />
      </head>
      {/* Algunas extensiones del navegador (ColorZilla, gestores de contraseñas)
          añaden atributos al <body> antes de que React hidrate, lo que dispara
          un aviso de hidratación que no viene de nuestro código. */}
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        {/* Textura de curvas de nivel en movimiento. Decorativa pura: fija,
            sin eventos y fuera del arbol de accesibilidad. Va antes del
            contenido y en z-index negativo, asi que no intercepta ningun
            clic del embudo. */}
        <FondoTopografico />
        <CarritoProvider>
          <Chrome
            header={<Header />}
            footer={<Footer />}
            drawer={<CartDrawer />}
            fab={<FabWhatsApp mensaje={MENSAJES.general} />}
          >
            <main id="contenido" className="flex-1">
              {children}
            </main>
          </Chrome>
        </CarritoProvider>
        <Reveal />
        <Analitica
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
          ga4Id={process.env.NEXT_PUBLIC_GA4_ID}
          metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
        />
      </body>
    </html>
  );
}
