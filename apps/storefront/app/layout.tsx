import type { Metadata } from "next";
import { Jost, Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import "./globals.css";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import Chrome from "./Chrome";
import { CarritoProvider } from "@/lib/carrito";

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
  title: "La Marquessa — Bolsos impresos en 3D",
  description:
    "Bolsos de autor impresos en 3D y terminados a mano, con materiales colombianos. Piezas exclusivas inspiradas en el mar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-CO"
      className={`${jost.variable} ${cormorant.variable} ${pinyon.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <CarritoProvider>
          <Chrome header={<Header />} footer={<Footer />} drawer={<CartDrawer />}>
            <main className="flex-1">{children}</main>
          </Chrome>
        </CarritoProvider>
      </body>
    </html>
  );
}
