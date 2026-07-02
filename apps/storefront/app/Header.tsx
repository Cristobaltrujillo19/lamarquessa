import Link from "next/link";
import CartButton from "./CartButton";
import { SITE_URL } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-cacao/10 bg-crema/85 backdrop-blur-md">
      <p className="bg-cobre px-4 py-2 text-center text-[11px] uppercase tracking-[0.2em] text-blanco">
        Envío a todo Colombia · Piezas exclusivas impresas en 3D
      </p>

      <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-5 py-4 md:px-8">
        <nav className="hidden items-center gap-7 text-[12.5px] uppercase tracking-[0.18em] md:flex">
          <Link href="/tienda" className="transition-colors hover:text-cobre">
            Colección
          </Link>
          <a href={`${SITE_URL}/nosotros`} className="transition-colors hover:text-cobre">
            Historia
          </a>
          <a href={SITE_URL} className="transition-colors hover:text-cobre">
            La Marquessa
          </a>
        </nav>

        <a href={SITE_URL} aria-label="La Marquessa — inicio" className="justify-self-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/logo-cobre.png" alt="La Marquessa" className="h-7 w-auto md:h-8" />
        </a>

        <div className="flex items-center justify-end gap-5">
          <CartButton />
        </div>
      </div>
    </header>
  );
}
