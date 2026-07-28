import Link from "next/link";
import CartButton from "./CartButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-cacao/10 bg-crema/85 backdrop-blur-md">
      <p className="bg-cobre-texto px-4 py-2 text-center text-[11px] uppercase tracking-[0.2em] text-blanco">
        Piezas únicas hechas a mano · Envíos a todo Colombia
      </p>

      <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-5 py-4 md:px-8">
        <nav className="hidden items-center gap-7 text-[12.5px] uppercase tracking-[0.18em] md:flex">
          <Link href="/tienda" className="transition-colors hover:text-cobre-texto">
            Colección
          </Link>
          <Link href="/nosotros" className="transition-colors hover:text-cobre-texto">
            Cómo se hacen
          </Link>
        </nav>

        <Link href="/" aria-label="La Marquessa — inicio" className="justify-self-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marca/logo-cobre.png"
            alt="La Marquessa"
            className="h-7 w-auto md:h-8"
            width={1000}
            height={285}
          />
        </Link>

        <div className="flex items-center justify-end gap-5">
          <CartButton />
        </div>
      </div>
    </header>
  );
}
