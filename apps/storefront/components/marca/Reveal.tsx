"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Aparición suave de las secciones al hacer scroll (portado del landing).
// Marca <html> con la clase `js` para que el CSS solo esconda contenido si hay
// JavaScript: sin JS, todo se ve igual. Respeta prefers-reduced-motion.
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("js");
    const elementos = document.querySelectorAll(".reveal:not(.visible)");
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducir || !("IntersectionObserver" in window)) {
      elementos.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visible");
            observador.unobserve(entrada.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    elementos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [pathname]);

  return null;
}
