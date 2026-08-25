"use client";

import Link from "next/link";
import {
  MARCA,
  TAGLINE,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  EMAIL,
  MENSAJES,
  enlaceWhatsApp,
} from "@/lib/site";
import {
  trackEmailClick,
  trackInstagramClick,
  trackWhatsAppClick,
} from "@/lib/analytics";
import styles from "./Footer.module.css";

// Footer con el lenguaje visual de la interfaz nueva (portado del mockup) y el
// inventario de enlaces de producción.
//
// El footer del mockup tenía dos columnas y tres enlaces: correo, Instagram y
// envíos. Adoptarlo tal cual habría eliminado el enlace de WhatsApp —y con él
// el evento whatsapp_click, que es de los pocos que miden intención de compra
// fuera del embudo—, además de los accesos a FAQ y a Privacidad. Cuando la
// estética del mockup y un evento de tracking se cruzan, gana el evento.
//
// También cambia el correo: el mockup escribe hola@lamarquessa.co, que hoy no
// recibe nada. Se conserva el de lib/site.ts, que es el que está conectado a
// Gmail y responde de verdad.
export default function Footer() {
  return (
    <div className="ui-v2">
      <footer className={`${styles.footer} seccion-tinta`}>
        <div className="contenedor">
          <div className={styles.fila}>
            <div className={styles.marca}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/marca/logo-claro.png"
                alt={MARCA}
                width={1000}
                height={285}
              />
              <p className={`eyebrow ${styles.serie}`}>Serie abierta · 2026</p>
              <p className="texto-suave" style={{ marginTop: "var(--s-3)", maxWidth: "34ch" }}>
                {TAGLINE}
              </p>
            </div>

            <div className={styles.columna}>
              <p className={`eyebrow ${styles.tituloColumna}`}>Comprar</p>
              <Link href="/tienda" className="link-terciario">
                Colección
              </Link>
              <Link href="/nosotros" className="link-terciario">
                Nuestra historia
              </Link>
              <Link href="/preguntas-frecuentes" className="link-terciario">
                Preguntas frecuentes
              </Link>
            </div>

            <div className={styles.columna}>
              <p className={`eyebrow ${styles.tituloColumna}`}>Escríbenos</p>
              <a
                href={enlaceWhatsApp(MENSAJES.general)}
                target="_blank"
                rel="noopener"
                onClick={() => trackWhatsAppClick("footer")}
                className="link-terciario"
              >
                WhatsApp
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener"
                onClick={() => trackInstagramClick("footer")}
                className="link-terciario"
              >
                Instagram {INSTAGRAM_HANDLE}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                onClick={() => trackEmailClick("footer")}
                className="link-terciario"
              >
                {EMAIL}
              </a>
            </div>
          </div>

          <div className={styles.legal}>
            <p>
              © {new Date().getFullYear()} {MARCA} · Hecho a mano en Colombia
            </p>
            <p>
              <Link href="/privacidad" className="link-terciario">
                Privacidad
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
