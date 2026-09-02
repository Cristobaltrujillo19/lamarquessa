"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { registrarCarrito } from "@/app/acciones/carrito";
import { idDeSesion } from "@/lib/sesionCarrito";
import { TEXTO_AVISO_DATOS } from "@/lib/consentimiento";
import { useCarrito } from "@/lib/carrito";
import { formatCop } from "@/lib/productos";
import {
  guardarSnapshotCompra,
  trackAddPaymentInfo,
  trackBeginCheckout,
  trackWhatsAppClick,
} from "@/lib/analytics";
import { addOnsPorUnidad } from "@/lib/personalizacion";
import {
  ENVIO_DIAS,
  MENSAJES,
  PRODUCCION_SEMANAS,
  SHIPPING_COP,
  enlaceWhatsApp,
} from "@/lib/site";
import { DEPARTAMENTOS } from "@/lib/colombia";
import { iniciarCheckout, revisarCupon } from "./actions";
import styles from "./checkout.module.css";

// Checkout con la interfaz nueva. SOLO cambia la presentación: el flujo
// transaccional —validación, server action, creación de la preferencia en
// Convex, redirección a Mercado Pago— y los dos eventos del embudo se
// conservan literales. Este es el punto donde el sitio cobra dinero: no es
// sitio para refactores de oportunidad.

const campo = styles.entrada;
const etiqueta = styles.etiqueta;

/** Asterisco de campo obligatorio. `aria-hidden`: la marca visual sobra para
 *  quien usa lector de pantalla, porque el input ya lleva `required` y el
 *  navegador se lo anuncia. */
function Obligatorio() {
  return (
    <span aria-hidden="true" className={styles.obligatorio}>
      *
    </span>
  );
}

type Cupon = { codigo: string; descuentoCop: number };

export default function CheckoutPage() {
  const { lineas, subtotal } = useCarrito();
  const [enviando, iniciarTransicion] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [cupon, setCupon] = useState<Cupon | null>(null);
  const [avisoCupon, setAvisoCupon] = useState<string | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);

  /* ---------------- Registro del carrito en el checkout ----------------
     Aqui se cubre el tramo que antes era invisible: quien abre el checkout,
     escribe sus datos y se va sin enviar. El pedido solo nace al enviar.

     LA AUTORIZACION ES POR CONDUCTA, no por casilla: escribir los datos
     teniendo el aviso a la vista. Por eso el aviso va ARRIBA del formulario y
     no al final — "informada" exige que se lea antes de escribir, no despues.
     Se archiva el texto exacto que se mostro y cuando. */
  const [envioInternacional, setEnvioInternacional] = useState(false);
  const datosForm = useRef<HTMLFormElement | null>(null);

  const registrar = useCallback(
    (conContacto: boolean) => {
      const sesionId = idDeSesion();
      if (!sesionId || lineas.length === 0) return;

      const f = datosForm.current ? new FormData(datosForm.current) : null;
      const leer = (k: string) => {
        const v = f?.get(k);
        return typeof v === "string" && v.trim() ? v.trim() : undefined;
      };

      const contacto = {
        nombre: leer("nombre"),
        email: leer("email"),
        whatsapp: leer("whatsapp"),
      };
      // Sin un solo dato escrito no hay conducta que autorice nada: archivar
      // un consentimiento vacio seria registrar una autorizacion que nadie
      // dio. Al desenfocar un campo en blanco, esto no manda contacto.
      const hayAlgo = Boolean(contacto.nombre || contacto.email || contacto.whatsapp);

      registrarCarrito({
        sesionId,
        items: lineas.map((l) => ({
          slug: l.slug,
          colorId: l.colorId,
          tamanoId: l.tamanoId,
          cantidad: l.cantidad,
          ...(l.personalizacion ? { personalizacion: l.personalizacion } : {}),
        })),
        paso: "checkout",
        ...(conContacto && hayAlgo
          ? { contacto, consentimiento: { otorgado: true } }
          : {}),
      });
    },
    [lineas],
  );

  // Al abrir el checkout: registro anonimo, sin contacto. Solo dice que
  // alguien llego hasta aqui.
  useEffect(() => {
    registrar(false);
  }, [registrar]);

  // begin_checkout / InitiateCheckout se dispara una sola vez al llegar al
  // checkout con carrito lleno. El submit disparará AddPaymentInfo (más
  // adelante en el funnel). Ref para no re-disparar en re-renders o si el
  // subtotal cambia al aplicar cupón.
  const beginCheckoutDisparado = useRef(false);
  useEffect(() => {
    if (beginCheckoutDisparado.current) return;
    if (lineas.length === 0) return;
    beginCheckoutDisparado.current = true;
    trackBeginCheckout(lineas, subtotal + SHIPPING_COP);
  }, [lineas, subtotal]);

  if (lineas.length === 0) {
    return (
      <div>
        <section className="seccion-base">
          <div className="contenedor">
            <div className={styles.vacio}>
        <h1 className="h1">Tu carrito está vacío.</h1>
            <Link href="/tienda" className="btn btn-primario aire-arriba-lg">
              Ver la colección
            </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const envio = SHIPPING_COP;
  const descuento = cupon?.descuentoCop ?? 0;
  const total = Math.max(0, subtotal + envio - descuento);

  async function aplicarCupon() {
    setValidandoCupon(true);
    setAvisoCupon(null);
    const r = await revisarCupon(codigo, subtotal, envio);
    if (r.valido) {
      setCupon({ codigo: r.codigo, descuentoCop: r.descuentoCop });
      setAvisoCupon(null);
    } else {
      setCupon(null);
      setAvisoCupon(r.mensaje);
    }
    setValidandoCupon(false);
  }

  function alEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);

    // add_payment_info / AddPaymentInfo: momento en el que el cliente se
    // compromete a pagar (el submit). MP se lleva los datos de tarjeta;
    // aquí registramos que llegó al último paso antes del cobro. Antes del
    // await para no perderlo si iniciarCheckout falla.
    trackAddPaymentInfo(lineas, total, cupon?.codigo);

    iniciarTransicion(async () => {
      const r = await iniciarCheckout({
        nombre: String(f.get("nombre") ?? ""),
        email: String(f.get("email") ?? ""),
        whatsapp: String(f.get("whatsapp") ?? ""),
        calle: String(f.get("calle") ?? ""),
        ciudad: String(f.get("ciudad") ?? ""),
        departamento: String(f.get("departamento") ?? ""),
        notas: String(f.get("notas") ?? ""),
        codigo: cupon?.codigo,
        // Solo qué variante, cuántas y (opcional) qué personalización.
        // El precio lo pone el servidor tras re-validar los add-ons.
        items: lineas.map((l) => ({
          slug: l.slug,
          colorId: l.colorId,
          tamanoId: l.tamanoId,
          cantidad: l.cantidad,
          ...(l.personalizacion ? { personalizacion: l.personalizacion } : {}),
        })),
      });

      if (!r.ok) {
        setError(r.error);
        return;
      }
      // Snapshot del carrito+total ANTES de vaciar/redirigir: /gracias lo
      // recoge de sessionStorage para armar el evento purchase con items y
      // valor reales (después de MP, el carrito ya está vacío). El precio
      // por item incluye add-ons de personalización para que GA4/Meta
      // vean el valor efectivo pagado por bolso.
      guardarSnapshotCompra({
        value: total,
        shipping: envio,
        currency: "COP",
        items: lineas.map((l) => {
          const addOns = addOnsPorUnidad(l.personalizacion);
          const extra: string[] = [];
          if (l.personalizacion?.iniciales)
            extra.push(`Iniciales ${l.personalizacion.iniciales.texto}`);
          if (l.personalizacion?.colorPersonalizado)
            extra.push("Color personalizado");
          return {
            item_id: `${l.slug}|${l.colorId}|${l.tamanoId}`,
            item_name: `Bolso ${l.nombre}`,
            item_variant: [l.colorNombre, l.tamanoNombre, ...extra].join(" · "),
            item_category: "Bolsos",
            price: l.precioCop + addOns,
            quantity: l.cantidad,
          };
        }),
        ...(cupon?.codigo ? { coupon: cupon.codigo } : {}),
      });
      // El carrito NO se vacía aquí: si el pago se cae o el cliente se
      // arrepiente en Mercado Pago, vuelve y encuentra su pedido intacto.
      // Se vacía en /gracias, cuando el pago ya salió bien.
      window.location.href = r.initPoint;
    });
  }

  return (
    <div>
      <section className="seccion-base">
      <div className="contenedor">
      <h1 className="h1">Finalizar compra.</h1>

      <form ref={datosForm} onSubmit={alEnviar} className={styles.disposicion}>
        <div className={styles.grupo}>
          <section>
            <h2 className="h3">Tus datos</h2>
            <p className={styles.notaPie}>
              Los campos marcados con <span className={styles.obligatorio}>*</span>{" "}
              son obligatorios.
            </p>

            <div className={styles.rejilla}>
              <label className={styles.anchoCompleto}>
                <span className={etiqueta}>
                  Nombre completo<Obligatorio />
                </span>
                <input
                  name="nombre"
                  required
                  autoComplete="name"
                  onBlur={() => registrar(true)}
                  className={campo}
                />
              </label>
              <label>
                <span className={etiqueta}>
                  Correo<Obligatorio />
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  onBlur={() => registrar(true)}
                  className={campo}
                />
              </label>
              <label>
                <span className={etiqueta}>
                  WhatsApp<Obligatorio />
                </span>
                <input
                  name="whatsapp"
                  type="tel"
                  required
                  autoComplete="tel"
                  // inputMode: teclado numérico en móvil, más cómodo para un
                  // teléfono. pattern: mínimo 7 dígitos, tolera espacios y guiones
                  // porque muchos escriben "300 123 4567". La normalización a
                  // solo dígitos vive en el servidor.
                  inputMode="tel"
                  pattern="[0-9+\-\s]{7,}"
                  placeholder="300 000 0000"
                  onBlur={() => registrar(true)}
                  className={campo}
                />
              </label>

            </div>
            {/* Sin la coletilla de la politica de datos: ya la declara el
                aviso del cierre del formulario, y dos veces en la misma
                pagina no informa mas, solo pesa. */}
            <p className={styles.notaPie}>
              Te escribimos por aquí para coordinar la entrega.
            </p>
          </section>

          <section>
            <h2 className="h3">¿A dónde lo enviamos?</h2>
            <div className={styles.rejilla}>
              <label className={styles.anchoCompleto}>
                <span className={etiqueta}>
                  Dirección<Obligatorio />
                </span>
                <input
                  name="calle"
                  required
                  autoComplete="street-address"
                  placeholder="Calle 00 #00-00, apto 000"
                  className={campo}
                />
              </label>
              <label>
                <span className={etiqueta}>
                  Ciudad<Obligatorio />
                </span>
                <input
                  name="ciudad"
                  required
                  autoComplete="address-level2"
                  className={campo}
                />
              </label>
              <label>
                <span className={etiqueta}>
                  Departamento<Obligatorio />
                </span>
                <select name="departamento" required defaultValue="" className={campo}>
                  <option value="" disabled>
                    Elige uno
                  </option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.anchoCompleto}>
                <span className={etiqueta}>Indicaciones para la entrega (opcional)</span>
                <input
                  name="notas"
                  placeholder="Portería, punto de referencia, horario…"
                  className={campo}
                />
              </label>
            </div>

            {/* Compra internacional. El formulario solo cobra dentro de Colombia, y
                quien viene de fuera se atascaba en el selector de departamentos.

                Antes era un parrafo con un enlace dentro. Ahora es una casilla que,
                al marcarla, abre un boton directo a WhatsApp: quien compra desde
                Colombia —la mayoria— ve una sola linea y sigue, y quien compra
                desde fuera se identifica solo y recibe una accion, no un parrafo.

                El boton SI dispara `whatsapp_click`; el enlace de antes no lo hacia,
                asi que este camino no se estaba midiendo. `link_location` distingue
                esta salida de las demas: es parametro nuevo, no evento nuevo. */}
            <div className={styles.aviso}>
              <label className={styles.avisoCasilla}>
                <input
                  type="checkbox"
                  checked={envioInternacional}
                  onChange={(e) => setEnvioInternacional(e.target.checked)}
                />
                <span>Mi envío es fuera de Colombia</span>
              </label>

              {envioInternacional && (
                <div className={styles.avisoAccion}>
                  <p>
                    Este formulario solo cobra dentro del país. Te cotizamos el envío
                    internacional por WhatsApp antes de la compra.
                  </p>
                  <a
                    href={enlaceWhatsApp(MENSAJES.pedido)}
                    target="_blank"
                    rel="noopener"
                    onClick={() => trackWhatsAppClick("checkout_internacional")}
                    className="btn btn-primario"
                  >
                    Cotizar por WhatsApp
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className={styles.resumen}>
          <h2 className="h3">Tu pedido</h2>

          <ul className="mt-4 space-y-3">
            {lineas.map((l) => {
              const addOns = addOnsPorUnidad(l.personalizacion);
              const precioLinea = (l.precioCop + addOns) * l.cantidad;
              return (
                <li key={l.key} className={styles.resumenLinea}>
                  <span className="texto-suave">
                    {l.cantidad}× Bolso {l.nombre}
                    <span className="block text-xs">
                      {l.colorNombre} · {l.tamanoNombre}
                    </span>
                    {l.personalizacion?.iniciales && (
                      <span className="block text-xs text-[var(--cobre-texto)]">
                        Iniciales {l.personalizacion.iniciales.texto}
                      </span>
                    )}
                    {l.personalizacion?.colorPersonalizado && (
                      <span className="block text-xs text-[var(--cobre-texto)]">
                        Color personalizado:{" "}
                        {l.personalizacion.colorPersonalizado.descripcion}
                      </span>
                    )}
                  </span>
                  <span className="precio">
                    {formatCop(precioLinea)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className={styles.cupon}>
            <span className={etiqueta}>¿Tienes un código?</span>
            <div className="mt-1 flex gap-2">
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                aria-label="Código de descuento"
                className={`${campo} mt-0 flex-1 uppercase`}
              />
              <button
                type="button"
                onClick={aplicarCupon}
                disabled={validandoCupon}
                className="btn btn-secundario"
              >
                {validandoCupon ? "…" : "Aplicar"}
              </button>
            </div>
            {avisoCupon && <p className="mt-2 text-sm text-red-700">{avisoCupon}</p>}
            {cupon && (
              <p className="mt-2 text-sm text-[var(--cobre-texto)]">
                Código {cupon.codigo} aplicado.
              </p>
            )}
          </div>

          <dl className={styles.totales}>
            <div className={styles.totalFila}>
              <dt className="texto-suave">Subtotal</dt>
              <dd>{formatCop(subtotal)}</dd>
            </div>
            {descuento > 0 && (
              <div className={styles.totalFila} style={{ color: "var(--cobre-texto)" }}>
                <dt>Descuento</dt>
                <dd>−{formatCop(descuento)}</dd>
              </div>
            )}
            <div className={styles.totalFila}>
              <dt className="texto-suave">Envío</dt>
              <dd>{formatCop(envio)}</dd>
            </div>
            <div className={`${styles.totalFila} ${styles.totalFinal}`}>
              <dt>Total</dt>
              <dd>{formatCop(total)}</dd>
            </div>
          </dl>

          {error && (
            <p
              role="alert"
              className={styles.error}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className={`btn btn-primario ${styles.btnAncho}`}
          >
            {enviando ? "Llevándote al pago…" : "Pagar con Mercado Pago"}
          </button>

          <p className={styles.notaPie}>
            🔒 El pago lo procesa Mercado Pago. Nosotros no vemos ni guardamos
            los datos de tu tarjeta.
          </p>
          <p className={styles.notaPie}>
            Tu bolso se fabrica a pedido: {PRODUCCION_SEMANAS} semanas + {ENVIO_DIAS}{" "}
            días hábiles de envío.
          </p>

          {/* Aviso de tratamiento de datos, al cierre del formulario.
              Es corto a proposito: el detalle vive en la FAQ, porque un
              parrafo largo aqui no se lee. El texto que se muestra es
              EXACTAMENTE el que se archiva como prueba — ver
              lib/consentimiento.ts antes de tocarlo. */}
          <p className={styles.avisoDatos}>
            {TEXTO_AVISO_DATOS}{" "}
            <Link href="/preguntas-frecuentes#datos" className="link-terciario">
              Qué hacemos con tus datos
            </Link>
            .
          </p>
        </aside>
      </form>
      </div>
      </section>
    </div>
  );
}
