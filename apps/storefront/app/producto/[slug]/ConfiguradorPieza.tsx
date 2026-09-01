"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import GaleriaPieza from "./GaleriaPieza";
import SelectorColor from "./SelectorColor";
import {
  type Color,
  type Producto,
  formatCop,
  galeriaOrdenada,
} from "@/lib/productos";
import { useCarrito } from "@/lib/carrito";
import { trackAddToCart, trackCustomizeProduct } from "@/lib/analytics";
import {
  FUENTES_INICIALES,
  PERSONALIZACION_COLOR_COP,
  PERSONALIZACION_INICIALES_COP,
  normalizarIniciales,
  type FuenteInicialesId,
  type Personalizacion,
} from "@/lib/personalizacion";
import styles from "./producto.module.css";
import cfg from "./ConfiguradorPieza.module.css";

// Queen Serif vive en font-titulo; Cormorant en font-cita.
const CLASE_FUENTE: Record<FuenteInicialesId, string> = {
  queen: "font-titulo",
  cormorant: "font-cita",
};

/**
 * Ficha de pieza: galería, selector de color y compra.
 *
 * Reúne la maqueta del mockup con lo que producción no puede perder: los dos
 * add-ons de personalización con su desglose en vivo, el carrito real y los
 * tres eventos del embudo (view_item lo dispara ViewItemTracker aparte).
 *
 * DOS SITIOS DONDE SE APARTA DEL MOCKUP, Y POR QUÉ:
 *
 * 1. El CTA del mockup es un <Link href="/carrito?pieza=X&color=Y">: allí el
 *    carrito es una cáscara que lee la URL. Aquí llama al carrito de verdad,
 *    porque es donde vive add_to_cart / AddToCart.
 *
 * 2. El mockup pinta el numero de serie de la pieza y anuncia cual te tocara.
 *    Produccion no tiene ese dato, y la frase alternativa que lo sustituia
 *    ("Tu pieza recibe su numero al entrar a produccion") tambien se retiro:
 *    anunciaba una numeracion que el visitante nunca llega a ver.
 */
export default function ConfiguradorPieza({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();

  const [colorId, setColorId] = useState(producto.colores[0].id);
  const [tamanoId, setTamanoId] = useState(producto.tamanos[0].id);

  // Personalización. Empieza apagada: la ficha se ve igual que siempre para
  // quien no la quiera.
  const [iniActivo, setIniActivo] = useState(false);
  const [iniTexto, setIniTexto] = useState("");
  const [iniFuente, setIniFuente] = useState<FuenteInicialesId>("queen");
  const [colorActivo, setColorActivo] = useState(false);
  const [colorTexto, setColorTexto] = useState("");
  const [errorIni, setErrorIni] = useState<string | null>(null);
  const [errorCol, setErrorCol] = useState<string | null>(null);

  const color =
    producto.colores.find((c) => c.id === colorId) ?? producto.colores[0];
  const tamano =
    producto.tamanos.find((t) => t.id === tamanoId) ?? producto.tamanos[0];

  // La elección viaja en ?color= para poder compartirla y sobrevivir a un
  // refresco. Se lee de window.location dentro de un efecto y NO con
  // useSearchParams, que forzaría render dinámico de toda la ruta.
  useEffect(() => {
    const leer = () => {
      const id = new URLSearchParams(window.location.search).get("color");
      if (id && producto.colores.some((c) => c.id === id)) setColorId(id);
    };
    leer();
    window.addEventListener("popstate", leer);
    return () => window.removeEventListener("popstate", leer);
  }, [producto.colores]);

  const elegirColor = (c: Color) => {
    setColorId(c.id);
    trackCustomizeProduct({
      slug: producto.slug,
      nombre: producto.nombre,
      colorId: c.id,
      colorNombre: c.nombre,
      tamanoId: tamano.id,
      tamanoNombre: tamano.nombre,
      precioCop: tamano.precioCop,
    });
    if (typeof window === "undefined") return;
    // replaceState y no pushState: tantear colores no debe llenar el
    // historial de vueltas atrás.
    const params = new URLSearchParams(window.location.search);
    if (c.id === producto.colores[0].id) params.delete("color");
    else params.set("color", c.id);
    const q = params.toString();
    window.history.replaceState(
      null,
      "",
      q ? `${window.location.pathname}?${q}` : window.location.pathname,
    );
  };

  // La galería enseña SIEMPRE todas las fotos; elegir un color las reordena.
  const fotos = useMemo(
    () => galeriaOrdenada(producto, color.id),
    [producto, color.id],
  );

  const iniLimpio = normalizarIniciales(iniTexto);
  const colorLimpio = colorTexto.trim();
  // Solo cuentan si además tienen contenido válido: el cliente puede tocar el
  // interruptor sin llenar nada, y en ese caso no cobramos.
  const iniOk = iniActivo && iniLimpio.length > 0;
  const colOk = colorActivo && colorLimpio.length >= 3;
  const addOns =
    (iniOk ? PERSONALIZACION_INICIALES_COP : 0) +
    (colOk ? PERSONALIZACION_COLOR_COP : 0);
  const precioTotal = tamano.precioCop + addOns;
  const personalizacionActiva = iniActivo || colorActivo;

  const avisarPersonalizacion = () =>
    trackCustomizeProduct({
      slug: producto.slug,
      nombre: producto.nombre,
      colorId: color.id,
      colorNombre: color.nombre,
      tamanoId: tamano.id,
      tamanoNombre: tamano.nombre,
      precioCop: tamano.precioCop,
    });

  // CTA fijo en móvil: aparece SOLO cuando el CTA principal ya salió por
  // arriba (el visitante lo vio y siguió bajando). Sin esa distinción
  // aparecería también al cargar —cuando el CTA está muy abajo, aún sin
  // verse— duplicando algo que nadie ha visto.
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ctaSalioPorArriba, setCtaSalioPorArriba] = useState(false);
  useEffect(() => {
    const el = btnRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setCtaSalioPorArriba(entry.boundingClientRect.bottom < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function agregarAlCarrito() {
    setErrorIni(null);
    setErrorCol(null);

    // Si activó un interruptor y dejó el campo vacío, mejor pedirle que lo
    // llene o lo apague que cobrarle de más.
    if (iniActivo && iniLimpio.length === 0) {
      setErrorIni("Escribe las iniciales o desactiva el grabado.");
      return;
    }
    if (colorActivo && colorLimpio.length < 3) {
      setErrorCol("Describe el color o desactiva la opción.");
      return;
    }

    const personalizacion: Personalizacion | undefined =
      iniOk || colOk
        ? {
            ...(iniOk
              ? { iniciales: { texto: iniLimpio, fuenteId: iniFuente } }
              : {}),
            ...(colOk
              ? { colorPersonalizado: { descripcion: colorLimpio } }
              : {}),
          }
        : undefined;

    const linea = {
      slug: producto.slug,
      nombre: producto.nombre,
      colorId: color.id,
      colorNombre: color.nombre,
      tamanoId: tamano.id,
      tamanoNombre: tamano.nombre,
      precioCop: tamano.precioCop,
      foto: producto.fotos[0],
      ...(personalizacion ? { personalizacion } : {}),
    };
    agregar(linea);
    trackAddToCart(linea);
  }

  return (
    <div className={styles.pieza}>
      {/* Titular en fila propia, a lo ancho de las dos columnas. Sale de la
          columna de datos por dos motivos: en escritorio libera altura arriba
          del selector, y en movil es lo que pone el NOMBRE antes de las fotos
          sin recurrir a `order`, que reordena lo que se ve pero no lo que lee
          un lector de pantalla ni el orden de tabulacion. */}
      <header className={styles.encabezado}>
        <p className={`eyebrow eyebrow-dato ${styles.migas}`}>
          <Link href="/tienda" className="link-terciario">
            Colección
          </Link>
        </p>

        <h1 id="titular-pieza" className={`h2 ${styles.nombre}`}>
          {producto.nombre}
        </h1>
      </header>

      <GaleriaPieza producto={producto} fotos={fotos} colorId={color.id} />

      <div className={styles.datos}>
        <p className={`precio ${styles.precio}`}>{formatCop(precioTotal)}</p>

        {producto.subtitulo && <p className={styles.frase}>{producto.subtitulo}</p>}

        <div className={styles.colores}>
          <SelectorColor
            producto={producto}
            elegido={color}
            onElegir={elegirColor}
          />

          {/* Esta linea describe SOLO el color, que es el unico eje que el
              selector cambia. */}
          <p className={`cuerpo ${styles.notaColor}`} aria-live="polite">
            <strong className={styles.notaColorFuerte}>
              Color {color.nombre}
            </strong>
            {color.descripcion ? `. ${color.descripcion}` : ""}
          </p>

          {/* Sin esta pista, la vista previa es un secreto: nadie pasa el
              cursor por encima de un cuadradito de color a ver qué pasa. */}
          <p className={styles.pistaColor}>
            Pasa el cursor o toca una muestra para ver el color.
          </p>
        </div>

        {/* Con una sola talla el selector sobra: solo añade ruido. */}
        {producto.tamanos.length > 1 && (
          <div className={styles.colores}>
            <p className="eyebrow eyebrow-seccion">Tamaño</p>
            <div className={cfg.opciones}>
              {producto.tamanos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTamanoId(t.id);
                    if (t.id !== tamanoId) avisarPersonalizacion();
                  }}
                  className={`${cfg.opcion} ${t.id === tamanoId ? cfg.opcionActiva : ""}`}
                >
                  {t.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---- Personalización ---- */}
        <div className={styles.colores}>
          <label className={styles.personalizacionCabecera}>
            <input
              type="checkbox"
              checked={iniActivo}
              onChange={(e) => {
                setIniActivo(e.target.checked);
                if (e.target.checked) avisarPersonalizacion();
              }}
            />
            <span>Grabar iniciales</span>
            <span className={styles.personalizacionPrecio}>
              + {formatCop(PERSONALIZACION_INICIALES_COP)}
            </span>
          </label>

          {iniActivo && (
            <div className={styles.personalizacionCuerpo}>
              <input
                type="text"
                value={iniTexto}
                onChange={(e) => setIniTexto(normalizarIniciales(e.target.value))}
                maxLength={3}
                placeholder="MJT"
                autoComplete="off"
                aria-label="Iniciales, hasta tres letras"
                className={styles.campo}
              />
              <p className={styles.pistaColor}>
                Hasta 3 letras. Grabadas en la parte inferior de la pieza.
              </p>

              <div className={styles.fuentes}>
                {FUENTES_INICIALES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setIniFuente(f.id)}
                    className={`${styles.fuente} ${iniFuente === f.id ? styles.fuenteActiva : ""}`}
                  >
                    <span className={`${styles.fuenteMuestra} ${CLASE_FUENTE[f.id]}`}>
                      Aa
                    </span>
                    <span className="eyebrow">{f.nombre}</span>
                  </button>
                ))}
              </div>

              <div
                className={`${styles.vistaPreviaIniciales} ${CLASE_FUENTE[iniFuente]}`}
                aria-label="Vista previa de las iniciales"
              >
                {iniLimpio || "Aa"}
              </div>

              {errorIni && (
                <p role="alert" className={styles.error}>
                  {errorIni}
                </p>
              )}
            </div>
          )}
        </div>

        <div className={styles.colores}>
          <label className={styles.personalizacionCabecera}>
            <input
              type="checkbox"
              checked={colorActivo}
              onChange={(e) => {
                setColorActivo(e.target.checked);
                if (e.target.checked) avisarPersonalizacion();
              }}
            />
            <span>Color personalizado</span>
            <span className={styles.personalizacionPrecio}>
              + {formatCop(PERSONALIZACION_COLOR_COP)}
            </span>
          </label>

          {colorActivo && (
            <div className={styles.personalizacionCuerpo}>
              <textarea
                value={colorTexto}
                onChange={(e) => setColorTexto(e.target.value.slice(0, 60))}
                placeholder="Describe el color (p. ej. verde esmeralda con destellos dorados)"
                rows={2}
                aria-label="Descripción del color personalizado"
                className={styles.campo}
              />
              <p className={styles.pistaColor}>
                Te confirmamos por WhatsApp antes de fabricar. No garantizamos
                coincidencia exacta con marcas comerciales.
              </p>
              {errorCol && (
                <p role="alert" className={styles.error}>
                  {errorCol}
                </p>
              )}
            </div>
          )}
        </div>

        {personalizacionActiva && (
          <p className={styles.avisoLegal}>
            <strong>Aviso:</strong> las piezas personalizadas no admiten cambio
            ni retracto.
          </p>
        )}

        {addOns > 0 && (
          <dl className={styles.desglose}>
            <div className={styles.fila}>
              <dt className={styles.filaClave}>
                {producto.nombre} · {color.nombre}
              </dt>
              <dd className={styles.filaValor}>{formatCop(tamano.precioCop)}</dd>
            </div>
            {iniOk && (
              <div className={styles.fila}>
                <dt className={styles.filaClave}>Iniciales grabadas</dt>
                <dd className={styles.filaValor}>
                  {formatCop(PERSONALIZACION_INICIALES_COP)}
                </dd>
              </div>
            )}
            {colOk && (
              <div className={styles.fila}>
                <dt className={styles.filaClave}>Color personalizado</dt>
                <dd className={styles.filaValor}>
                  {formatCop(PERSONALIZACION_COLOR_COP)}
                </dd>
              </div>
            )}
            <div className={`${styles.fila} ${styles.filaTotal}`}>
              <dt className={styles.filaClave}>Total</dt>
              <dd className={styles.filaValor}>{formatCop(precioTotal)}</dd>
            </div>
          </dl>
        )}

        <div className={styles.acciones}>
          <button
            ref={btnRef}
            type="button"
            onClick={agregarAlCarrito}
            className="btn btn-primario"
          >
            Añadir al carrito · {formatCop(precioTotal)}
          </button>

          {/* Eco escrito de la decision, en vivo. */}
          <p className={styles.resumen} aria-live="polite">
            {producto.nombre} · color {color.nombre}
          </p>
        </div>
      </div>

      {/* CTA fijo en móvil. Con safe-area para iPhones con notch. */}
      <div
        aria-hidden={!ctaSalioPorArriba}
        className={`${styles.ctaFijo} ${ctaSalioPorArriba ? styles.ctaFijoVisible : ""}`}
      >
        <div className={styles.ctaFijoFila}>
          <div className={styles.ctaFijoTexto}>
            <p>
              {producto.nombre}
              <span> · {color.nombre}</span>
            </p>
            <p className={styles.ctaFijoPrecio}>{formatCop(precioTotal)}</p>
          </div>
          <button
            type="button"
            onClick={agregarAlCarrito}
            tabIndex={ctaSalioPorArriba ? 0 : -1}
            className="btn btn-primario"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
