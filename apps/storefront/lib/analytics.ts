// Emisor centralizado de eventos GA4 (Enhanced Ecommerce) al dataLayer.
// Un solo sitio garantiza que el schema (nombres de campos, moneda, forma
// del item) sea idéntico en todos los disparos — GA4 desecha eventos con
// forma incorrecta y esos silencios son difíciles de depurar en Analytics.
//
// Naming de eventos y campos: los reservados por GA4 (view_item, add_to_cart,
// begin_checkout, purchase, items, currency, value, transaction_id, etc.)
// se dejan tal cual porque los tags de GA4 ya los mapean. Los eventos custom
// (whatsapp_click, faq_open, ...) van en snake_case como espera GA4.

import { enviarEvento } from "@/components/Analitica";
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
  enviarEvento("view_item", {
    currency: CURRENCY,
    value: p.precioCop,
    items: [
      {
        item_id: `${p.slug}|${p.colorId}|${p.tamanoId}`,
        item_name: `Bolso ${p.nombre}`,
        item_variant: `${p.colorNombre} · ${p.tamanoNombre}`,
        item_category: "Bolsos",
        price: p.precioCop,
        quantity: 1,
      },
    ],
  });
}

// === Carrito ===

export function trackAddToCart(l: Omit<LineaCarrito, "key" | "cantidad">, cantidad = 1): void {
  const item = itemDeLinea({ ...l, key: "", cantidad });
  enviarEvento("add_to_cart", {
    currency: CURRENCY,
    value: item.price * item.quantity,
    items: [item],
  });
}

export function trackRemoveFromCart(l: LineaCarrito): void {
  const item = itemDeLinea(l);
  enviarEvento("remove_from_cart", {
    currency: CURRENCY,
    value: item.price * item.quantity,
    items: [item],
  });
}

export function trackViewCart(lineas: LineaCarrito[], subtotal: number): void {
  enviarEvento("view_cart", {
    currency: CURRENCY,
    value: subtotal,
    items: lineas.map(itemDeLinea),
  });
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
}

// === Checkout y compra ===

export function trackBeginCheckout(
  lineas: LineaCarrito[],
  value: number,
  cupon?: string,
): void {
  enviarEvento("begin_checkout", {
    currency: CURRENCY,
    value,
    ...(cupon ? { coupon: cupon } : {}),
    items: lineas.map(itemDeLinea),
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
}

// === Engagement ===

export function trackWhatsAppClick(location: string): void {
  enviarEvento("whatsapp_click", { link_location: location });
}

export function trackInstagramClick(location: string): void {
  enviarEvento("instagram_click", { link_location: location });
}

export function trackFaqOpen(id: string, pregunta: string): void {
  enviarEvento("faq_open", { faq_id: id, faq_question: pregunta });
}
