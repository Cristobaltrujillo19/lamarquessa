"use client";

import { useEffect, useRef, useState } from "react";
import { type Producto, formatCop, muestraColor } from "@/lib/productos";
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

// Mapa fuenteId → clase de Tailwind ya definida en globals.css. Queen Serif
// vive en font-titulo (con Cormorant como fallback); Cormorant en font-cita.
const CLASE_FUENTE: Record<FuenteInicialesId, string> = {
  queen: "font-titulo",
  cormorant: "font-cita",
};

export default function ComprarPanel({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const [colorId, setColorId] = useState(producto.colores[0].id);
  const [tamanoId, setTamanoId] = useState(producto.tamanos[0].id);

  // Personalización. Toggles y campos empiezan apagados: la ficha se ve
  // igual que siempre para quien no la quiera.
  const [iniActivo, setIniActivo] = useState(false);
  const [iniTexto, setIniTexto] = useState("");
  const [iniFuente, setIniFuente] = useState<FuenteInicialesId>("queen");
  const [colorActivo, setColorActivo] = useState(false);
  const [colorTexto, setColorTexto] = useState("");
  const [errorIni, setErrorIni] = useState<string | null>(null);
  const [errorCol, setErrorCol] = useState<string | null>(null);

  const color = producto.colores.find((c) => c.id === colorId) ?? producto.colores[0];
  const tamano = producto.tamanos.find((t) => t.id === tamanoId) ?? producto.tamanos[0];

  const iniLimpio = normalizarIniciales(iniTexto);
  const colorLimpio = colorTexto.trim();
  // Solo se cuentan como activos si además tienen contenido válido: el
  // cliente puede tocar el toggle sin llenar nada, y en ese caso no cobramos.
  const iniOk = iniActivo && iniLimpio.length > 0;
  const colOk = colorActivo && colorLimpio.length >= 3;
  const addOns =
    (iniOk ? PERSONALIZACION_INICIALES_COP : 0) +
    (colOk ? PERSONALIZACION_COLOR_COP : 0);
  const precioTotal = tamano.precioCop + addOns;
  const personalizacionActiva = iniActivo || colorActivo;

  // El CTA sticky aparece SOLO cuando el CTA principal ya salió por arriba
  // (el usuario lo vio y siguió scrolleando). Sin esta distinción, aparecería
  // también al cargar la página —cuando el CTA principal está muy abajo, aún
  // sin haberse visto— y estaría duplicando algo que el cliente no ha visto.
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ctaSalioPorArriba, setCtaSalioPorArriba] = useState(false);
  useEffect(() => {
    const el = btnRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setCtaSalioPorArriba(entry.boundingClientRect.bottom < 0);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** Dispara customize_product / CustomizeProduct una vez por selección real
   *  del cliente (color, tamaño, o activar un toggle de personalización). */
  function personalizar(nuevoColorId?: string, nuevoTamanoId?: string) {
    const c = nuevoColorId
      ? producto.colores.find((x) => x.id === nuevoColorId) ?? color
      : color;
    const t = nuevoTamanoId
      ? producto.tamanos.find((x) => x.id === nuevoTamanoId) ?? tamano
      : tamano;
    trackCustomizeProduct({
      slug: producto.slug,
      nombre: producto.nombre,
      colorId: c.id,
      colorNombre: c.nombre,
      tamanoId: t.id,
      tamanoNombre: t.nombre,
      precioCop: t.precioCop,
    });
  }

  function agregarAlCarrito() {
    setErrorIni(null);
    setErrorCol(null);

    // Bloqueo si el cliente activó un toggle pero dejó el campo vacío:
    // mejor pedirle que lo llene o lo desactive antes que cobrar de más.
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
    <div className="mt-6">
      <p className="font-cita text-3xl text-cacao">{formatCop(precioTotal)}</p>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.14em] text-cacao-suave">
          Color: <span className="text-cacao">{color.nombre}</span>
        </p>
        <div className="mt-2 flex gap-2">
          {producto.colores.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setColorId(c.id);
                if (c.id !== colorId) personalizar(c.id, undefined);
              }}
              title={c.nombre}
              aria-label={c.nombre}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                c.id === colorId ? "ring-2 ring-cobre ring-offset-2 ring-offset-crema" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className={`block h-8 w-8 rounded-full border-2 ${
                  c.id === colorId ? "border-cobre" : "border-cacao/15"
                }`}
                style={{ background: muestraColor(c) }}
              />
            </button>
          ))}
        </div>
      </div>

      {producto.tamanos.length > 1 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.14em] text-cacao-suave">Tamaño</p>
          <div className="mt-2 flex gap-2">
            {producto.tamanos.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTamanoId(t.id);
                  if (t.id !== tamanoId) personalizar(undefined, t.id);
                }}
                className={`rounded-sm border px-6 py-2 text-sm transition-colors ${
                  t.id === tamanoId
                    ? "border-cobre-texto bg-cobre-texto text-blanco"
                    : "border-cacao/25 text-cacao hover:border-cobre-texto"
                }`}
              >
                {t.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== Personalización — iniciales ===== */}
      <div className="mt-6 rounded-sm bg-arena-clara p-4">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={iniActivo}
              onChange={(e) => {
                setIniActivo(e.target.checked);
                if (e.target.checked) personalizar();
              }}
              className="h-[18px] w-[18px] accent-cobre"
            />
            <span className="text-sm text-cacao">Grabar iniciales</span>
          </span>
          <span className="text-sm text-cobre-texto">
            + {formatCop(PERSONALIZACION_INICIALES_COP)}
          </span>
        </label>

        {iniActivo && (
          <div className="mt-3">
            <input
              type="text"
              value={iniTexto}
              onChange={(e) => setIniTexto(normalizarIniciales(e.target.value))}
              maxLength={3}
              placeholder="MJT"
              autoComplete="off"
              className="w-full rounded-sm border border-cacao/25 bg-blanco px-3 py-2.5 text-cacao uppercase tracking-widest placeholder:text-cacao-suave/50 focus-visible:border-cobre-texto"
              style={{ fontSize: "16px" }}
            />
            <p className="mt-1 text-[11px] text-cacao-suave">
              Hasta 3 letras. Grabadas en la parte inferior del bolso.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {FUENTES_INICIALES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setIniFuente(f.id)}
                  className={`rounded-sm border bg-blanco px-2 py-3 text-center transition-colors ${
                    iniFuente === f.id
                      ? "border-cobre-texto bg-crema"
                      : "border-cacao/25 hover:border-cobre-texto"
                  }`}
                >
                  <span
                    className={`block text-2xl leading-none text-cacao ${CLASE_FUENTE[f.id]}`}
                  >
                    Aa
                  </span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-cacao-suave">
                    {f.nombre}
                  </span>
                </button>
              ))}
            </div>

            <div
              className={`mt-3 rounded-sm border border-dashed border-cacao/20 bg-blanco px-3 py-3 text-center text-4xl text-cacao ${CLASE_FUENTE[iniFuente]}`}
              style={{ letterSpacing: "0.15em" }}
              aria-label="Vista previa de las iniciales"
            >
              {iniLimpio || "Aa"}
            </div>

            {errorIni && (
              <p role="alert" className="mt-2 text-sm text-red-800">
                {errorIni}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ===== Personalización — color a disposición ===== */}
      <div className="mt-3 rounded-sm bg-arena-clara p-4">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={colorActivo}
              onChange={(e) => {
                setColorActivo(e.target.checked);
                if (e.target.checked) personalizar();
              }}
              className="h-[18px] w-[18px] accent-cobre"
            />
            <span className="text-sm text-cacao">Color a disposición</span>
          </span>
          <span className="text-sm text-cobre-texto">
            + {formatCop(PERSONALIZACION_COLOR_COP)}
          </span>
        </label>

        {colorActivo && (
          <div className="mt-3">
            <textarea
              value={colorTexto}
              onChange={(e) => setColorTexto(e.target.value.slice(0, 60))}
              placeholder="Describe el color (p. ej. verde esmeralda con destellos dorados)"
              rows={2}
              className="w-full rounded-sm border border-cacao/25 bg-blanco px-3 py-2.5 text-cacao placeholder:text-cacao-suave/50 focus-visible:border-cobre-texto"
              style={{ fontSize: "16px" }}
            />
            <p className="mt-1 text-[11px] text-cacao-suave">
              Te confirmamos por WhatsApp antes de fabricar. No garantizamos coincidencia exacta con marcas comerciales.
            </p>
            {errorCol && (
              <p role="alert" className="mt-2 text-sm text-red-800">
                {errorCol}
              </p>
            )}
          </div>
        )}
      </div>

      {personalizacionActiva && (
        <p className="mt-3 border-l-2 border-cobre bg-cobre/5 px-3 py-2 text-xs text-cacao">
          <strong>Aviso:</strong> Las piezas personalizadas no admiten cambio ni retracto.
        </p>
      )}

      {addOns > 0 && (
        <dl className="mt-4 space-y-1 border-t border-cacao/10 pt-3 text-sm">
          <div className="flex justify-between text-cacao-suave">
            <dt>
              Bolso {producto.nombre} · {color.nombre}
            </dt>
            <dd>{formatCop(tamano.precioCop)}</dd>
          </div>
          {iniOk && (
            <div className="flex justify-between text-cacao-suave">
              <dt>Iniciales grabadas</dt>
              <dd>{formatCop(PERSONALIZACION_INICIALES_COP)}</dd>
            </div>
          )}
          {colOk && (
            <div className="flex justify-between text-cacao-suave">
              <dt>Color a disposición</dt>
              <dd>{formatCop(PERSONALIZACION_COLOR_COP)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-cacao/10 pt-1.5 font-cita text-base text-cacao">
            <dt>Total</dt>
            <dd>{formatCop(precioTotal)}</dd>
          </div>
        </dl>
      )}

      <button
        ref={btnRef}
        onClick={agregarAlCarrito}
        className="mt-6 w-full rounded-sm bg-cobre px-8 py-4 text-xs uppercase tracking-[0.18em] text-blanco transition-colors hover:bg-cobre-hondo"
      >
        Agregar al carrito — {formatCop(precioTotal)}
      </button>

      <div
        aria-hidden={!ctaSalioPorArriba}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-cacao/10 bg-crema/95 px-4 py-3 shadow-[0_-8px_20px_rgba(74,58,44,0.08)] backdrop-blur-md transition-transform duration-200 md:hidden ${
          ctaSalioPorArriba ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 0.75rem)" }}
      >
        <div className="mx-auto flex max-w-[520px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-cacao">
              Bolso {producto.nombre}
              <span className="text-cacao-suave"> · {color.nombre}</span>
            </p>
            <p className="font-cita text-lg text-cacao">
              {formatCop(precioTotal)}
            </p>
          </div>
          <button
            onClick={agregarAlCarrito}
            tabIndex={ctaSalioPorArriba ? 0 : -1}
            className="shrink-0 rounded-sm bg-cobre px-5 py-3 text-xs uppercase tracking-[0.16em] text-blanco transition-colors hover:bg-cobre-hondo"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
