"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartButton from "./CartButton";
import { MARCA } from "@/lib/site";
import styles from "./Header.module.css";

// Cabecera con el lenguaje visual de la interfaz nueva (portada del Nav del
// mockup) y las rutas y el carrito de producción.
//
// DOS DECISIONES QUE SE APARTAN DEL MOCKUP:
//
// 1. El carrito. El mockup resuelve con un enlace suelto a /carrito; aquí se
//    conserva el botón que abre el cajón, porque es donde se dispara view_cart
//    (y ViewCart en Meta). Un enlace plano habría perdido ese evento en su
//    punto más frecuente.
//
// 2. Las entradas son las cuatro del mockup. Envíos y Contacto se enlazan
//    desde que existen como ruta. Preguntas frecuentes no está en el nav del
//    mockup, así que vive en el pie: sigue a un clic de distancia sin cargar
//    la barra con una quinta entrada.
//
// El menú móvil está en la lista de "no tocar" del handoff, así que conserva
// sus cuatro conductas: Escape cierra y devuelve el foco al botón, se cierra
// al navegar, se cierra al pulsar fuera, y bloquea el scroll del fondo.
const ENTRADAS = [
  { href: "/tienda", texto: "Colección" },
  { href: "/nosotros", texto: "Nuestra historia" },
  { href: "/envios", texto: "Envíos" },
  { href: "/contacto", texto: "Contacto" },
];

export default function Header() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);

  // Al navegar se cierra solo. Sin esto, al tocar un enlace el panel se
  // quedaría abierto encima de la página nueva.
  useEffect(() => {
    setAbierto(false);
  }, [ruta]);

  useEffect(() => {
    if (!abierto) return;

    const alTecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setAbierto(false);
      boton.current?.focus();
    };
    const alPulsarFuera = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !boton.current?.contains(t)) {
        setAbierto(false);
      }
    };

    document.addEventListener("keydown", alTecla);
    document.addEventListener("mousedown", alPulsarFuera);

    // El fondo no debe desplazarse detrás del panel abierto.
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // El foco entra en el panel para que el teclado no siga en la página.
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    return () => {
      document.removeEventListener("keydown", alTecla);
      document.removeEventListener("mousedown", alPulsarFuera);
      document.body.style.overflow = previo;
    };
  }, [abierto]);

  const esActivo = (href: string) =>
    ruta === href || ruta.startsWith(`${href}/`);

  return (
    <div>
      <nav className={styles.nav} aria-label="Navegación principal">
        <div className={`contenedor ${styles.fila}`}>
          <Link
            href="/"
            className={styles.logo}
            aria-label={`${MARCA}, ir al inicio`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marca/logo-cobre.png"
              alt={MARCA}
              width={280}
              height={84}
            />
          </Link>

          {/* Menú de escritorio */}
          <ul className={styles.enlaces}>
            {ENTRADAS.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className={`${styles.enlace} ${esActivo(e.href) ? styles.activo : ""}`}
                  aria-current={esActivo(e.href) ? "page" : undefined}
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.acciones}>
            <CartButton />

            {/* Botón hamburguesa — solo existe visualmente en móvil.
                Las tres barras son decorativas: el nombre accesible lo da
                aria-label, y aria-expanded comunica el estado. */}
            <button
              ref={boton}
              type="button"
              className={styles.hamburguesa}
              aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={abierto}
              aria-controls="menu-movil"
              onClick={() => setAbierto((v) => !v)}
            >
              <span
                className={`${styles.barra} ${abierto ? styles.barraSup : ""}`}
                aria-hidden="true"
              />
              <span
                className={`${styles.barra} ${abierto ? styles.barraMed : ""}`}
                aria-hidden="true"
              />
              <span
                className={`${styles.barra} ${abierto ? styles.barraInf : ""}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Panel móvil. Se mantiene en el DOM y se oculta con hidden para que
            el estado del botón y el panel no se desincronicen al animar. */}
        <div id="menu-movil" ref={panel} className={styles.panel} hidden={!abierto}>
          <ul className={styles.panelLista}>
            {ENTRADAS.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className={`${styles.panelEnlace} ${esActivo(e.href) ? styles.panelActivo : ""}`}
                  aria-current={esActivo(e.href) ? "page" : undefined}
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
