"use client";

import { useEffect } from "react";

// El logo grande del hero se encoge al bajar hasta fundirse con el pequeño de
// la cabecera, que hasta entonces está oculto. Así no se ven dos logos a la vez.
//
// Solo se monta en el inicio (dentro del Hero). En el resto de páginas la
// variable --logo-p no existe, y la cabecera muestra su logo de siempre.
export default function TransicionLogo() {
  useEffect(() => {
    const raiz = document.documentElement;
    const logo = document.querySelector<HTMLElement>("[data-hero-logo]");
    const cabecera = document.querySelector("header");
    if (!logo || !cabecera) return;

    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Recorrido: cuánto hay que bajar para que el logo del hero termine de
    // esconderse detrás de la cabecera. Se mide, no se fija a ojo: si cambia el
    // alto del anuncio de arriba o el del logo, esto sigue cuadrando.
    //
    // Se usa ese punto y no el de "cuando se cruzan" porque el cruce ocurre a
    // los ~70px y la animación se sentiría un parpadeo. Aquí la transición
    // acaba justo cuando el logo desaparece, que es lo que se ve.
    let recorrido = 1;
    const medir = () => {
      const caja = logo.getBoundingClientRect();
      const inicio = caja.top + window.scrollY;
      const altoCabecera = cabecera.getBoundingClientRect().height;
      recorrido = Math.max(inicio + caja.height - altoCabecera, 1);
    };

    let encolado = false;
    const pintar = () => {
      encolado = false;
      const p = Math.min(Math.max(window.scrollY / recorrido, 0), 1);
      raiz.style.setProperty("--logo-p", String(p));
      // Mientras el logo de la cabecera es invisible no debe poder recibir clics.
      raiz.classList.toggle("logo-cabecera-oculto", p < 0.6);

      if (suave) {
        logo.style.opacity = String(1 - p);
        // Se encoge hasta ~0.4 (el tamaño del logo de la cabecera) y sube, para
        // que parezca que aterriza ahí y no que simplemente se desvanece.
        logo.style.transform = `translateY(${(-26 * p).toFixed(1)}px) scale(${(1 - 0.6 * p).toFixed(3)})`;
      } else {
        logo.style.opacity = p < 1 ? "1" : "0";
      }
    };

    const alHacerScroll = () => {
      if (encolado) return;
      encolado = true;
      requestAnimationFrame(pintar);
    };

    const alRedimensionar = () => {
      medir();
      alHacerScroll();
    };

    medir();
    pintar();
    window.addEventListener("scroll", alHacerScroll, { passive: true });
    window.addEventListener("resize", alRedimensionar);

    return () => {
      window.removeEventListener("scroll", alHacerScroll);
      window.removeEventListener("resize", alRedimensionar);
      // Al salir del inicio hay que devolverlo todo: si no, la cabecera se
      // quedaría con el logo a medio desvanecer en las demás páginas.
      raiz.style.removeProperty("--logo-p");
      raiz.classList.remove("logo-cabecera-oculto");
    };
  }, []);

  return null;
}
