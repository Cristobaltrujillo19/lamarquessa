import type { Metadata } from "next";
import { Jost, Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import "./globals.css";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import Chrome from "./Chrome";
import Reveal from "@/components/marca/Reveal";
import FabWhatsApp from "@/components/marca/FabWhatsApp";
import Analitica from "@/components/Analitica";
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

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500"],
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  variable: "--font-pinyon",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bolsos únicos impresos en 3D y hechos a mano | La Marquessa",
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
      className={`${jost.variable} ${cormorant.variable} ${pinyon.variable} antialiased`}
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
        <CarritoProvider>
          <Chrome
            header={<Header />}
            footer={<Footer />}
            drawer={<CartDrawer />}
            fab={<FabWhatsApp mensaje={MENSAJES.general} />}
          >
            <main className="flex-1">{children}</main>
          </Chrome>
        </CarritoProvider>
        <Reveal />
        <Analitica id={process.env.NEXT_PUBLIC_GTM_ID} />
      </body>
    </html>
  );
}
