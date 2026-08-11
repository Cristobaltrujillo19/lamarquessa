// Emisor centralizado de eventos hacia los tres destinos activos:
//  - GA4 (via gtag.js): nombres reservados en snake_case, items[] con item_id.
//  - GTM dataLayer: mismo objeto, GTM enruta a otros destinos si los hay.
//  - Meta Pixel (fbq): nombres estándar en PascalCase, contents[] con id.
//
// Un solo sitio garantiza que el schema (nombres de campos, moneda, forma
// del item) sea idéntico en todos los disparos — los tres destinos son
// silenciosos con eventos mal formados y esos silencios son difíciles de
// depurar en Analytics/Ads Manager.
//
// El mapeo GA4 ↔ Meta es intencional:
//  view_item        → ViewContent
//  add_to_cart      → AddToCart
//  begin_checkout   → InitiateCheckout
//  purchase         → Purchase
//  view_item_list   → (Meta no tiene estándar; custom)
//  view_cart / remove_from_cart / select_item → (custom)
//  whatsapp_click / email_click → Contact (estándar Meta)
//  instagram_click / faq_open   → custom

import { enviarEvento, enviarEventoMeta } from "@/components/Analitica";
import type { LineaCarrito } from "./carrito";

const CURRENCY = "COP";
const SNAPSHOT_KEY = "lm_pending_purchase";

/** Item con la forma que GA4 espera dentro del array `items`. */
export type ItemGA4 = {
  item_id: string;
  item_name: string;
  item_variant?: string;
  item_category?: string;
  price: number;
  quantity: number;
};

function itemDeLinea(l: LineaCarrito): ItemGA4 {
  return {
    // Un id por VARIANTE (bolso × color × tamaño): que dos filas con distinto
    // color no aparezcan como el mismo producto en los reportes de GA4.
    item_id: `${l.slug}|${l.colorId}|${l.tamanoId}`,
    item_name: `Bolso ${l.nombre}`,
    item_variant: `${l.colorNombre} · ${l.tamanoNombre}`,
    item_category: "Bolsos",
    price: l.precioCop,
    quantity: l.cantidad,
  };
}

/** Meta espera un `contents` con {id, quantity, item_price} y un `content_ids`
 *  con solo los ids. Se derivan del mismo array de ItemGA4 para no divergir. */
function contentsMeta(items: ItemGA4[]) {
  return {
    content_ids: items.map((i) => i.item_id),
    content_type: "product" as const,
    contents: items.map((i) => ({
      id: i.item_id,
      quantity: i.quantity,
      item_price: i.price,
    })),
  };
}

// === Ficha de producto ===

export function trackViewItem(p: {
  slug: string;
  nombre: string;
  colorId: string;
  colorNombre: string;
  tamanoId: string;
  tamanoNombre: string;
  precioCop: number;
}): void {
  const item: ItemGA4 = {
    item_id: `${p.slug}|${p.colorId}|${p.tamanoId}`,
    item_name: `Bolso ${p.nombre}`,
    item_variant: `${p.colorNombre} · ${p.tamanoNombre}`,
    item_category: "Bolsos",
    price: p.precioCop,
    quantity: 1,
  };
  enviarEvento("view_item", {
    currency: CURRENCY,
    value: p.precioCop,
    items: [item],
  });
  enviarEventoMeta("ViewContent", {
    ...contentsMeta([item]),
    content_name: item.item_name,
    content_category: item.item_category,
    value: p.precioCop,
    currency: CURRENCY,
  });
}

// === Carrito ===

export function trackAddToCart(l: Omit<LineaCarrito, "key" | "cantidad">, cantidad = 1): void {
  const item = itemDeLinea({ ...l, key: "", cantidad });
  const value = item.price * item.quantity;
  enviarEvento("add_to_cart", { currency: CURRENCY, value, items: [item] });
  enviarEventoMeta("AddToCart", {
    ...contentsMeta([item]),
    content_name: item.item_name,
    value,
    currency: CURRENCY,
  });
}

export function trackRemoveFromCart(l: LineaCarrito): void {
  const item = itemDeLinea(l);
  const value = item.price * item.quantity;
  enviarEvento("remove_from_cart", { currency: CURRENCY, value, items: [item] });
  // Meta no tiene evento estándar RemoveFromCart; lo mandamos custom para
  // poder analizar tasa de abandono desde Ads Manager si algún día importa.
  enviarEventoMeta(
    "RemoveFromCart",
    { ...contentsMeta([item]), value, currency: CURRENCY },
    "trackCustom",
  );
}

export function trackViewCart(lineas: LineaCarrito[], subtotal: number): void {
  const items = lineas.map(itemDeLinea);
  enviarEvento("view_cart", { currency: CURRENCY, value: subtotal, items });
  enviarEventoMeta(
    "ViewCart",
    {
      ...contentsMeta(items),
      value: subtotal,
      currency: CURRENCY,
      num_items: items.reduce((s, i) => s + i.quantity, 0),
    },
    "trackCustom",
  );
}

// === Catálogo ===

export function trackViewItemList(
  productos: Array<{ slug: string; nombre: string; precioDesde: number }>,
  listName = "Colección",
): void {
  enviarEvento("view_item_list", {
    item_list_name: listName,
    items: productos.map((p, i) => ({
      item_id: p.slug,
      item_name: `Bolso ${p.nombre}`,
      item_category: "Bolsos",
      price: p.precioDesde,
      index: i,
    })),
  });
  enviarEventoMeta(
    "ViewList",
    {
      content_ids: productos.map((p) => p.slug),
      content_type: "product",
      content_category: listName,
    },
    "trackCustom",
  );
}

export function trackSelectItem(
  p: { slug: string; nombre: string; precioDesde: number },
  listName = "Colección",
): void {
  enviarEvento("select_item", {
    item_list_name: listName,
    items: [
      {
        item_id: p.slug,
        item_name: `Bolso ${p.nombre}`,
        item_category: "Bolsos",
        price: p.precioDesde,
      },
    ],
  });
  enviarEventoMeta(
    "SelectItem",
    {
      content_ids: [p.slug],
      content_type: "product",
      content_name: `Bolso ${p.nombre}`,
      content_category: listName,
    },
    "trackCustom",
  );
}

// === Checkout y compra ===

export function trackBeginCheckout(
  lineas: LineaCarrito[],
  value: number,
  cupon?: string,
): void {
  const items = lineas.map(itemDeLinea);
  enviarEvento("begin_checkout", {
    currency: CURRENCY,
    value,
    ...(cupon ? { coupon: cupon } : {}),
    items,
  });
  enviarEventoMeta("InitiateCheckout", {
    ...contentsMeta(items),
    value,
    currency: CURRENCY,
    num_items: items.reduce((s, i) => s + i.quantity, 0),
  });
}

/** Snapshot que se guarda justo antes de redirigir a Mercado Pago para poder
 *  disparar `purchase` cuando volvamos a /gracias con el carrito ya vacío. */
export type SnapshotCompra = {
  value: number;
  shipping: number;
  currency: "COP";
  items: ItemGA4[];
  coupon?: string;
};

export function guardarSnapshotCompra(s: SnapshotCompra): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(s));
  } catch {
    /* sessionStorage puede estar deshabilitada; el evento purchase se pierde */
  }
}

/** Consume el snapshot: lo devuelve UNA vez y lo borra, así una recarga de
 *  /gracias no dispara `purchase` dos veces. */
export function consumirSnapshotCompra(): SnapshotCompra | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(SNAPSHOT_KEY);
    return JSON.parse(raw) as SnapshotCompra;
  } catch {
    return null;
  }
}

export function trackPurchase(args: {
  transactionId: string;
  snapshot: SnapshotCompra;
}): void {
  enviarEvento("purchase", {
    transaction_id: args.transactionId,
    currency: args.snapshot.currency,
    value: args.snapshot.value,
    shipping: args.snapshot.shipping,
    ...(args.snapshot.coupon ? { coupon: args.snapshot.coupon } : {}),
    items: args.snapshot.items,
  });
  // Meta necesita eventID para deduplicar entre pixel y Conversions API si un
  // día lo activamos server-side. Usar el transactionId como eventID mata dos
  // pájaros: identifica la compra y ya es único por intento.
  enviarEventoMeta("Purchase", {
    ...contentsMeta(args.snapshot.items),
    value: args.snapshot.value,
    currency: args.snapshot.currency,
    num_items: args.snapshot.items.reduce((s, i) => s + i.quantity, 0),
    eventID: args.transactionId,
  });
}

// === Engagement ===

export function trackWhatsAppClick(location: string): void {
  enviarEvento("whatsapp_click", { link_location: location });
  // Contact es estándar de Meta: usalo para audiencias de remarketing de
  // "personas interesadas que aún no compraron".
  enviarEventoMeta("Contact", { link_location: location, channel: "whatsapp" });
}

export function trackInstagramClick(location: string): void {
  enviarEvento("instagram_click", { link_location: location });
  enviarEventoMeta(
    "InstagramClick",
    { link_location: location },
    "trackCustom",
  );
}

export function trackFaqOpen(id: string, pregunta: string): void {
  enviarEvento("faq_open", { faq_id: id, faq_question: pregunta });
  enviarEventoMeta(
    "FaqOpen",
    { faq_id: id, faq_question: pregunta },
    "trackCustom",
  );
}

export function trackEmailClick(location: string): void {
  enviarEvento("email_click", { link_location: location });
  enviarEventoMeta("Contact", { link_location: location, channel: "email" });
}
