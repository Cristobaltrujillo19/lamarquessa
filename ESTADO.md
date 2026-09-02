# ESTADO — La Marquessa · Handoff para la próxima sesión

Última actualización: **2 de septiembre de 2026**
Rama: **`main`**, sirviendo producción en https://lamarquessa.co
El porting de la interfaz nueva terminó y está desplegado. No hay ramas
pendientes de fusionar.

> ⚠️ **Antes de tocar nada, lee `docs/HANDOFF-INVENTARIO-ANALITICA.md`.** Es el
> contrato de los 17 eventos de analítica que no se pueden romper, y trae la
> verificación de paridad del porting.

---

## 0. La lista — todo lo que está abierto, numerado

Esta es la lista maestra: se ataca de a un número por vez. Los §6 y §7
conservan el detalle y el porqué de cada cosa; aquí está el orden y el estado.

**Recomendación de orden:** el **#18** primero, que es el único con plata real
y una persona esperando. Después el **#17**, porque cada día sin GA4 publicado
es un día de datos que no se recupera. De lo que puede hacer el asistente,
**#6 + #7** juntos: medir Core Web Vitals y Lighthouse es una sola pasada, y
hasta no medir no se sabe si el #2 (`srcset`) vale la pena o es trabajo en
vano.

### ✅ Cerrados en esta sesión

- **Pantalla de carritos abandonados en `/panel`** (2 sept). Query
  `admin:listarCarritos` + `app/panel/(app)/carritos/page.tsx`. Desplegada a
  Convex prod y a Vercel; la ruta responde 307 al login, que es lo correcto.
  **Falta verla con datos reales**: los carritos de prueba están en dev, y en
  prod la tabla puede estar vacía.
- **Los 9 PNG de rayos X** (2 sept). Los 8 originales se movieron a
  `_backup-fotos-rayos-x-2026-09-02/` en la raíz, ignorada por
  `.gitignore:22`. El duplicado `rallos-x-menorca-base.png` se borró: era byte
  por byte idéntico a `rayos-x-menorca-base.png`, verificado por SHA-256. El
  código nunca apuntó a los PNG, solo a los `.jpg`.

### Bloque A — no depende de nadie

| # | Pendiente | Nota |
|---|---|---|
| ~~1~~ | ~~Los 9 PNG sin trackear~~ | ✅ Cerrado arriba |
| **2** | `srcset` responsive (400/800/1200/1600) | Fase 4. **Medido y confirmado (§15): 882 KB desperdiciados.** En la ficha el LCP es un AVIF de 1600x2000 servido tal cual a un movil |
| **3** | Navegación por teclado con foco visible | Fase 5. **Los dos fallos medidos ya están corregidos**: home y ficha marcan accesibilidad **100, cero fallos** (§15). Queda lo que Lighthouse NO mide: recorrer el sitio con el tabulador y comprobar que el anillo de foco se vea en todos los controles |
| **4** | Probar en 320 / 390 / 768 / 1440 px | Fase 5 |
| **5** | Validar JSON-LD con Rich Results Test | Fase 6 |
| ~~6~~ | ~~Medir Core Web Vitals~~ | ✅ Cerrado, línea base en §15. Falta el dato de CAMPO, que depende del #17 |
| ~~7~~ | ~~Lighthouse móvil~~ | ✅ Cerrado, §15. **SEO 100 y A11y 96 cumplen; Rendimiento 59-62 NO** |
| **8** | Banner de consentimiento de cookies (Consent Mode) | Es lo que sube Buenas prácticas de 79: los dos fallos son cookies de tercero (§15) |
| **9** | `CAMBIOS.md` | |

### Bloque B — hace falta una decisión antes de empezar

| # | Pendiente | Qué falta decidir |
|---|---|---|
| **10** | Escasez honesta: numeración de pieza | ¿Desde qué número arranca el contador? |
| **11** | Vista previa de las iniciales (punto 7 del dueño) | ¿El grabado va en relieve o hundido? ¿Hay foto de una pieza ya grabada? |
| **12** | Los 5 eventos de analítica que faltan | Depende del #17: sin GA4 publicado en GTM no hay dónde medirlos |
| **13** | Fondos horneados de los rayos X | Vienen distintos por pieza (`#EEEAE2`, `#EADCD5`, `#FCFBF7`) sobre un sitio `#EAE8DF`. Hay que **re-renderizar con transparencia**: recolorear por fuera no sirve, porque en los translúcidos el fondo se ve A TRAVÉS del bolso. Las fuentes están en `_backup-fotos-rayos-x-2026-09-02/` |

### Bloque C — bloqueado esperando material del dueño

| # | Pendiente |
|---|---|
| **14** | Mockups de colores con el fondo de la palmerita (punto 3) — esperando fotos |
| **15** | Prueba social: firma de la diseñadora, foto del taller, contenido de clientes |
| **16** | Foto macro de la textura 3D — el diferenciador que hoy no se ve |

### Bloque D — solo los cierra el dueño, y son los que frenan la venta

| # | Pendiente | Consecuencia si sigue abierto |
|---|---|---|
| 🔴 **17** | Publicar la etiqueta GA4 dentro de GTM | **GTM carga pero no mide nada.** Todo el trabajo de analítica está inerte |
| 🔴 **18** | Los dos pedidos `pendiente` en Mercado Pago | Puede haber una venta cobrada y sin registrar, con una clienta esperando. Ver detalle abajo |
| 🔴 **19** | Prueba real con cupón | Lo único que cierra la incógnita del webhook. Nunca se ha visto un pago completo de punta a punta |
| 🔴 **20** | Rotar `ADMIN_API_SECRET` | Quedó impreso en un error de terminal. El local ya ni coincide con prod |
| **21** | Razón social, NIT, domicilio | `/privacidad` dice `[pendiente]`, y toda la autorización de datos de los carritos (§13) se apoya en un documento que aún no identifica al responsable del tratamiento |
| **22** | Search Console: propiedad + sitemap | Google descubre el dominio nuevo más lento |
| **23** | Link de la bio de Instagram | Sigue apuntando a la URL vieja de Vercel |
| **24** | Abogado: política de cambios/retracto | La FAQ excluye retracto en piezas personalizadas; la Ley 1480 es restrictiva con esas exclusiones |

### Detalle del #18 (el urgente)

| | |
|---|---|
| María José Tamayo Londoño | `mariajtamayo26@gmail.com` · `573128485429` |
| | Mallorca Amanecer · **$271.500** · 1 sept 15:31 |
| Cristóbal Trujillo (prueba del dueño) | Menorca Amanecer · $226.500 · 15:32 |

Los dos sin `mpPaymentId` ni `pagadoEn`. Se creó la preferencia en Mercado
Pago pero **la base nunca recibió confirmación de pago**, y desde el código no
se distingue entre "no pagó" y "pagó y el webhook no lo registró".

**Hay que mirar el panel de Mercado Pago** buscando un pago de $271.500 del 1
de septiembre. Si aparece, el webhook está roto y hay una clienta esperando.

---

## 1. Qué es este proyecto

**La Marquessa** (dos eses — grafía oficial) es una marca colombiana de **bolsos de autor impresos en 3D y terminados a mano**. Cada pieza se fabrica una por una, así que no hay dos iguales.

- **Objetivo del sitio: VENDER.** El checkout con Mercado Pago está en vivo.
- Mercado: Colombia principalmente (tarifa plana COP 16.500, 2 días hábiles). Envíos internacionales por cotización vía WhatsApp.
- Idioma: es-CO · Moneda: COP
- Fabricación **a pedido, 2 semanas** de producción + 2 días de transportadora.

### Universo de marca

Mar, olas, Caribe. Titular del hero **en inglés** (decisión de marca): *"Colombian statement pieces inspired by the sea."* Tagline: *"Un sueño tejido por las olas"*.

### Catálogo real (4 bolsos)

| Bolso | Precio COP | Alto × Ancho × Prof | Peso | Notas |
|---|---|---|---|---|
| **Menorca** | 210.000 | 20 × 19,2 × 8,7 cm | 290 g | Textura de espuma. **En Menorca NO cabe un celular** — dato importante que la FAQ dice explícito |
| **Mallorca** | 255.000 | 23,7 × 22,8 × 10,4 cm | 350 g | Talla grande de Menorca |
| **Kruta** | 230.000 | 20,5 × 12,8 × 12,8 cm | 190 g | Vertical, lisa, un pliegue |
| **Montt** | 195.000 | 17,5 × 18,2 × 12,3 cm | 290 g | Ancha y baja, pliegue diagonal |

**Acabados (5)**, con los hex del sistema de diseño aprobado: Amanecer `#D9C7A8` · Manglar `#4B3122` · **Horizonte** (bicolor rojo `#8F2B23` + negro `#171310`, se pinta partido en diagonal con `muestraColor()`) · Caribe `#2C8CA8` · Marea `#1E2C4A`.

⚠️ Son aproximaciones a una descripción verbal: nadie ha medido una pieza física con luz neutra. **Manglar y Marea no tienen ni una sola foto.**

**Material:** PLA de proveedor colombiano. **El proveedor NO se menciona en la web.**

### Personalización

Dos formas, ya **self-service con precio fijo** en la ficha: iniciales grabadas (+$30.000, hasta 3 letras, dos fuentes) y color a disposición (+$60.000, texto libre que se confirma por WhatsApp antes de fabricar). Combinables. Las piezas personalizadas no aceptan cambio ni retracto.

---

## 2. Cómo correr el proyecto

Monorepo pnpm + Turborepo en `C:\Users\crist\Documents\random proyects\La Marquesa\lamarquesa`.
**Usar PowerShell** (no Bash) para node/pnpm/npx/convex.

```
pnpm -C apps/storefront dev        # http://localhost:3000
npx convex dev --once              # desde apps/storefront, para propagar cambios de backend a dev
npx convex deploy -y               # desde apps/storefront, para desplegar a PRODUCCIÓN (ver §5)
```

**Ya no existe `apps/landing`** — todo vive en `apps/storefront` (Next 16 + React 19 + Tailwind 4 + Convex).

### Datos clave

- **Producción:** https://lamarquessa.co (dominio propio, apex canónico)
- **Subdominio Vercel viejo:** `lamarquessa-landing-gtpv-three.vercel.app` → 301 al apex por middleware
- **Repo:** https://github.com/Cristobaltrujillo19/lamarquessa (privado)
- **Panel:** `/panel` → usuario `admin`, contraseña `PANEL_PASSWORD` (local: `marquessa2026`)
- **Convex dev:** `dev:agreeable-buzzard-367` · **Convex prod:** `hearty-lemur-822`
- **Registrador del dominio:** Namecheap (A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`)
- **Instagram:** https://www.instagram.com/lamarquessa.co/
- **Correo:** `info.lamarquessa@gmail.com` (con Gmail SMTP configurado para transaccionales)
- **WhatsApp:** `573332779109` (mostrado como `333 277 9109`)

---

## 3. Qué está HECHO (verificado en vivo)

### ✅ Fase 0 — Auditoría
`AUDITORIA.md`. Incluye inventario SEO previo, contraste medido, 8 decisiones tomadas.

### ✅ Fase 1 — Cimientos técnicos
- **Unificación**: landing (Astro) migrado a Next; `apps/landing` eliminado.
- **Catálogo real** de 4 bolsos en Convex.
- **16 imágenes propias** (2 de estudio + 2 de contexto por bolso) en AVIF + JPEG.
- **SEO**: metadata por página, canonical absoluto, Open Graph completo + `og.jpg`, un `<h1>` por página, `sitemap.xml` (9 URLs), `robots.txt` (no bloquea IA).
- **JSON-LD**: `Organization`, `WebSite`, `BreadcrumbList`, `Product` (precio real, `InStock`, `handlingTime` 14 días, `transitTime` 2 días, `shippingRate` 16.500), `FAQPage`.
- **Accesibilidad**: cobre-texto derivado `#805337` (5.41:1 sobre crema, cumple AA).
- **Hero**: carrete de fotos de producto, ajustado para no cortar los bolsos verticales.

### ✅ Fase 2 — Contenido
- **FAQ** `/preguntas-frecuentes`: 15 preguntas en tono formal (usted), schema `FAQPage`, con datos reales (pesos, plazos, política de cambios). Corregida específicamente para decir que Menorca NO admite celular.
- **`/nosotros`**: Concepto + Manifiesto (con velero "Life comes in waves") + ComoSeHace + Elementos + CierreCta.
- **`/privacidad`**: política Ley 1581 con secciones legales completas.
- Copy en inglés y en plural en franja de beneficios (`UNIQUE PIECES / 3D PRINTED / MADE IN COLOMBIA / WORLDWIDE SHIPPING`).

### ✅ Fase 3 — Conversión (parcial)
- **Checkout Mercado Pago** funcionando (`convex/orders.ts` + `convex/http.ts`).
- **WhatsApp obligatorio** en el checkout (frontend + servidor).
- **Asteriscos** en los seis campos obligatorios.
- **Aviso de compra internacional** encima del formulario.
- **CTA fijo en móvil** en la ficha de producto: aparece cuando el CTA principal ya salió por arriba.
- **Menú móvil** con hamburguesa 44×44 (Colección, Nuestra historia, FAQ).
- **Círculos de color** con tap area 44×44 sin cambio visual.
- Correo de confirmación por Gmail SMTP funcionando.

### ✅ Fase 5 — Accesibilidad móvil (parcial)
- Sin scroll horizontal en ninguna página, verificado.
- Contraste AA/AAA verificado (H1 8.99:1, párrafos 5.37:1, botones 6.13:1).
- Tap targets ≥44×44 en selectores y hamburguesa.
- Inputs con `font-size: 16px` (evita el zoom automático de iOS Safari).
- Títulos partidos con espacio literal antes del `<br />` (para lectores de pantalla y crawlers).

### ✅ Configuración
- **Vars en Convex prod**: `ADMIN_API_SECRET`, `MP_ACCESS_TOKEN`, `SITE_URL`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`. Todas puestas y verificadas.
- **Analítica**: GTM `GTM-56LQL4LL` + GA4 `G-Q5PW0TY6SX` (gtag.js directo) + Meta Pixel `1046242051600058`. 17 eventos cableados — ver `docs/HANDOFF-INVENTARIO-ANALITICA.md`.
- **Cuenta MP**: `id=515941663`, nombre visible **"Amor y Brillitos"** (paraguas para SER + La Marquessa).

---

## 4. Los tres hallazgos estratégicos (no perderlos)

1. **"Bolsos artesanales Colombia" es una trampa.** Significa wayuu/mola/cuero, la SERP la copan MercadoLibre y grandes retailers. Un bolso impreso en 3D no encaja. **Descartado.**
2. **"Bolso impreso en 3D" está vacío en Colombia.** Solo hay marcas internacionales. **Es el eje de la estrategia.** El hero en inglés no ayuda a este SEO — está en tensión con la estrategia.
3. **El producto coincide con la tendencia 2026**: mini bolsos, formas esculturales, media luna, siluetas estructuradas. Ahí está el volumen.

⚠️ **Riesgo de marca:** existen negocios con nombre casi idéntico. Uno colombiano y del mismo rubro (*La Marqueza Equestrian*). Táctica: anclar siempre "La Marquessa" a *"bolsos impresos en 3D"*.

---

## 5. ⚠️ REGLA CRÍTICA: Convex prod se despliega A MANO

**El build de Vercel NO corre `convex deploy`.** Cambios en `apps/storefront/convex/**` requieren dos pasos:

1. `cd apps/storefront; npx convex deploy -y` (despliega funciones + schema a `hearty-lemur-822`)
2. `git push origin main` (despliega frontend a Vercel)

**En este orden.** Si se hace al revés, el frontend intentaría llamar funciones que aún no existen en producción, o guardar en un schema viejo.

Para verificar qué hay desplegado: `npx convex function-spec --prod | Select-String "nombre_funcion"`.

Para pasar JSON a `npx convex run` desde PowerShell: **comillas dobles por fuera y simples por dentro** — `"{secret:'$s'}"`. Al revés falla el parseo.

**Mensajes de commit con comillas dobles adentro: usar `git commit -F archivo`.**
PowerShell 5.1 destroza el paso de argumentos a un ejecutable nativo cuando el
argumento lleva comillas dobles, aunque venga de un here-string `@'...'@`. Git
recibe cada palabra como un pathspec distinto y el commit no se hace — pero el
`git push` que va detrás dice "Everything up-to-date" y parece que todo salió
bien. Ya pasó el 2 de septiembre.

---

## 6. 🔴 Bloqueado esperando al usuario (bloqueadores para vender)

| Qué falta | Consecuencia |
|---|---|
| **Rotar `ADMIN_API_SECRET`** (Convex prod + Vercel + `.env.local`) | Quedó impreso en un error de terminal hace días. Además el local ya no coincide con el de prod (se usó el de prod directo el 2026-08-10 para correr una mutación) |
| **Prueba real con cupón** para cerrar la incógnita del webhook | Es lo único que no puedo verificar sin plata real |
| **Etiqueta GA4 dentro de GTM** (publicar en tagmanager.google.com) | GTM carga pero **no mide nada** |
| **Razón social, NIT, domicilio, teléfono** | La política de privacidad tiene `[pendiente]` |
| **Google Search Console**: agregar propiedad `https://lamarquessa.co` y enviar `sitemap.xml` | Sin esto, Google no descubre el sitio en el dominio nuevo con la misma velocidad |
| **Cambiar el link de la bio de Instagram** al dominio nuevo | Sigue apuntando a la URL de Vercel |
| **Revisión de abogado** sobre la política de cambios/retracto | La FAQ afirma que las piezas personalizadas no admiten retracto, pero Ley 1480 es restrictiva sobre estas exclusiones |

---

## 7. Qué FALTA — por fases

### 🔄 Fase 3 — Conversión (~65%)
- [ ] **Escasez honesta** — numeración de pieza (*"la pieza #24"*). **Decisión pendiente**: ¿desde qué número empieza el contador?
- [ ] **Prueba social**: firma de la diseñadora, foto del taller, contenido real de clientes. **Bloqueada por material**.
- [ ] Eventos de analítica: `view_product`, `whatsapp_click`, `instagram_click`, `faq_open`, `scroll_50` (cuando GA4 esté cableado)
- [ ] Banner de consentimiento de cookies (Consent Mode)
- [ ] Foto macro de la textura 3D (el diferenciador que hoy no se ve)

### ⚠️ Fase 4 — Rendimiento (~40%)
- [ ] `srcset` responsive (400/800/1200/1600)
- [ ] **Medir Core Web Vitals** (nunca se han medido — pero fuentes ya autohospedadas y preload de Queen Serif hecho)

### ⚠️ Fase 5 — Accesibilidad (~70%)
- [ ] Navegación completa por teclado con foco visible
- [ ] Probar en 320 / 390 / 768 / 1440 px

### ❌ Fase 6 — Verificación (0%)
- [ ] Lighthouse móvil (objetivo ≥95 SEO y Accesibilidad, ≥90 Rendimiento)
- [ ] Validar JSON-LD con Rich Results Test
- [ ] `CAMBIOS.md`

---

## 8. Reglas de trabajo acordadas

- **No inventar datos.** Precios, plazos, medidas, reseñas: si no está dado, marcar `[PENDIENTE: dato]` y preguntar.
- **Nunca generar `AggregateRating` ni `Review` falsos.**
- **Commits atómicos**, uno por tema, en español.
- **No borrar nada sin listarlo antes.**
- Al terminar cada fase: resumen breve y **esperar** antes de seguir.
- Verificar de verdad (build, curl del HTML servido, navegador) en vez de asumir.
- **PowerShell** para node/pnpm/convex.
- **Convex prod ANTES del push** cuando toque backend.
- Al cancelar pedidos con script: **usar id exacto**, no "el más reciente" (colisiona con actividad en paralelo).

---

## 9. Gotchas técnicos

### Añadidos el 2 de septiembre — CSS y verificación

- **`.scope :root` NUNCA casa.** `:root` es `<html>` y no puede ser
  descendiente. Una media query escrita así dejó todo el sitio sirviendo
  paddings de escritorio en móvil sin que nadie lo viera.
- **`1fr` es `minmax(auto, 1fr)`**: una columna no baja del ancho de su
  contenido. Para centrar de verdad, `minmax(0, 1fr)`.
- **`object-fit` con `<Foto>` es INERTE** si no se dimensiona la `<img>`.
  `<Foto>` emite `<picture><img width height>` y sin reglas la imagen se pinta
  a su proporción natural y desborda; entonces recorta el `overflow: hidden`
  del marco, siempre por abajo. Toda `<Foto>` dentro de un marco con
  proporción necesita `position:absolute; inset:0; width:100%; height:100%`.
- **Un comentario XML no admite `--` dentro.** Nombrar tokens en un comentario
  de un SVG lo invalida: se sirve con 200 y ningún navegador lo pinta.
- **El favicon necesita `app/icon.png`.** Un `public/favicon.svg` sin `<link>`
  no lo pide nadie.
- **Verificar la SALIDA, no la propiedad.** `object-position` estuvo aplicado
  varios despliegues sin hacer nada. Calcular qué franja de la foto se ve, no
  leer `getComputedStyle`.
- **Instrumentos que ya han mentido:** pestaña en segundo plano
  (`innerWidth === 0`), panel sin componer (`visibilityState === "hidden"`,
  el `lazy` no dispara), caché del CDN (anticache distinto POR PETICIÓN),
  `grep -c` cuenta líneas y el HTML viene minificado, React escucha `focusout`
  y no `blur`, y envolver `fbq` sin copiar sus propiedades lanza un error que
  parece del sitio.

- **Next 16**: `params` es `Promise` (hay que `await`).
- **Tailwind 4**: `@theme` en CSS, no `tailwind.config`. Para valores arbitrarios con variables CSS: `top-[var(--x)]`, no `top-[--x]`.
- **Convex**: cambios de funciones requieren `npx convex dev` (dev) o `npx convex deploy` (prod). Vars de entorno NO se copian entre dev y prod.
- **turbo.json**: las variables de entorno deben declararse en `build.env` o Vercel avisa que no llegan.
- **gh CLI**: `C:\Users\crist\AppData\Local\Programs\gh\bin\gh.exe` (no está en el PATH).
- **Gmail SMTP**: `GMAIL_USER` + `GMAIL_APP_PASSWORD` (contraseña de app de Google, requiere 2FA activo). Los correos se auto-desactivan si faltan.
- **Los correos usan constantes duplicadas** para el WhatsApp (`correoCliente.ts` y `correoEnvio.ts`) porque `"use node"` no puede importar de `lib/site.ts`. Si el WhatsApp cambia, hay que tocarlo en los 3 sitios.

---

## 10. Últimas cosas hechas

### Sesión del 26 de agosto al 2 de septiembre

Todo desplegado y verificado en producción.

**La lista de once puntos del dueño: nueve cerrados.** Quedan el 3 (mockups de
colores, esperando fotos) y el 7 (vista previa de las iniciales, sin definir).

- **Rayos X en las cuatro fichas** (§14), dentro de la sección Medidas.
- **Carritos abandonados** (§13), con autorización y purga a 90 días.
- **Muro de Instagram automático** por la API JSON de Behold. Se descartó
  Elfsight: su plan gratuito son 200 vistas al mes y al pasarse DESACTIVA el
  widget — los visitantes dejan de verlo mientras el dueño sigue viéndolo.
- **El porting terminó**: tokens en `:root`, sin envoltorios, y las cinco
  superficies que seguían con la interfaz anterior (`/gracias`,
  `/pago-fallido`, `/preguntas-frecuentes`, `/privacidad` y el cajón del
  carrito).
- **Favicon con la concha.** El sitio llevaba tiempo SIN favicon: el
  `public/favicon.svg` anterior no lo enlazaba nada.
- **Scroll:** la ficha pasó de 5585px a ~4500, y `/nosotros` de 3868 a 3276.
- **Fuera la raya larga (—)** de todo el copy, incluidos los correos y las
  descripciones del catálogo. Cero en las trece rutas.
- **Encabezados de `/tienda`**: los nombres de las piezas eran H3 colgando de
  un H1. Ahora H2, con el nivel como prop porque la tarjeta se usa en tres
  sitios y en dos H3 era correcto.
- **Sitemap**: faltaban `/envios` y `/contacto`, indexables desde siempre.
  Ahora 11 URLs. Ver `docs/URLS-SEARCH-CONSOLE.md`.
- **Hover de las tarjetas**: de la toma de ángulo a la toma en uso.
- Logo centrado en móvil, esquinas de los botones de color, "Color a
  disposición" → "Color personalizado", fuera el filtro de la colección,
  galería cuadrada, home a 4 por fila.

### Sesión que terminó el 2026-08-10

- **Cutover al dominio propio `lamarquessa.co`** (Namecheap → Vercel). Apex canónico, `www` con 308 al apex. `NEXT_PUBLIC_SITE_URL` (Vercel) y `SITE_URL` (Convex prod) apuntando al dominio.
- **Middleware 301** en `apps/storefront/middleware.ts` desde cualquier host distinto al canónico (típicamente el subdominio auto de Vercel) hacia `lamarquessa.co`. Guardado por `VERCEL_ENV === "production"` para no romper previews.
- **Fallback de `SITE_URL` actualizado** en `lib/site.ts` al dominio nuevo.
- **Keywords de moda en H1/H2 y descripciones** de los 4 productos. Nuevo campo opcional `subtitulo` en el schema, renderizado como H2 bajo el H1 y usado en el meta title. Descripciones enriquecidas con un párrafo de cierre con 3–4 keywords por bolso. Mutación idempotente `actualizarSeoDeCatalogo` corrida en prod.
- Docs internos actualizados (README, ESTADO, memoria) al dominio nuevo.

Sesión anterior (2026-08-06):
- Auditoría del flujo de compra completa. Encontrado y corregido: `marcarPagado` solo transiciona desde `pendiente` (antes revivía cancelados si llegaba pago tarde por Efecty).
- WhatsApp correcto en el correo "va en camino".
- Auditoría móvil completa. 4 fixes: menú hamburguesa, CTA fijo, tap targets 44×44, títulos con espacio antes de `<br />`.
- Configuración de Gmail probada y funcionando.
- 9 pedidos de prueba cancelados. Panel limpio.
- Cuenta MP renombrada a "Amor y Brillitos" (paraguas para las dos marcas).

## 11. Historial de commits recientes

```
2f252e3 Nuestra historia: las fotos ocupan su marco, y el encuadre por fin se aplica
a034b9b Nuestra historia: la foto y el texto cierran en la misma línea
6120bec Checkout: fuera la política duplicada, y la casilla junto al envío
76dcdb1 Checkout: el aviso de datos al cierre, y el envío internacional en una casilla
76271ff Datos: el aviso del checkout se acorta y la explicación va a la FAQ
063067f Datos del carrito: la autorización pasa a la política, sin casilla
ce50ee2 Carritos abandonados: registrar el tramo que era invisible
dd8c5cd Ficha: menos aire, segunda pasada
838d540 Colección: los nombres de las piezas son H2, no H3
9edacdf Fuera la raya larga de todos los textos del sitio
4030bfa Favicon: la concha de la marca, esta vez de verdad
7e087dc docs: las URLs del sitio para Search Console
5a0dd68 Sitemap: faltaban /envios y /contacto
2bdefff Nuestra historia: fuera el espacio muerto
```

## 12. Porting de la interfaz nueva (histórico — ya en `main`)

Implementación del mockup aprobado (`../LM_MOCKUP`) sobre la tienda viva,
siguiendo `HANDOFF-IMPLEMENTACION.md` de ese repositorio.

### Qué está portado

**El sitio público entero.** Ya no quedan páginas con la interfaz anterior:
home, `/tienda`, `/producto/[slug]`, `/nosotros`, `/envios`, `/contacto`,
`/carrito`, `/checkout`, `/gracias`, `/pago-fallido`,
`/preguntas-frecuentes` y `/privacidad`, más la cabecera, el pie y el cajón
del carrito.

Los tokens **ya están promovidos a `:root`** en `app/globals-v2.css`. Los
viejos que colisionaban por nombre (`--crema`, `--cobre`, `--cobre-texto`,
`--radio`, `--ancho`, las fuentes) se borraron de `globals.css`, y los
envoltorios `.ui-v2` desaparecieron de las doce rutas.

El panel (`/panel`) NO se tocó: usa las utilidades de color de Tailwind, que
salen del bloque `@theme` de `globals.css` y siguen con los hex anteriores a
propósito.

Un efecto secundario que arregló un fallo real: la media query de espaciado
móvil estaba escrita como `.ui-v2 :root`, que **nunca casaba** (`:root` es
`<html>`, no puede ser descendiente de nada). Con los tokens en `:root` vuelve
a funcionar — medido: `--pad-base` pasa de 128px a 72px por debajo de 768px.

### Portado en la ronda del 26 de agosto

- **`FondoTopografico`** (+ `topografia-shader.ts` y `topografia.svg`): la
  textura de curvas de nivel en movimiento que el mockup monta en el layout y
  que faltaba en todo el sitio. Verificada en modo `webgl`.
- **`Lightbox`** en la ficha: el marco de la foto pasa a ser botón. Verificado
  abrir, flechas, `Escape`, bloqueo del scroll de fondo y retorno del foco.
- **`PruebaSocial`** y **`MuroInstagram`** en la home. Los dos se auto-ocultan
  sin datos reales: en producción devuelven `null` hoy. Ver §12.1.
- **Enlace «Saltar al contenido»** y `id="contenido"` en el `<main>`.

### Decisiones que siguen esperando al dueño de la marca

| Qué | Consecuencia hoy |
|---|---|
| **Desde qué número arranca la numeración de piezas** | El "elemento firma" (`Nº 042 · única en el mundo`) no se pinta. El campo `serie` ya está en el schema para activarlo sin migración |
| **Licenciar la tipografía Queens para web** | La display es Queen Serif FREE con Fraunces cubriendo acentos y eñes por fallback por-glifo |
| **Fotos de Manglar y Marea** | Los dos acabados se pueden comprar pero no aparecen en el filtro de la colección, y su panel de referencia dice "Referencia pendiente" |
| **Horario de atención** | Único marcador PENDIENTE visible del sitio, en `/contacto` |
| **El vídeo del hero lleva "La Marquessa" incrustado** | Compite con el H1. Anotado desde el mockup, sin resolver |
| **Nav y pie usan logos distintos sobre el mismo fondo** | `logo-cobre` arriba, `logo-claro` abajo, ambos sobre `--tinta` |
| **Testimonios, destinos entregados y publicaciones de Instagram** | `PruebaSocial` y `MuroInstagram` ya están portados, pero **invisibles en producción** hasta que haya material. Ver §12.1 |

### Colores del catálogo

Pasó de 3 a 5 acabados, con los hex del sistema de diseño aprobado. **Siguen
siendo aproximaciones a una descripción verbal: nadie ha medido una pieza
física con luz neutra.** Recalibrar antes de usarlos en material impreso.

El salto más visible respecto a lo que había: Caribe pasó de un gris lavanda
`#bcc1d2` a un turquesa `#2C8CA8`.

### 12.1 Cómo encender la prueba social y el muro de Instagram

Las dos secciones están cableadas y estilizadas, y **no hay que tocar la
home** para activarlas. Hoy no se ven en producción porque no hay dato real:

| Sección | Qué la enciende | Dónde |
|---|---|---|
| Testimonios | Al menos una entrada, **aprobada por escrito por quien la dijo** | `lib/testimonios.ts` → `TESTIMONIOS` |
| Contador de piezas | Un número de piezas **entregadas** (no pedidas) | `lib/marca.ts` → `PIEZAS_ENTREGADAS` |
| Muro de Instagram | Publicaciones con la miniatura **descargada a `/public`** | `lib/instagram.ts` → `POSTS` |

⚠️ **Las URL del CDN de Instagram caducan.** Guardar el enlace que devuelve
la API produce fotos rotas en pocos días: hay que descargar la imagen.

⚠️ **No se publican los ejemplos.** Los arreglos traen andamiaje marcado como
PENDIENTE que **solo se ve en `dev`**; en producción las secciones devuelven
`null`. Publicar esos ejemplos serían reseñas inventadas, y tampoco se emite
`Review` ni `AggregateRating` en el JSON-LD.

El muro dispara `instagram_click` con `link_location: "muro_home"` (y
`"muro_home_pie"` en el enlace de la cuenta). Es un parámetro nuevo, no un
evento nuevo: el contrato de los 17 eventos no cambia.

### Lista de cambios del dueño (31 de agosto de 2026)

Once puntos pedidos. **Nueve cerrados y en producción**, dos abiertos.

| # | Qué | Estado |
|---|---|---|
| 1-2 | Imágenes de rayos X y su deslizador | ✅ en producción |
| 3 | Mockups de colores con fondo de palmerita | ⏸ esperando fotos del dueño |
| 4 | Recortar foto de la ficha | ✅ galería de 4/5 a cuadrada |
| 5 | Reducir las fotos del home | ✅ de 2 a 4 por fila |
| 6 | "Color a disposición" → "Color personalizado" | ✅ en 8 sitios |
| 7 | Vista previa de las iniciales sobre la pieza | ⏸ falta decidir el enfoque |
| 8 | Esquinas de los botones de color | ✅ 2px → 8px |
| 9 | Logo centrado en móvil | ✅ desviación 0px |
| 10 | Favicon con la concha | ✅ |
| 11 | Quitar el filtro de color de la colección | ✅ componente borrado |

### Rayos X — cómo está montado

Deslizador de barrido en la sección **Medidas** de cada ficha, con las cuatro
piezas encendidas. La cara opaca y la translucida son un PAR de renders de la
MISMA cámara (`fotoRayosXBase` y `fotoRayosX` en el catálogo); sin las dos, la
sección no se renderiza.

**El contenido de cada bolso es cierto**, que era la condición para que la
función mereciera existir: en Menorca el celular ASOMA por la abertura — no
entra, igual que dice la FAQ. En las otras tres cabe.

Para añadir o cambiar un render: dejar el PNG en `public/fotos` como
`rayos-x-{slug}-base.png` y `rayos-x-{slug}.png`, convertir a AVIF+JPEG,
descomentar la pieza en `productos:actualizarRayosX` y correrla con
`--prod` **después** de `npx convex deploy`.

### Deuda pendiente de esta ronda

- **Fondos de los renders**: vienen horneados y distintos por pieza
  (`#EEEAE2`, `#EADCD5`, `#FCFBF7`) sobre un sitio que es `#EAE8DF`. Se nota al
  pasar de una ficha a otra. Arreglo real = re-renderizar con transparencia;
  no se puede recolorear por fuera porque en los translúcidos el fondo se ve
  A TRAVÉS del bolso.
- **9 PNG sin trackear** en `public/fotos` (6,7 MB). No se despliegan —Vercel
  construye desde git— pero uno sobra: `rallos-x-menorca-base.png`, duplicado
  con el nombre mal escrito.
- **Peso de las piezas**: no existe campo en el schema. Los datos solo viven
  en la FAQ (290/350/190/290 g).

### Antes de fusionar a `main`

1. Revisar la rama en un despliegue de vista previa de Vercel.
2. **Prueba de compra real con cupón**, que sigue siendo el bloqueador de
   siempre: el Convex de desarrollo no tiene `MP_ACCESS_TOKEN`, así que el
   `purchase` de una compra verdadera nunca se ha visto de principio a fin.
3. Confirmar en el DebugView de GA4 y en el Meta Pixel Helper que los 17
   eventos siguen llegando desde el despliegue de vista previa.

---

## 13. Carritos abandonados (2 de septiembre)

Cubre el tramo que era invisible: **el pedido solo nace al ENVIAR el
checkout**, así que añadir al carrito y empezar a llenar el formulario no
dejaban rastro.

Tabla `carritos` en Convex, con **dos zonas que no se pueden mezclar**:

| Zona | Campos | Regla |
|---|---|---|
| Anónima | `sesionId`, `items`, `subtotalCop`, `paso` | `sesionId` es un aleatorio del navegador. Sin autorización necesaria |
| Personal | `contacto`, `consentimiento` | El servidor lo descarta si no viene consentimiento |

**Cuatro decisiones que hay que respetar al tocarlo:**

1. Va por **acción de servidor** (`app/acciones/carrito.ts`), no por
   `useMutation`: no hay `ConvexProvider` y montarlo abriría un WebSocket a
   cada visitante.
2. El navegador manda **qué variante y cuántas, nunca precios**. Los resuelve
   el catálogo en el servidor, igual que el checkout.
3. **El paso solo avanza** (`ORDEN_PASO`). El proveedor del carrito escribe con
   retardo desde cualquier página y devolvía el registro a "carrito".
4. **Falla en silencio y nunca bloquea.** Es telemetría: si Convex no
   responde, la compra sigue igual.

**La autorización** es por cláusula en la política, no por casilla (decisión
del dueño). Aviso corto al cierre del checkout → `/preguntas-frecuentes#datos`.

⚠️ **Se archiva el TEXTO literal del aviso y la fecha, no un `true`.** El
Decreto 1377 pide que la autorización pueda consultarse después. El texto vive
en `lib/consentimiento.ts` y **los tres sitios deben decir lo mismo**: el
aviso, lo archivado y la FAQ.

**Purga a 90 días** en `convex/crons.ts`. No es limpieza opcional: la Ley 1581
exige un límite de conservación justificado, y es el que declara la política.

---

## 14. Rayos X — cómo añadir o cambiar un render

Las cuatro piezas están en producción. El deslizador vive **dentro de la
sección Medidas**, no en una propia.

Cada pieza necesita un **PAR de renders de la MISMA cámara**
(`fotoRayosXBase` opaco y `fotoRayosX` translúcido). Sin los dos, la sección
no se renderiza.

```
public/fotos/rayos-x-{slug}-base.png   +   rayos-x-{slug}.png
```

1. Convertir a AVIF + JPEG con sharp (6,7 MB de PNG quedaron en 269 KB)
2. Descomentar la pieza en `productos:actualizarRayosX`
3. `npx convex deploy -y` y luego la mutación con `--prod`
4. Push

**El contenido de cada bolso tiene que ser cierto:** en Menorca el celular
ASOMA por la abertura — no entra, igual que dice la FAQ. Es el valor entero de
la función.

---

---

## 15. Rendimiento — línea base medida (2 de septiembre de 2026)

Primera medición del sitio. Antes de esto nunca se había medido nada, así que
cualquier optimización futura se compara contra estos números.

**Cómo se midió:** Lighthouse 12.8.2 por CLI contra producción, móvil, con
estrangulamiento simulado. La API de PageSpeed sin llave está con la cuota
agotada — si hace falta repetirlo, `npx lighthouse@12 <url> --output=json
--chrome-flags="--headless=new"`. Tira un `EPERM` al final al borrar su
temporal en Windows: es solo la limpieza, **el informe sí se escribe**.

| | Home | `/producto/menorca` | Objetivo |
|---|---|---|---|
| SEO | **100** | **100** | ≥95 ✅ |
| Accesibilidad | **96** | **96** | ≥95 ✅ |
| Rendimiento | **59** | **62** | ≥90 ❌ |
| Buenas prácticas | 79 | 79 | — |
| LCP | 4,4 s | 4,3 s | <2,5 s |
| CLS | **0** | **0** | <0,1 ✅ |
| TBT | 1.010 ms | 990 ms | <200 ms |
| Peso total | 3.592 KB | 1.958 KB | |

⚠️ **Son datos de LABORATORIO.** Los de campo (CrUX), que son los que Google
usa para posicionar, no se pudieron obtener y probablemente el sitio aún no
tiene muestra suficiente. Medir los reales depende del #17: sin GA4 publicado
no hay dónde mandarlos.

**CLS en 0 en las dos páginas.** No es casualidad: es el trabajo previo de
dimensionar las imágenes. No romperlo.

### Qué lo está frenando, en orden de daño

1. 🔴 **`public/assets/video/hero.mp4` pesa 5,4 MB** y es el elemento LCP de la
   home. Un solo archivo explica casi todo el LCP de 4,4 s.
2. 🔴 **882 KB desperdiciados en imágenes sin versión responsive.** Esto
   **confirma el #2**: en la ficha el LCP es un AVIF de **1600×2000 servido
   tal cual a un móvil**. Ya no es una suposición, está medido.
3. 🟠 **`marca/logo-cobre.png` y `marca/logo-claro.png`: ~103 KB cada uno**, en
   PNG y sin dimensionar. ~165 KB tirados entre los dos. Es la corrección más
   barata del lote.
4. 🟠 **Meta Pixel bloquea el hilo principal 349 ms** y GTM otros 146 ms: la
   mitad del TBT es de terceros.
5. 🟡 **El muro de Instagram (Behold) trae 412 KB** de imágenes de tercero en
   la home.
6. 🟡 **bf-cache desactivado** por `cache-control: no-store`: el botón "atrás"
   recarga la página entera en vez de restaurarla.

### Segunda medición, tras tocar el vídeo del hero (2 sept, misma tarde)

**El vídeo NO era la causa del LCP, y conviene no repetir ese error.** Se
corrigió su carga (ver el commit del hero) y el LCP no se movió: sigue en
~4,5 s. La medición dice por qué sin ambigüedad:

- El póster está **descargado a los 771 ms**, con `fetchpriority=high` y
  precarga confirmada por `lcp-discovery-insight`.
- El LCP ocurre a los **4.500 ms**.
- Entre los dos no hay red: hay **3,7 s de hilo principal bloqueado**.

```
Evaluación de scripts   2.667 ms
Other                   1.472 ms
Style & Layout            735 ms
```

Dos paquetes de JS propios se llevan **1.737 ms y 1.617 ms** de CPU. Meta
Pixel suma ~436 ms y GTM ~310 ms. **El LCP está limitado por JavaScript, no
por descargas.** Cualquier trabajo futuro sobre el LCP que no reduzca tiempo
de CPU no va a mover la aguja.

Lo que el cambio del vídeo sí consiguió, medido:

| | Antes | Después |
|---|---|---|
| TBT | 1.010 ms | **560-730 ms** |
| Vídeo servido a un móvil | 5,3 MB | **1,2 MB** |
| Prioridad del vídeo | compitiendo al montar | **Low, a los 1.366 ms** |
| Póster | 91 KB, sin precarga | **58 KB, listo a 771 ms** |

⚠️ **La variabilidad de Lighthouse en este sitio es enorme:** cuatro corridas
seguidas de la MISMA página dieron rendimiento 47, 60, 61 y 63, con LCP entre
4,5 y 12,8 s. **Una corrida suelta no prueba nada**; hay que repetir y mirar
lo que se mantiene. El CLS de 0,024 que apareció en una corrida era ruido: en
las otras tres volvió a 0.

### Accesibilidad: corregida el 2 de septiembre, ambas páginas a 100

Los dos fallos que encontró la medición están arreglados y verificados contra
producción: **home y ficha marcan 100 sin ningún fallo**.

1. **El cajón del carrito dejaba entrar el tabulador estando cerrado.**
   `aria-hidden` lo escondía del lector de pantalla pero **no quita del foco**:
   sus doce botones seguían siendo enfocables. Se resolvió con `inert`, que
   saca los hijos del foco, del clic y del árbol de accesibilidad a la vez.
   Verificado midiendo la salida y no el atributo: se intentó enfocar los doce
   candidatos uno por uno y ninguno lo consiguió.
   De paso, dos huecos de teclado del mismo panel: al abrir, el foco va al
   botón de cerrar; Escape lo cierra; y al cerrar, el foco vuelve al botón que
   lo abrió en vez de al principio del documento.

2. **`label-content-name-mismatch` en las cuatro fichas.** Los botones de foto
   enseñan la marca de agua "COLOR AMANECER" y su nombre accesible no la
   mencionaba. El `aria-hidden` del `<span>` no basta: el texto se sigue
   viendo en pantalla. Se añadió el rótulo al `aria-label`, que además es
   justo el dato que la marca de agua existe para dar.

⚠️ **Esto NO cierra el #3 entero.** Lighthouse no mide el recorrido del
tabulador ni si el anillo de foco se ve. Eso sigue pendiente y hay que hacerlo
a mano.

### Lo que decía la primera medición (histórico)

En las dos páginas: el cajón del carrito
(`<aside aria-label="Carrito" aria-hidden="true">`) **deja sus botones
enfocables cuando está cerrado**. Con teclado se tabula hacia adentro de un
panel invisible. Es un bug real, no una advertencia de la herramienta.

En la ficha aparece además `label-content-name-mismatch`: un control cuyo
nombre accesible no contiene el texto que se ve. Sin diagnosticar todavía.

### Buenas prácticas 79

Los dos fallos son cookies de tercero (Meta Pixel y GTM). Se arregla de raíz
con el **#8** (Consent Mode), no por separado.
