"use client";

import { useEffect } from "react";

// Cuando se llega desde otra página a una respuesta concreta
// (/preguntas-frecuentes#devoluciones), el <details> aterriza cerrado: el
// navegador solo hace scroll hasta él. Esto lo abre y lo deja a la vista.
//
// Es una mejora progresiva: sin JavaScript la pregunta igual se ve y se abre
// con un clic, así que nada depende de este componente.
export default function AbrirDelHash() {
  useEffect(() => {
    let cuadro = 0;

    function abrir() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const objetivo = document.getElementById(id);
      if (!(objetivo instanceof HTMLDetailsElement)) return;
      objetivo.open = true;

      // El router lleva la página al tope justo después de hidratar, así que
      // el scroll se hace en el cuadro siguiente: si no, se pierde. De paso,
      // para entonces ya se recalculó la altura de la respuesta recién abierta.
      cuadro = requestAnimationFrame(() => {
        objetivo.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
      });
    }

    abrir();
    window.addEventListener("hashchange", abrir);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("hashchange", abrir);
    };
  }, []);

  return null;
}
