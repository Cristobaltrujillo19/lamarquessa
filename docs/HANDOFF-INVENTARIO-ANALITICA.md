# Inventario de analítica — contrato para el porting de la nueva interfaz

Fecha del inventario: 2026-08-16 · Rama viva: `feat/nueva-interfaz`

Este documento existe por una regla dura del handoff del mockup: la analítica
no se "migra", se **inventaría, se transporta literal y se verifica en paridad**.
Es el contrato de lo que hay que preservar durante el porting.

La ventaja de esta implementación es que **cero eventos dependen de selectores
del DOM**. Todo el tracking es JavaScript vía helpers en `lib/analytics.ts`.
Eso invierte el criterio de fragilidad clásico del handoff: aquí lo que hay que
preservar no es un `id` o `data-*` en un botón, es que **el nuevo componente
siga llamando al helper `track*` en el punto correcto del funnel**.

---

## 1. Cargadores en el `<head>`

Los tres proveedores se cargan desde `components/Analitica.tsx` (client component
montado en `app/layout.tsx`). Cada uno se activa solo si su env var está definida.

| Proveedor | ID | Env var | Estrategia | Presente en HTML |
|---|---|---|---|---|
| Google Tag Manager | `GTM-56LQL4LL` | `NEXT_PUBLIC_GTM_ID` | Next.js `<Script strategy="afterInteractive">` + `<noscript>` iframe | Sí |
| GA4 gtag.js | `G-Q5PW0TY6SX` | `NEXT_PUBLIC_GA4_ID` | Snippet oficial de Google. `gtag('config', ID, { send_page_view: false })` para controlar page_view manualmente en SPA | Sí |
| Meta Pixel | `1046242051600058` | `NEXT_PUBLIC_META_PIXEL_ID` | Snippet oficial de Meta. Inicial `fbq('track','PageView')` en el snippet + PageView en cada route change salteando el primero | Sí + `<noscript>` img |

**No hay** TikTok Pixel, Pinterest Tag, LinkedIn Insight, ni ningún otro. **No
hay Conversions API server-side de Meta** — pero el `Purchase` ya manda
`eventID = transactionId` por si algún día se activa (deduplicación gratis).

**Consentimiento**: no existe banner ni Consent Mode. Bloqueador conocido en
`ESTADO.md`. Al portar la interfaz esto no cambia.

**Exclusión**: `<Analitica>` retorna `null` si `pathname.startsWith('/panel')`.
El panel de operaciones no ensucia las métricas de la tienda.

---

## 2. Page views (SPA route change)

Next 16 App Router + navegación cliente-side no dispara automáticamente los
page_view de GA4 ni de Meta Pixel para navegaciones internas. Los cablé
manualmente:

### GA4 — `Ga4PageViews` (en `components/Analitica.tsx`)

`useEffect` que depende **solo del `pathname`**, nunca de los searchParams:

```js
gtag('event', 'page_view', {
  page_path: pathname,
  page_location: window.location.href,   // aquí sí viaja la URL completa
  page_title: document.title,
  send_to: id,  // GA4 ID
});
```

⚠️ **No añadir `searchParams` a las dependencias.** El configurador de la ficha
escribe el color elegido en `?color=` con `history.replaceState`, y con los
searchParams como dependencia cada color tanteado mandaba un `page_view` falso.
Ver el apartado 12 para la medición. En este sitio ninguna query string
significa "otra página".

### Meta — `MetaPixelPageViews` (en `components/Analitica.tsx`)

`useRef` para saltar el primer render (el snippet ya disparó PageView en init).
Depende **solo del `pathname`**, por la misma razón que GA4 — en Meta un
PageView de más es peor que un número inflado: distorsiona las audiencias
construidas sobre frecuencia de visita.

```js
fbq('track', 'PageView');
```

Se añade además `whatsapp_click` con `link_location: "contacto"` desde el CTA
de `/contacto`. Es aditivo: mismo evento, un valor más en el parámetro.

---

## 3. Helper central de eventos — `lib/analytics.ts`

### `enviarEvento(nombre, datos)` — GTM + GA4

```js
window.dataLayer.push({ event: nombre, ...datos });  // GTM
window.gtag('event', nombre, datos);                  // GA4 directo
```

Si `gtag` no está definido todavía (afterInteractive aún no cargó), define un
shim que hace `dataLayer.push(arguments)`. gtag.js consume la cola al iniciar.

### `enviarEventoMeta(nombre, datos, tipo = 'track')` — Meta Pixel

```js
window.fbq(tipo, nombre, datos);
```

Donde `tipo` es `'track'` (evento estándar) o `'trackCustom'` (evento custom).
No-op si `fbq` no existe.

### Regla clave

**Cada helper `trackX` de `lib/analytics.ts` dispara GA4 + Meta simultáneamente**
con nombres nativos de cada plataforma y schemas propios. Un solo callsite,
dos destinos.

---

## 4. Catálogo completo de eventos de comercio y engagement

Todos los helpers viven en `lib/analytics.ts`. La columna "callsite" indica
el archivo/componente exacto que invoca cada helper. **Es lo que hay que
preservar durante el porting.**

### E-commerce (funnel de compra)

| Momento | Helper | GA4 | Meta | Callsite actual |
|---|---|---|---|---|
| Cargar `/tienda` | `trackViewItemList(productos, listName)` | `view_item_list` | `ViewList` (custom) | `app/tienda/ViewItemListTracker.tsx` en mount |
| Click en tarjeta de producto | `trackSelectItem(producto, listName)` | `select_item` | `SelectItem` (custom) | `components/v2/TarjetaProducto.tsx` onClick del Link |
| Cargar `/producto/[slug]` | `trackViewItem(producto)` | `view_item` | `ViewContent` (estándar) | `app/producto/[slug]/ViewItemTracker.tsx` en mount, ref-guarded por slug |
| Cambiar color o tamaño en la ficha | `trackCustomizeProduct(producto)` | `customize_product` (GA4 no reserva este nombre, pasa como custom) | `CustomizeProduct` (estándar) | `app/producto/[slug]/ConfiguradorPieza.tsx` → `SelectorColor.tsx`, solo si cambia de la actual |
| Activar toggle iniciales o color a disposición | `trackCustomizeProduct(producto)` | idem | idem | `ConfiguradorPieza.tsx` onChange checkbox |
| Click "Agregar al carrito" | `trackAddToCart(linea)` | `add_to_cart` | `AddToCart` (estándar) | `ConfiguradorPieza.tsx` onClick del CTA (principal y fijo móvil) |
| Abrir el drawer del carrito | `trackViewCart(lineas, subtotal)` | `view_cart` | `ViewCart` (custom) | `app/CartDrawer.tsx` useEffect ref-guarded (transición cerrado→abierto) |
| Cargar `/carrito` | `trackViewCart(lineas, subtotal)` | idem | idem | `app/carrito/page.tsx` useEffect en mount, tras hidratar localStorage |
| Click "Quitar" en el carrito | `trackRemoveFromCart(linea)` | `remove_from_cart` | `RemoveFromCart` (custom) | `CartDrawer.tsx` y `carrito/page.tsx` |
| Cargar `/checkout` con carrito lleno | `trackBeginCheckout(lineas, total, cupon?)` | `begin_checkout` | `InitiateCheckout` (estándar) | `app/checkout/page.tsx` useEffect en mount, ref-guarded (una vez por sesión de checkout) |
| Submit del checkout (antes del redirect a MP) | `trackAddPaymentInfo(lineas, total, cupon?)` **+** `guardarSnapshotCompra({items, value, shipping, currency, coupon})` | `add_payment_info` | `AddPaymentInfo` (estándar) | `checkout/page.tsx` en `alEnviar` antes del `iniciarCheckout()`. **El snapshot en sessionStorage es lo que /gracias consume para armar el purchase** |
| Llegar a `/gracias` | `trackPurchase({transactionId, snapshot})` | `purchase` | `Purchase` (estándar, con `eventID = transactionId`) | `app/gracias/PurchaseTracker.tsx` consume `sessionStorage['lm_pending_purchase']` y lo borra |

### Engagement (touchpoints de marca)

| Momento | Helper | GA4 | Meta | Callsite actual |
|---|---|---|---|---|
| Click en FAB o link WhatsApp | `trackWhatsAppClick(location)` | `whatsapp_click` (custom, con `link_location`) | `Contact` (estándar, con `channel:"whatsapp"`) | `components/marca/FabWhatsApp.tsx` y `app/Footer.tsx` |
| Click en link Instagram del footer | `trackInstagramClick(location)` | `instagram_click` (custom) | `InstagramClick` (custom) | `app/Footer.tsx` |
| Click en mailto del footer | `trackEmailClick(location)` | `email_click` (custom) | `Contact` (estándar, `channel:"email"`) | `app/Footer.tsx` |
| Abrir una pregunta del FAQ | `trackFaqOpen(id, pregunta)` | `faq_open` (custom, con `faq_id` y `faq_question`) | `FaqOpen` (custom) | `app/preguntas-frecuentes/Pregunta.tsx` onToggle, solo en apertura (no en cierre) |
| Llegar a la mitad del documento | `trackScroll(50)` | `scroll_50` (custom, con `percent_scrolled`) | `Scroll50` (custom) | `components/ScrollTracker.tsx`, montado dentro de `Analitica`. Una vez por página; el listener se quita a sí mismo al disparar |


⚠️ **`scroll_50` NO se comprueba al montar, a propósito.** En una página corta
media pantalla ya es más del 50% del documento sin que nadie haga nada, y eso
mandaría el evento en cada visita rebotada — justo lo que existe para
distinguir. Hace falta un desplazamiento real.

---

## 5. Schema exacto de item / contents

### GA4 — `items[]` (Enhanced Ecommerce)

```ts
{
  item_id: `${slug}|${colorId}|${tamanoId}`,   // por VARIANTE, no por producto base
  item_name: `Bolso ${nombre}`,
  item_variant: `${colorNombre} · ${tamanoNombre}[· Iniciales XXX · Color a disposición]`,
  item_category: "Bolsos",
  price: precioBase + addOnsPorUnidad(personalizacion),  // efectivo, lo que paga por unidad
  quantity,
}
```

**`item_id` incluye la variante entera** (color + tamaño). No mezclar dos
variantes distintas de Menorca en las estadísticas de GA4.

**`price` es efectivo** (base + add-ons de personalización). Si un cliente
elige Menorca Amanecer + iniciales MJT + color a disposición, `price` = 210k
+ 30k + 60k = 300k. Es lo que realmente pagó por esa unidad.

### Meta — `contents[]` + `content_ids[]`

```ts
{
  content_ids: [`${slug}|${colorId}|${tamanoId}`, ...],
  content_type: "product",
  contents: [
    { id: item_id, quantity, item_price: precioEfectivo },
    ...
  ],
  content_name?: `Bolso ${nombre}`,
  content_category?: "Bolsos",
  value: total_relevante,
  currency: "COP",
  num_items?: sum(quantity),
}
```

### `Purchase` — deduplicación con Conversions API futura

```ts
enviarEventoMeta("Purchase", {
  ...contentsMeta(items),
  value: snapshot.value,       // total con envío, con descuento
  currency: "COP",
  num_items: sum(quantity),
  eventID: transactionId,      // payment_id de MP; fallback preference_id
});
```

`eventID` es lo que dedupliCa si algún día se activa Meta Conversions API
server-side y llega el mismo purchase por dos vías.

---

## 6. Snapshot pre-redirect a Mercado Pago

**Problema resuelto**: cuando el cliente vuelve de MP a `/gracias`, el carrito
ya está vacío (`VaciarCarrito.tsx`). Sin datos no puede armarse el `purchase`.

**Solución**: en `checkout/page.tsx`, ANTES de `window.location.href = initPoint`,
se llama a `guardarSnapshotCompra({...})` que hace `sessionStorage.setItem` con:

```ts
{
  value: totalConDescuentoConEnvio,
  shipping: envioCop,
  currency: "COP",
  items: ItemGA4[],   // ya con precio efectivo
  coupon?: codigoCupon,
}
```

En `/gracias`, `PurchaseTracker` invoca `consumirSnapshotCompra()` que
`removeItem` inmediatamente (una sola vez, para evitar disparos dobles si el
cliente recarga la página) y lo pasa a `trackPurchase`.

`transactionId` para el `Purchase` viene de `searchParams.payment_id` (real de
MP) con fallback a `searchParams.preference_id`.

---

## 7. Dependencias con el DOM (spoiler: cero)

**Ningún evento depende de un selector CSS, `id`, `class` o `data-*` para
disparar.** No hay activadores en GTM que lean el DOM. Todos son "Custom
Event" con nombre coincidente al que empuja `enviarEvento`.

**Consecuencia para el porting**: al portar cualquier componente puedes
cambiar libremente su estructura visual, sus clases y su marcado semántico.
Lo único que hay que preservar es que **el punto del funnel siga llamando al
helper `track*`**. Un botón renombrado, envuelto en otro contenedor, con otras
clases, con Framer Motion incrustado: da igual mientras el onClick siga
llamando a `trackAddToCart`.

---

## 8. GTM — configuración actual

**El contenedor está cargado pero no tiene tags configurados hoy**. Los
eventos llegan a GA4 y Meta vía las rutas directas (gtag.js + fbq),
independientes de GTM.

GTM está allí para futuros destinos (TikTok Pixel, LinkedIn Insight, o
cualquier tercero que se sume) — se activan configurando tags DENTRO del
contenedor sin tocar el código de la tienda. El `dataLayer` ya recibe todos
los eventos con sus datos, listo para ser consumido.

⚠️ **Regla dura**: si algún día se añade un GA4 Configuration Tag dentro de
GTM, hay que **desactivar** el envío directo desde gtag.js (o los eventos
llegarían dos veces a GA4). Igual con Meta Pixel. Ver notas en
`components/Analitica.tsx`.

---

## 9. Checklist de paridad post-porting (Fase 4)

Con la extensión oficial **Meta Pixel Helper** activa y **GA4 DebugView**
abierta en `analytics.google.com`, recorrer el flujo completo en el preview de
Vercel de la rama `feat/nueva-interfaz`. Confirmar que cada evento dispara
**una vez y solo una**, con los parámetros correctos.

- [ ] Home carga → GA4 recibe `page_view` con `page_path: "/"`
- [ ] Navegar a `/tienda` → GA4 `page_view` + `view_item_list` con 4 items · Meta `PageView` + `ViewList`
- [ ] Click en una tarjeta → GA4 `select_item` con item_id correcto · Meta `SelectItem`
- [ ] Ficha carga → GA4 `view_item` (una vez, ref-guard funciona) · Meta `ViewContent` con `value` y `currency: "COP"`
- [ ] Cambiar color/tamaño → GA4 `customize_product` · Meta `CustomizeProduct`
- [ ] Activar toggle iniciales → GA4 `customize_product` · Meta `CustomizeProduct`
- [ ] Escribir iniciales + activar color a disposición → precio efectivo se refleja en `price` del próximo add_to_cart
- [ ] Add al carrito → GA4 `add_to_cart` con `value = precioEfectivo * cantidad` · Meta `AddToCart`
- [ ] Drawer se abre → GA4 `view_cart` (una vez, no dispara al cambiar cantidad) · Meta `ViewCart`
- [ ] Click Quitar → GA4 `remove_from_cart` · Meta `RemoveFromCart`
- [ ] Navegar a `/carrito` con lineas → GA4 `view_cart` en mount · Meta `ViewCart`
- [ ] Navegar a `/checkout` con carrito lleno → GA4 `begin_checkout` en mount · Meta `InitiateCheckout` (con `value` y `num_items`)
- [ ] Submit del checkout → GA4 `add_payment_info` + `sessionStorage['lm_pending_purchase']` presente · Meta `AddPaymentInfo`
- [ ] Redirect a MP → volver a `/gracias?payment_id=X&status=approved` → GA4 `purchase` con `transaction_id`, `value`, `currency`, `items` · Meta `Purchase` con `eventID`, `contents`, `value`
- [ ] `sessionStorage['lm_pending_purchase']` está vacío (consumido)
- [ ] Recargar `/gracias` NO dispara segundo `purchase`
- [ ] Click WhatsApp → GA4 `whatsapp_click` · Meta `Contact` con `channel:"whatsapp"`
- [ ] Click Instagram → GA4 `instagram_click` · Meta `InstagramClick`
- [ ] Click email → GA4 `email_click` · Meta `Contact` con `channel:"email"`
- [ ] Abrir pregunta del FAQ → GA4 `faq_open` con `faq_id` · Meta `FaqOpen`
- [ ] Todos los `page_view` de GA4 se disparan una vez por route change (no duplicados en SPA nav)
- [ ] Todos los Meta `PageView` idem
- [ ] Navegar a `/panel` → GA4 NO recibe `page_view` (exclusión funciona)

---

## 10. Qué NO se puede tocar durante el porting

Además de lo listado arriba, respetar:

- Los IDs `GTM-56LQL4LL`, `G-Q5PW0TY6SX`, `1046242051600058`. Vienen de env
  vars; el porting no las cambia.
- El orden de carga de los scripts en `<Analitica>`. Meta Pixel arriba, GTM,
  GA4. No reordenar.
- El nombre exacto de los eventos custom (`whatsapp_click`, `instagram_click`,
  `email_click`, `faq_open`, `customize_product`, `ViewList`, `SelectItem`,
  `ViewCart`, `RemoveFromCart`, `InstagramClick`, `FaqOpen`, `RemoveFromCart`).
  Si un día se configura un tag en GTM que los consuma, romper el nombre lo
  desactiva silenciosamente.
- El schema del `item_id` (`slug|colorId|tamanoId`). Cambiarlo rompe los
  reportes históricos de GA4.
- La regla `Analitica` retorna `null` en `/panel`.

---

## 11. Referencias en el código

Archivos clave a revisar al portar cada punto del funnel:

- `components/Analitica.tsx` — cargadores + page views + enviarEvento
- `lib/analytics.ts` — todos los helpers `track*`
- `app/producto/[slug]/ViewItemTracker.tsx`
- `app/producto/[slug]/ComprarPanel.tsx` (view_item ref, customize, add_to_cart)
- `app/CartDrawer.tsx` (view_cart, remove_from_cart)
- `app/carrito/page.tsx` (view_cart)
- `app/checkout/page.tsx` (begin_checkout en mount, add_payment_info + snapshot en submit)
- `app/gracias/PurchaseTracker.tsx` (purchase consumiendo snapshot)
- `components/marca/FabWhatsApp.tsx`, `app/Footer.tsx` (WhatsApp / Instagram / email)
- `app/preguntas-frecuentes/Pregunta.tsx` (faq_open)
- `components/ProductCard.tsx` (select_item)
- `app/tienda/ViewItemListTracker.tsx` (view_item_list)

---

## 12. Fase 4 — verificación de paridad (2026-08-25)

Recorrido completo del embudo en la rama `feat/nueva-interfaz`, con `gtag` y
`fbq` instrumentados para capturar cada llamada.

### Embudo, de una pasada

Home → colección → ficha → cambiar color → añadir al carrito:

```
ga4:view_item_list      meta:ViewList
ga4:page_view           meta:PageView
ga4:select_item         meta:SelectItem
ga4:view_item           meta:ViewContent
ga4:page_view           meta:PageView
ga4:customize_product   meta:CustomizeProduct
ga4:add_to_cart         meta:AddToCart
ga4:view_cart           meta:ViewCart
```

Ocho pares. Ninguno perdido, ninguno duplicado.

### Checkout

`begin_checkout` dispara una sola vez al montar. El submit dispara
`add_payment_info` + `AddPaymentInfo`.

`purchase` verificado inyectando el snapshot y volviendo a `/gracias`:
`transaction_id`, `value` 316500, `currency` COP, `shipping` 16500, 1 item.
El snapshot se consume (`sessionStorage` queda limpio) y el carrito se vacía.

### Parámetros con personalización

`add_to_cart` con iniciales y color a disposición activos:

```
value        300000          ← efectivo, no la base de 210000
item_id      menorca|amanecer|unica
item_variant Amanecer · Talla única · Iniciales MJT · Color a disposición
```

### Un fallo encontrado y corregido durante el porte

El configurador de la ficha escribe el color elegido en `?color=` con
`history.replaceState`. `Ga4PageViews` y `MetaPixelPageViews` llevaban
`searchParams` en sus dependencias, así que **cada color tanteado mandaba un
`page_view` y un `PageView` falsos**.

No daba ningún error: la página se veía perfecta y los datos se ensuciaban.
Habría inflado el conteo de páginas vistas, arruinado la tasa de rebote y el
tiempo por página, y en Meta distorsionado las audiencias construidas sobre
frecuencia de visita.

Corregido: ambos efectos dependen solo del `pathname`. En este sitio ninguna
query string significa "otra página" — son estado de interfaz (`?color=`) o
retorno de la pasarela (`?payment_id=`), y ese último llega junto a un cambio
de ruta. La URL completa sigue viajando en `page_location`.

Verificado después: tres cambios de color dan **cero** page_views espurios y
tres `customize_product`; navegar a otra ruta sigue dando el suyo.

### Lo que no se pudo verificar aquí

- **Volumen comparado contra baseline.** No hay baseline: los eventos llevaban
  ~48 h activos al empezar y no había señal suficiente. La verificación fue
  evento por evento en tiempo real, no de magnitud.
- **Un pago real de principio a fin.** El Convex de desarrollo no tiene
  `MP_ACCESS_TOKEN` —solo `ADMIN_API_SECRET`—, así que `createCheckout` falla
  por diseño y muestra el mensaje genérico. Eso confirma que el camino de
  error funciona, pero el `purchase` de una compra verdadera queda pendiente
  de la prueba con cupón en producción.
- **La cortina de entrada en vídeo.** Dura 2.2 s y el ida y vuelta del
  instrumento tarda más. Queda verificada por inferencia: su bandera de
  `sessionStorage` solo se escribe dentro de su primer `setTimeout`, así que
  encontrarla puesta prueba que montó y corrió.

### Nota sobre el instrumento

Cuatro veces durante este trabajo el instrumento mintió antes que el código:

1. `scrollWidth` reportó 64 px de desborde en `/nosotros`. Ningún elemento
   excedía el viewport y ocultar secciones no cambiaba el número.
   `window.scrollTo(300,0)` dejó `scrollX` en 0: **la página no se desplaza**.
   Artefacto del viewport emulado (`innerWidth` 1280 / `clientWidth` 1265 /
   `outerWidth` 0 es un trío incoherente).
2. Dos conductas de foco del menú móvil "fallaron" midiendo a 1280 px, donde
   el panel es `display:none` por diseño — y un enlace sin display no puede
   recibir foco. A 375 px pasan las seis.
3. `Purchase` de Meta pareció no dispararse; la cola de `fbq` ya estaba
   drenada cuando la miré.
4. La cortina "no aparecía" porque el muestreo empezaba después de su ciclo.

**En este panel, comprueba siempre que el instrumento observa lo que crees.**
