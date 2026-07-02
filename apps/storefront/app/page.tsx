import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProductCard from "@/components/ProductCard";
import { TAGLINE } from "@/lib/site";

export default async function Home() {
  const destacados = await fetchQuery(api.productos.catalogo, {});

  return (
    <>
      <section className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/fotos/hero-3.jpg"
          alt=""
          className="h-[64vh] min-h-[440px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-cacao/25" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-blanco">
          <p className="kicker text-blanco/90">
            Bolsos impresos en 3D · Hechos en Colombia
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marca/logo-claro.png"
            alt="La Marquessa"
            className="mt-5 h-16 w-auto md:h-20"
          />
          <p className="mt-4 font-cita text-xl italic text-blanco/90 md:text-2xl">
            {TAGLINE}
          </p>
          <Link
            href="/tienda"
            className="mt-7 inline-flex items-center rounded-sm bg-cobre px-8 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo"
          >
            Ver la colección
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8 md:py-24">
        <div className="text-center">
          <p className="kicker">La colección</p>
          <h2 className="mt-2 font-titulo text-4xl md:text-5xl">
            Nuestros <span className="font-script text-cobre">bolsos</span>
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {destacados.map((p) => (
            <ProductCard key={p.slug} producto={p} />
          ))}
        </div>
      </section>
    </>
  );
}
