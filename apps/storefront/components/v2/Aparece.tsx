"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Aparición al hacer scroll para la interfaz nueva.
 *
 * Portado del `Reveal` del mockup, pero con la clase renombrada a `aparece`.
 * El motivo: producción ya tiene un `<Reveal />` global montado en el layout
 * que barre el documento buscando `.reveal` y les pone `.visible`. Si este
 * componente conservara ese nombre, los dos gestores actuarían sobre los
 * mismos nodos y el de producción se adelantaría, anulando los retardos
 * escalonados de `paso`. Renombrar cuesta cuatro selectores y elimina toda
 * la ambigüedad.
 *
 * Cuando el porting termine y el `<Reveal />` viejo desaparezca, se puede
 * volver a `reveal` si se quiere paridad literal con el mockup.
 */

/** En servidor no hay layout: useEffect evita el aviso de React. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Si a los 1200ms un elemento sigue oculto, se fuerza visible. */
const RESCATE_MS = 1200;

type Props = {
  children: React.ReactNode;
  /** Retardo escalonado, en pasos de 80ms */
  paso?: number;
  as?: "div" | "section" | "li" | "article";
  className?: string;
};

export default function Aparece({
  children,
  paso = 0,
  as = "div",
  className = "",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  // El estado oculto se aplica desde JS antes del primer pintado. Si el JS
  // no corre, el elemento nunca se oculta y el contenido se ve igual.
  useIsomorphicLayoutEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    nodo.classList.add("aparece-armado");
  }, []);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const mostrar = () => {
      setVisible(true);
      nodo.classList.remove("aparece-armado");
    };

    const obs = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            mostrar();
            obs.unobserve(entrada.target);
          }
        }
      },
      // Dispara 200px antes de entrar en pantalla: con scroll rápido,
      // navegación por teclado o búsqueda en página, el contenido ya está.
      { threshold: 0, rootMargin: "200px 0px" },
    );

    obs.observe(nodo);

    const rescate = window.setTimeout(mostrar, RESCATE_MS);

    return () => {
      obs.disconnect();
      window.clearTimeout(rescate);
    };
  }, []);

  const Etiqueta = as as React.ElementType;

  return (
    <Etiqueta
      ref={ref}
      className={`aparece ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${paso * 80}ms` }}
    >
      {children}
    </Etiqueta>
  );
}
