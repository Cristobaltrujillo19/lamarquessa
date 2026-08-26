"use client";

import { MENSAJES, enlaceWhatsApp } from "@/lib/site";
import { trackWhatsAppClick } from "@/lib/analytics";

// El CTA de WhatsApp de /contacto. Va en su propio componente cliente para que
// la página siga siendo servidor: solo el botón necesita el onClick.
//
// Dispara el mismo whatsapp_click que el resto del sitio, con link_location
// nuevo ("contacto"). Es aditivo: mismo nombre de evento, un valor más en el
// parámetro, así que los informes existentes siguen agregando igual y además
// se puede comparar qué punto de contacto convierte mejor.
export default function BotonWhatsApp() {
  return (
    <a
      href={enlaceWhatsApp(MENSAJES.general)}
      className="btn btn-secundario"
      rel="noopener noreferrer"
      target="_blank"
      onClick={() => trackWhatsAppClick("contacto")}
    >
      Escríbenos por WhatsApp
    </a>
  );
}
