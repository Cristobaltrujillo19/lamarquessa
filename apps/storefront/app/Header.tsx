"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CartButton from "./CartButton";

const enlaces = [
  { href: "/tienda", texto: "Colección" },
  { href: "/nosotros", texto: "Nuestra historia" },
  { href: "/preguntas-frecuentes", texto: "Preguntas frecuentes" },
];

export default function Header() {
  const [abierto, setAbierto] = useState(false);
  const path = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [altoCab, setAltoCab] = useState(98);

  // Cerrar el menú al navegar. Sin esto, al ir de /tienda a /nosotros el
  // panel queda abierto y el fondo bloqueado.
  useEffect(() => {
    setAbierto(false);
  }, [path]);

  // Medir el alto del header para que el fondo oscuro empiece justo debajo,
  // sin cubrirlo. Se re-mide al cambiar el ancho de ventana por si la barra
  // superior se parte en dos líneas.
  useEffect(() => {
    const medir = () => {
      if (headerRef.current) setAltoCab(headerRef.current.offsetHeight);
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  // Bloquear el scroll del fondo mientras el panel esté abierto. Sin esto,
  // se puede deslizar la página por debajo del overlay.
  useEffect(() => {
    if (!abierto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [abierto]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-cacao/10 bg-crema/85 backdrop-blur-md"
    >
      <p className="bg-cobre-texto px-4 py-2 text-center text-[11px] uppercase tracking-[0.2em] text-blanco">
        Piezas únicas hechas a mano · Envíos a todo el mundo
      </p>

      <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-5 py-4 md:px-8">
        {/* Nav en escritorio + botón hamburguesa en móvil, en la misma celda
            para que el logo siga centrado en ambos casos. */}
        <div className="flex items-center gap-7">
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-cacao transition-colors hover:text-cobre-texto md:hidden"
          >
            {/* Icono hamburguesa / equis, dibujado con SVG en el mismo hueco:
                sin librería y con transición al abrir. */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line
                x1="3"
                y1="6"
                x2="19"
                y2="6"
                className={`origin-center transition-transform duration-200 ${
                  abierto ? "translate-y-[5px] rotate-45" : ""
                }`}
              />
              <line
                x1="3"
                y1="11"
                x2="19"
                y2="11"
                className={`transition-opacity duration-150 ${
                  abierto ? "opacity-0" : ""
                }`}
              />
              <line
                x1="3"
                y1="16"
                x2="19"
                y2="16"
                className={`origin-center transition-transform duration-200 ${
                  abierto ? "-translate-y-[5px] -rotate-45" : ""
                }`}
              />
            </svg>
          </button>

          <nav className="hidden items-center gap-7 text-[12.5px] uppercase tracking-[0.18em] md:flex">
            {enlaces.slice(0, 2).map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="transition-colors hover:text-cobre-texto"
              >
                {e.texto}
              </Link>
            ))}
          </nav>
        </div>

        {/* En el inicio este logo empieza invisible y aparece cuando el del
            hero termina de encogerse (ver .logo-cabecera en globals.css). */}
        <Link
          href="/"
          aria-label="La Marquessa — inicio"
          className="logo-cabecera justify-self-center"
        >
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

      {/* Panel móvil: se despliega desde arriba, debajo de la cabecera. Va
          justo aquí para que el fondo oscuro y el panel hereden el sticky del
          header y siempre queden por encima del contenido. Escritorio ni lo
          renderiza (md:hidden). */}
      <div className="md:hidden">
        {/* Fondo oscuro para separar visualmente y cerrar al tocar fuera.
            Empieza justo debajo del header (por eso `top: altoCab`) para no
            cubrirlo — así el botón de cerrar y el logo siguen alcanzables. */}
        <div
          aria-hidden="true"
          onClick={() => setAbierto(false)}
          style={{ top: altoCab }}
          className={`fixed inset-x-0 bottom-0 bg-cacao/40 transition-opacity duration-200 ${
            abierto ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <nav
          id="menu-movil"
          aria-label="Menú principal"
          aria-hidden={!abierto}
          className={`absolute inset-x-0 top-full origin-top bg-crema shadow-[0_10px_30px_rgba(74,58,44,0.15)] transition-[transform,opacity] duration-200 ${
            abierto
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          <ul className="mx-auto flex max-w-[1280px] flex-col px-5 py-2">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className="block border-b border-cacao/10 py-4 text-sm uppercase tracking-[0.18em] text-cacao transition-colors last:border-0 hover:text-cobre-texto"
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
