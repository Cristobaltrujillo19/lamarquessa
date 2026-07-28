"use client";

import { useEffect, useState } from "react";
import { IconoWhatsApp } from "./IconoMarca";
import { enlaceWhatsApp } from "@/lib/site";
import css from "./FabWhatsApp.module.css";

// Botón flotante de WhatsApp: en Colombia es un canal de compra real, no un
// adorno. Aparece al pasar el hero para no tapar la primera impresión.
export default function FabWhatsApp({ mensaje }: { mensaje: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    if (!hero) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entrada]) => setVisible(!entrada.isIntersecting),
      { threshold: 0.25 },
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  return (
    <a
      href={enlaceWhatsApp(mensaje)}
      target="_blank"
      rel="noopener"
      aria-label="Escríbenos por WhatsApp"
      className={`${css.fab} ${visible ? css.visible : ""}`}
    >
      <IconoWhatsApp tamano={28} />
    </a>
  );
}
