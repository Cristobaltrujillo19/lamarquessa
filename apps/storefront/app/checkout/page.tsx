"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useCarrito } from "@/lib/carrito";
import { formatCop } from "@/lib/productos";
import {
  guardarSnapshotCompra,
  trackAddPaymentInfo,
  trackBeginCheckout,
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

      {/* Aviso de compra internacional: los envíos fuera de Colombia se cotizan
          uno a uno por WhatsApp (el formulario solo cobra dentro del país),
          así que quien viene de fuera no debería atascarse en el selector de
          departamentos. Va arriba del formulario para verse antes de empezar
          a llenar. */}
      <p className={styles.aviso}>
        ¿Tu envío es fuera de Colombia? Este formulario cobra dentro del país.
        Para envíos internacionales,{" "}
        <a
          href={enlaceWhatsApp(MENSAJES.pedido)}
          target="_blank"
          rel="noopener"
          className="link-terciario"
        >
          escríbenos por WhatsApp
        </a>{" "}
        y te cotizamos el envío antes de la compra.
      </p>

      <form onSubmit={alEnviar} className={styles.disposicion}>
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
                <input name="nombre" required autoComplete="name" className={campo} />
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
                  className={campo}
                />
              </label>
            </div>
            <p className={styles.notaPie}>
              Te escribimos por aquí para coordinar la entrega. Al comprar
              aceptas nuestra{" "}
              <Link href="/privacidad" className="link-terciario">
                política de datos
              </Link>
              .
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
        </aside>
      </form>
      </div>
      </section>
    </div>
  );
}
