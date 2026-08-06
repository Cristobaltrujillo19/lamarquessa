import Link from "next/link";
import {
  MARCA,
  TAGLINE,
  DESCRIPCION_MARCA,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  EMAIL,
  MENSAJES,
  enlaceWhatsApp,
} from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-20 bg-cacao text-crema/90">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marca/logo-claro.png"
            alt={MARCA}
            className="h-8 w-auto"
            width={1000}
            height={285}
          />
          <p className="mt-4 font-cita text-lg italic text-crema/70">{TAGLINE}</p>
          {/* Descripción canónica de la marca: la misma que en el schema y el
              meta description, para que la entidad se reconozca igual en todas partes. */}
          <p className="mt-4 max-w-[38ch] text-sm text-crema/60">{DESCRIPCION_MARCA}</p>
        </div>

        <div>
          <p className="kicker">Comprar</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/tienda" className="hover:text-cobre">
                Colección
              </Link>
            </li>
            <li>
              <Link href="/nosotros" className="hover:text-cobre">
                Nuestra historia
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="kicker">Atención</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/preguntas-frecuentes" className="hover:text-cobre">
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <a
                href={enlaceWhatsApp(MENSAJES.general)}
                target="_blank"
                rel="noopener"
                className="hover:text-cobre"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-cobre">
                Privacidad
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="kicker">Síguenos</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener"
                className="hover:text-cobre"
              >
                Instagram {INSTAGRAM_HANDLE}
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="hover:text-cobre">
                {EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-crema/15">
        <p className="mx-auto max-w-[1280px] px-5 py-5 text-xs text-crema/50 md:px-8">
          © {new Date().getFullYear()} {MARCA} · Hecho a mano en Colombia 🐚
        </p>
      </div>
    </footer>
  );
}
