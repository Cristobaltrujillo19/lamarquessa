# AUDITORÍA — Web de La Marquesa / La Marquessa

**Fase 0 · Solo lectura.** Este informe no modifica nada de producción. Todos los datos salen de leer el repo y medir; lo que no pude verificar va marcado `[PENDIENTE]`. Al final está la **lista de decisiones que necesito de ti** antes de tocar código.

Fecha: 2026-07-27 · Alcance auditado: monorepo `lamarquesa/` (apps `landing` + `storefront`) y carpeta de assets `../Claude_proyect/`.

> ⚠️ **Documento histórico.** Este informe describe el estado del proyecto al 27 de julio de 2026. Desde entonces han cambiado cosas importantes que ya no coinciden con este texto:
>
> - `apps/landing` (Astro) fue absorbido por `apps/storefront` (Next) durante Fase 1. Hoy solo existe `storefront`.
> - El dominio propio `lamarquessa.co` **está comprado y en vivo** desde el 2026-08-10. Todos los canonical / OG / sitemap ya lo usan.
> - Convex prod (`hearty-lemur-822`) está poblado con el catálogo real.
>
> Para el estado actual, ver `ESTADO.md`.

---

## 0. DECISIÓN CRÍTICA — La grafía (una `s` vs dos `ss`)

Busqué ambas grafías en TODO el contenido del repo:

| Grafía | Apariciones en contenido | Dónde |
|---|---|---|
| **`Marquesa`** (una s) | **0 en el código/contenido** | Solo en **nombres de carpeta local** (`La Marquesa\`, `lamarquesa\`) y en **tus notas** (`PROMPT_ClaudeCode_Web_LaMarquesa.md`, `Mensajes_Influencers_..._LaMarquesa.md`) |
| **`Marquessa`** (dos s) | **57 apariciones en 27 archivos** | Todo el código y contenido, el `name` del paquete (`lamarquessa`), el repo git (`github.com/…/lamarquessa`), los proyectos de Vercel (`lamarquessa-landing`, `lamarquessa-landing-gtpv`), el dominio configurado (`lamarquessa.co` en `astro.config.mjs` y `robots.txt`), **el manual de marca** (`Manual de marca La Marquessa.pdf`) y **todos los assets de Canva/IG** (`La Marquessa - …`) |

**Lectura:** todos los materiales de marca reales (manual + piezas de diseño) y todo el código usan **dos eses: "La Marquessa"**. La única "una s" está en carpetas locales y en tus documentos de brief. Tu prompt, sin embargo, la llama "La Marquesa".

> **Necesito que definas la grafía oficial antes de normalizar nada.** Ver Decisión #1. La diferencia de esfuerzo es enorme: si la oficial es "Marquessa" (dos s) el código ya está alineado; si es "Marquesa" (una s), hay que renombrar dominio, repo, proyectos de Vercel, paquete, 57 apariciones y —ojo— el propio manual de marca usa dos s. **No cambio nada hasta tu respuesta.**

---

## 1. Stack real detectado

**Monorepo** gestionado con **pnpm 10.33.2** + **Turborepo 2.5**. Nombre del paquete raíz: `lamarquessa`. **Dos aplicaciones independientes**, con dos frameworks, dos sistemas de estilo y dos deploys distintos:

| | `apps/landing` | `apps/storefront` |
|---|---|---|
| Framework | **Astro 6.4.6** | **Next.js 16.2.9** + React 19 |
| Render | **SSG** (estático) | Server Components + `fetchQuery` (dinámico) |
| Estilos | **CSS propio** (`global.css` con custom properties + `<style>` scoped por componente) — **no Tailwind** | **Tailwind CSS 4** (`@theme` en `globals.css`) |
| Contenido | **Hardcodeado** en `.astro` y `src/lib/` | Productos en **Convex** (editables desde el panel); resto hardcodeado |
| Imágenes | `sharp` disponible pero **no se usa** (imgs crudas) | `<img>` crudas (**no** `next/image`) |
| Node | `>=22.12` | (Next 16) |

- **Backend de datos:** Convex. Dev `dev:agreeable-buzzard-367`, **producción `hearty-lemur-822`** (desplegada hoy, catálogo sembrado). Solo el storefront lo usa.
- **Hosting:** Vercel. Dos proyectos: `lamarquessa-landing` (landing) y `lamarquessa-landing-gtpv` → `https://lamarquessa-landing-gtpv-three.vercel.app` (storefront). El landing productivo vive en `lamarquessa-landing.vercel.app`.
- **CMS:** no hay CMS clásico. Los productos son editables vía Convex + panel `/panel`; el copy del landing es 100% hardcodeado.

> ⚠️ **Hallazgo de arquitectura (Crítico):** el sitio son **dos apps en dos dominios/deploys**, con **dos sistemas de diseño**. Para SEO esto **divide autoridad**, obliga a mantener metadatos/schema por duplicado, y la navegación landing↔tienda es cross-origin. Es una decisión de fondo antes de la Fase 1 (ver Decisión #2).

---

## 2. Mapa de rutas y componentes

### Landing (Astro) — público
| Ruta | Archivo | Qué renderiza |
|---|---|---|
| `/` | `src/pages/index.astro` | Hero (carrusel + logo), Beneficios, Colección, FranjaIconos, **ListaEspera**, Manifiesto, Footer, FAB WhatsApp |
| `/nosotros` | `src/pages/nosotros.astro` | Historia (Concepto, relato, Elementos, CierreCta) |
| `/privacidad` | `src/pages/privacidad.astro` | Política de privacidad (borrador) |

### Storefront (Next) — público
| Ruta | Archivo | Qué renderiza |
|---|---|---|
| `/` | `app/page.tsx` | Hero (imagen `/fotos/hero-3.jpg` + logo) + grid de productos |
| `/tienda` | `app/tienda/page.tsx` | Catálogo (grid de `ProductCard`) |
| `/producto/[slug]` | `app/producto/[slug]/page.tsx` | Galería + `ComprarPanel` (variantes + carrito) + `<details>` + relacionados |
| `/carrito` | `app/carrito/page.tsx` | Carrito |
| `/checkout` | `app/checkout/page.tsx` | **Stub de Mercado Pago** (no cobra) |
| `/panel/*` | `app/panel/**` | Panel de operaciones (privado — fuera de SEO) |

### Componentes reutilizables
- **Storefront:** `ProductCard`, `Galeria`, `ComprarPanel`, `Header`, `Footer`, `CartButton`, `CartDrawer`, `Chrome`.
- **Landing (24 componentes)**, de los cuales varios están **construidos pero NO se usan en ninguna página**: `ComoSeHace.astro` (¡el proceso!), `Editorial.astro`, `Statement.astro`, `FraseMarca.astro`. Los usados: Hero, Beneficios, Coleccion, FranjaIconos, ListaEspera, Manifiesto, Concepto, Elementos, CierreCta, Header, Footer, FabWhatsApp, Icono*, LogoMarca, Carrusel, PlaceholderFoto.

> ⚠️ **`ComoSeHace.astro` (el paso a paso del proceso: "Lo diseñamos → Lo imprimimos en 3D → Lo terminamos a mano") existe pero no se muestra en ningún lado.** Es justo la "mina de oro" SEO/AEO de esta marca, y hoy es invisible. Además su contenido es fino (3 frases sensoriales, sin datos concretos de materiales/tiempos).

---

## 3. Inventario SEO actual (archivo por archivo)

### Landing — `src/layouts/Base.astro` (base de todas las páginas)
Buena base, con carencias puntuales:
- ✅ `<html lang="es-CO">`
- ✅ `<title>` y `<meta description>` **por página** (props)
- ✅ **Canonical absoluto** (`new URL(pathname, Astro.site)`, con `site: 'https://lamarquessa.co'`)
- ✅ Open Graph completo (`og:type/title/description/url/image/locale=es_CO`) + `twitter:card=summary_large_image`
- ❌ **`og:image` apunta a `/og.jpg` que NO EXISTE** en `public/`. Las previews sociales salen rotas — **crítico** porque el tráfico de influencers llega por links compartidos.
- ⚠️ JSON-LD **`Organization` básico**: tiene `name`, `url`, `email`, `description`, `address CO`, `sameAs:[INSTAGRAM_URL]`. **Faltan** `alternateName` (la otra grafía), `logo`, `contactPoint`. No hay `WebSite`, `BreadcrumbList`, `Product`, ni `FAQPage`.
- ❌ **Sin `manifest`**.

| Página landing | `<title>` actual | Nota |
|---|---|---|
| `/` | `La Marquessa — Bolsos impresos en 3D, hechos en Colombia` | Marca **antes** del beneficio (debería ser al revés); 60+ chars |
| `/nosotros` | `Nuestra historia — La Marquessa` | OK |
| `/privacidad` | `Política de privacidad — La Marquessa` | OK |

### Landing — `robots.txt`
```
User-agent: *
Allow: /
Sitemap: https://lamarquessa.co/sitemap-index.xml
```
- ✅ No bloquea nada (los crawlers de IA pueden entrar).
- ❌ **Apunta a `sitemap-index.xml` que NO se genera** (no hay integración `@astrojs/sitemap` en `astro.config.mjs`, ni ningún sitemap en el repo).

### Storefront (Next) — SEO **muy pobre**
- `app/layout.tsx`: `metadata` **genérico y único** (`title: "La Marquessa — Bolsos impresos en 3D"`, una description). ✅ `lang="es-CO"`.
- `app/page.tsx` (home): **sin `metadata` propio** → hereda el título genérico. **Sin `<h1>`** (el logo es un `<img>`; el único encabezado es un `<h2>`). Sin JSON-LD, canonical ni OG por página.
- `app/tienda/page.tsx`: `metadata = { title: "Colección — La Marquessa" }` (solo título, sin description/OG). ✅ tiene `<h1>`.
- `app/producto/[slug]/page.tsx`: **SIN `generateMetadata`** → **todos los productos comparten el mismo `<title>` genérico**. Sin `Product` JSON-LD, sin canonical, sin OG. ✅ tiene `<h1>` (nombre del producto). Las secciones "Materiales" y "Envíos" son `<details>` **no marcados como `FAQPage`**.
- ❌ **Sin `robots.txt`, sin `sitemap`, sin `manifest`** en el storefront.

### Encabezados (jerarquía)
- **Ambos homes NO tienen `<h1>`** (landing: Hero usa `LogoMarca` como imagen; storefront: logo `<img>` + `<h2>`). Riesgo SEO real.
- Páginas internas (`/nosotros`, `/privacidad`, `/tienda`, `/producto`) sí tienen un único `<h1>`.

---

## 4. Inventario de imágenes

**Formato:** el 100% es **JPEG o PNG. No hay AVIF ni WebP en ningún lado.** Ninguna imagen declara `width`/`height`. No hay `srcset`/`sizes` en ninguna parte. En el storefront todo es `<img>` crudo (no `next/image`).

### Landing — `public/fotos/` (placeholders en uso)
| Archivo | Dimensiones | Peso | Formato | `alt` | `w/h` | `lazy` | Nombre |
|---|---|---|---|---|---|---|---|
| `hero-1..4.jpg` | 736–800 px | 85–113 KB | jpeg | según uso | ❌ | ❌ (carrusel) | ok |
| `bolso-venera/marea/brisa/coral.jpg` | 735–960 px | 58–191 KB | jpeg | en `Coleccion` sí | ❌ | ✅ (`Coleccion`) | ok |

### Landing — `public/marca/`
| Archivo | Dimensiones | Peso | Nota |
|---|---|---|---|
| `logo-cobre/claro.png` | 1000×285 | ~100 KB | pesado para un logo; sería SVG |
| `logo-imagotipo.png` | 900×681 | 247 KB | |
| `patron-cobre/claro.png` | 760×395 | **337–348 KB** | ⚠️ se usa como fondo **al 5% de opacidad** en ListaEspera → 337 KB para algo casi invisible |
| `concha/velero/hibisco.png` | ~500 px | 65–127 KB | existen como SVG (mejor) |

### Producto REAL (no está en el sitio) — `../Claude_proyect/`
| Set | Archivos | Dimensiones | Peso | Problema |
|---|---|---|---|---|
| `Egg handbag pics/` | 6 fotos del bolso **Egg** | 1200×1600 | 132–286 KB | **Nombres basura** (`WhatsApp Image 2026-07-13 at 15.26.50 (1).jpeg`), JPEG sin optimizar, **no están en la web** |
| `La Marquessa - Casillas para Canva/` | 6 product shots (mármol/piscina) + 3 marca | 1080×1350 | **98 KB – 2.0 MB** | PNG pesadísimos (hasta 2 MB) para fotos; deberían ser AVIF/JPEG |
| `La Marquessa - Posts muestra/` | egg_bag, ligero_como_el_mar, hecho_a_mano, patron_olas | — | ~0.6–1.1 MB | material de marca real, sin usar en la web |

> ⚠️ **El producto real es el bolso "Egg"** y sus fotos buenas están fuera del repo, mal nombradas y sin optimizar. El sitio muestra **4 bolsos placeholder** (venera/marea/brisa/coral) que no son el producto real (y uno de los placeholders traía un logo ajeno, ya señalado en handoffs previos).

---

## 5. Auditoría de conversión

**Tensión estratégica de fondo:** dices "pre-lanzamiento, la web no vende, el objetivo es la lista de espera", pero **la tienda (storefront) está desplegada, es funcional y el CTA principal del home/hero dice "Ver la colección / Ir a la tienda"** (lleva a `/tienda`, agregar al carrito funciona; solo el checkout es stub). Hoy el sitio manda señales mixtas: parte "capta lista de espera" (landing) y parte "compra ya" (tienda con carrito activo). **Hay que decidir el objetivo primario y alinear todos los CTAs** (Decisión #4).

### Lista de espera (`ListaEspera.astro`) — la conversión de pre-lanzamiento
- ✅ **Un solo campo** (email), con `aria-label`.
- ⚠️ CTA dice **"Quiero entrar"** (mejor que "Suscríbete", pero el brief pide algo como "Quiero ser de las primeras" / "Avísame cuando salga mi pieza").
- ❌ **Sin backend real:** `WAITLIST_ENDPOINT` está vacío → el submit **abre WhatsApp con el correo**. No se captura ni almacena ningún email. (Es, además, el touchpoint de WhatsApp que ya te había marcado.)
- ❌ **Sin checkbox de consentimiento ni enlace a Habeas Data** (Ley 1581) — requerido.
- ⚠️ **Confirmación pobre:** revela un `<p>` inline ("¡Listo! Te avisaremos") en vez de una **pantalla de confirmación** (siguiente paso, seguir IG, compartir).
- ❌ **Sin eventos de analítica** en el submit.
- ⚠️ **No está above-the-fold en móvil:** aparece a mitad de página (tras Hero, Beneficios, Colección, FranjaIconos), y **solo una vez**.

### Clics hasta la conversión
- **Waitlist:** hero → scroll varias secciones → email → (abre WhatsApp). No hay CTA de waitlist en el hero.
- **Compra:** hero "Ver colección" → `/tienda` (**otra app/dominio**) → producto → agregar al carrito → checkout **stub (callejón sin salida)**.

### Elementos de conversión presentes vs. faltantes
- ✅ **Botón flotante de WhatsApp** (FAB) con mensaje pre-rellenado. ❌ pero **sin evento de analítica** en el clic.
- ✅ Selección de variante (color × tamaño) + carrito **ya funcionan** (no están tras feature flag).
- ❌ **Prueba social:** inexistente (sin componente de reseñas vacío, sin firma de la diseñadora, sin "quién está detrás").
- ❌ **Escasez honesta:** el copy dice "pieza exclusiva/única" pero no hay numeración de pieza ni cupo de lanzamiento.
- ❌ **Macro/detalle de la textura 3D** (el diferenciador) no se muestra en foto.
- ❌ **Sin CTA fijo (sticky) en móvil** en la ficha de producto.
- ❌ **FAQ real inexistente:** solo 2 `<details>` en la ficha (materiales, envíos). Faltan las objeciones clave: ¿es realmente único? ¿qué es impresión 3D en un bolso? ¿resiste? ¿cuánto pesa? ¿cabe laptop/celular? ¿tiempos? ¿envíos a toda Colombia? ¿devoluciones?

---

## 6. Accesibilidad (contraste medido, no estimado)

Ratios WCAG reales de la paleta (AA normal ≥ 4.5:1 · AA grande ≥ 3.0:1):

| Combinación | Ratio | Veredicto |
|---|---|---|
| cacao `#4A3A2C` sobre crema `#F4E8D7` | **8.99:1** | ✅ AAA |
| cacao sobre blanco `#FBF7F1` | **10.18:1** | ✅ AAA |
| cacao-suave `#6F5A48` sobre crema | **5.37:1** | ✅ AA (cuerpo OK) |
| cacao-suave sobre blanco | **6.09:1** | ✅ AA |
| **bronce `#B38561` sobre crema** | **2.70:1** | ❌ **Falla AA y AA-grande** |
| **bronce sobre crema-claro `#E8DECD`** | **2.45:1** | ❌ Falla |
| **bronce sobre blanco** | **3.05:1** | ⚠️ Solo pasa AA **grande** (falla normal) |
| **blanco sobre bronce** (botones) | **3.05:1** | ⚠️ Botones con texto chico uppercase → **falla AA normal** |
| **arena `#C1AB99` sobre crema/blanco** | 1.82 / 2.06:1 | ❌ Falla (solo válido como fondo, no como texto) |

**Conclusión:** el **cuerpo es legible** (cacao-suave/crema = 5.37). El problema es el **bronce como texto**: los `.kicker` (etiquetas versalita), las palabras en `.script`, los enlaces en cobre y **el texto blanco de los botones cobre** **no cumplen AA**. Se arregla oscureciendo el bronce para texto (un tono derivado ~`#8A5E3B` o más oscuro) o usando cacao, sin tocar el bronce decorativo.

Otros:
- ✅ `prefers-reduced-motion` respetado (el observer de "reveal" lo comprueba).
- ✅ Foco visible en el landing (`:focus-visible` global en cobre; inputs con outline). ⚠️ Storefront: los botones (Tailwind) **no declaran estilos de foco visibles** → `[PENDIENTE: verificar en navegador]`, probable foco por defecto o suprimido.
- ⚠️ `alt`: mixto — hero home `alt=""`, miniaturas de galería `alt=""`, producto `alt={nombre}`. El input de waitlist usa `aria-label` (sin label visible).

---

## 7. Rendimiento (estimado — pendiente Lighthouse en Fase 6)

- **Landing (Astro SSG):** JS mínimo (observer de reveal + FAB + submit de waitlist inline). Muy liviano en JS. **Peso lo dominan las imágenes y las fuentes.**
- **Fuentes: 5 familias.** 2 locales (`queen-serif.otf` 39 KB, `beauty-angelique.otf` 30 KB, `@font-face` sin `font-display` explícito) **+ 3 de Google Fonts externas** (Cormorant, Jost, Pinyon) vía `<link>` **render-blocking** (con `display=swap`). No están auto-alojadas ni subseteadas.
- **Imágenes sin optimizar** (JPEG/PNG, sin AVIF/WebP, sin `srcset`, sin `width/height`). El carrusel del hero carga varias `hero-*.jpg` (~85–113 KB c/u). El patrón de fondo son PNG de ~340 KB.
- **LCP probable:** landing → imagen del carrusel/logo del hero; storefront → `/fotos/hero-3.jpg` (90 KB, `<img>` crudo **sin `fetchpriority`**).
- **Storefront (Next):** React + cliente de Convex + componentes cliente (carrito, galería, comprar). Imágenes crudas sin optimización.
- **Peso home móvil:** `[PENDIENTE: medir]` — estimo 0.7–1.1 MB según fuentes + carrusel. Objetivo del brief: <1 MB.
- **CWV:** `[PENDIENTE: Lighthouse]`. Riesgos: **CLS** (imágenes sin `width/height`), **LCP** (hero sin preload/`fetchpriority` + sin AVIF), **INP** (bajo riesgo en landing; a revisar en storefront).

---

## 8. Hallazgos priorizados (esfuerzo S/M/L)

### 🔴 Crítico
| # | Hallazgo | Esfuerzo |
|---|---|---|
| C1 | **Grafía dividida** (Marquesa/Marquessa) — bloquea todo lo demás | S decisión / M–L ejecución |
| C2 | **Dos apps en dos dominios** — divide autoridad SEO; decisión de arquitectura | L |
| C3 | **Ficha de producto sin metadata/`Product` JSON-LD/canonical/OG** (todos los productos con el mismo título) | M |
| C4 | **Ambos homes sin `<h1>`** | S |
| C5 | **`og:image` roto** (`/og.jpg` no existe) → previews sociales rotas para influencers | S |
| C6 | **Sitemap inexistente** (robots apunta a uno que no se genera) | S–M |
| C7 | **Lista de espera sin captura real** (abre WhatsApp) **+ sin consentimiento Habeas Data** | M |
| C8 | **Contraste**: bronce como texto y botones fallan AA | M |
| C9 | **Producto real (Egg) fuera del sitio**; se muestran placeholders | M (depende de datos) |

### 🟠 Alto impacto
| # | Hallazgo | Esfuerzo |
|---|---|---|
| A1 | **Sin AVIF/WebP, sin `srcset`, sin `width/height`, sin `next/image`**; renombrar fotos Egg | L |
| A2 | **Contenido de proceso (ComoSeHace) construido pero invisible** y sin datos concretos (materiales/tiempos/origen) → clave para AEO/GEO | M |
| A3 | **FAQ real inexistente** (+ schema `FAQPage`) | M |
| A4 | **Legales incompletos** (solo privacidad borrador; faltan envíos, devoluciones/retracto, términos) | M |
| A5 | **Canonical/OG/sitemap apuntan a `lamarquessa.co`** (dominio no comprado) | S (decisión) |
| A6 | **Fuentes:** auto-alojar las 3 de Google, subsetear, `preload` de la crítica, `font-display:swap` | M |
| A7 | **Confirmación de waitlist como pantalla real + eventos de analítica** (`waitlist_submit`, `whatsapp_click`, etc.) | M |
| A8 | **Sin analítica** con consentimiento; `<head>` sin preparar GSC/Meta Pixel por env var | M |

### 🟡 Pulido
| # | Hallazgo | Esfuerzo |
|---|---|---|
| P1 | Reordenar `<title>` (beneficio antes que marca) | S |
| P2 | `alt` descriptivos y consistentes | S |
| P3 | `manifest` / PWA básica + `theme-color` (ya existe en landing) | S |
| P4 | `BreadcrumbList` + `WebSite` schema | S |
| P5 | Limpiar componentes construidos y no usados (Editorial, Statement, FraseMarca) | S |
| P6 | Logos como SVG en vez de PNG; patrón de fondo optimizado | S |

---

## Lo que necesito de ti (DECISIONES) — antes de la Fase 1

1. **Grafía oficial:** ¿**La Marquessa** (dos s, como el manual, el código, el dominio y los assets) o **La Marquesa** (una s, como tu brief)? La otra irá solo como `alternateName` en el schema.
2. **Arquitectura:** ¿mantener **dos apps** (landing Astro + tienda Next) o **unificar** en una sola para no dividir autoridad SEO? (Impacto grande en esfuerzo y en cómo hago las Fases 1–4.)
3. **Dominio final:** ¿es `lamarquessa.co`? ¿Ya comprado o lo compras? Sin dominio, canonical/OG/sitemap quedan apuntando a algo que no resuelve.
4. **Objetivo primario HOY:** ¿pre-lanzamiento **solo lista de espera** (oculto/despriorizo la tienda y todos los CTAs van a waitlist), o **tienda visible** en paralelo? Hoy están mezclados.
5. **Producto:** ¿el producto real es el **bolso "Egg"**? ¿Es **un** modelo o varios? ¿Nombre(s) oficial(es)? ¿Reemplazo los placeholders por las fotos reales de `Claude_proyect`?
6. **Redes sociales reales:** URL(s) de Instagram (y TikTok/otras) para `sameAs` y enlaces. Hoy hay un `INSTAGRAM_URL` `[PENDIENTE: confirmar que es el real]`.
7. **Herramienta de email para la lista de espera:** ¿Klaviyo, Mailchimp, Brevo… o lo guardo en Convex? Sin definirlo, dejo una capa desacoplada pero no captura de verdad.
8. **Datos reales** (para schema y copy, sin inventar): ¿precio o mantenemos `PreOrder` **sin precio**? Materiales exactos, medidas y peso del Egg, tiempos de producción y de envío, política de devoluciones (derecho de retracto), y razón social/NIT para legales.
9. **IDs de medición:** Google Search Console, Bing Webmaster, Meta Pixel, analítica (¿GA4, Plausible, Umami?). Si no los tienes aún, dejo `<head>` preparado con variables de entorno vacías.
10. **Manual de marca** (`Manual de marca La Marquessa.pdf`, 62 MB): ¿quieres que lo **abra y extraiga** la paleta oficial, tipografías y textos canónicos para no inventar copy ni colores? (Puedo leerlo por páginas.)

---

---

## DECISIONES TOMADAS (2026-07-27)

| # | Decisión | Resuelto |
|---|---|---|
| 1 | **Grafía oficial** | **La Marquessa** (dos s). "La Marquesa" solo como `alternateName` en el schema. |
| 2 | **Arquitectura** | **Unificar** en una sola app / un solo dominio. |
| 3 | **Objetivo del sitio** | **VENTAS** (no pre-lanzamiento). |
| 4 | **Lista de espera** | **Se elimina** del sitio. |
| 5 | **Pasarela** | **Mercado Pago** (PSE + tarjetas + billeteras). |
| 6 | **Productos** | 4 reales (ver abajo). Menorca y Mallorca = **productos separados**, enlazados entre sí. |
| 7 | **Colores** | 3 acabados: **Amanecer** (rosa `#E8BCA6`), **Caribe** (azul glitter `#BCC1D2`), **Horizonte** (seda bicolor). |
| 8 | **Fotos** | Los renders actuales son provisionales; habrá **fotos reales** después. |

### Catálogo real (fuente: `bolsos.docx`, 2026-07-27)

| Bolso | Precio COP | Alto | Ancho | Prof. | Silueta |
|---|---|---|---|---|---|
| Menorca | 210.000 | 20 cm | 19,2 cm | 8,7 cm | Curva continua, textura de espuma, asa integrada |
| Mallorca | 255.000 | 23,7 cm | 22,8 cm | 10,4 cm | Talla grande de Menorca |
| Kruta | 230.000 | 20,5 cm | 12,8 cm | 12,8 cm | Vertical y estrecha, lisa, un pliegue |
| Montt | 195.000 | 17,5 cm | 18,2 cm | 12,3 cm | Ancha y baja, pliegue diagonal |

**Material:** PLA (filamento de proveedor colombiano). Respalda el claim "materiales colombianos". **El proveedor NO se menciona en la web.**

**Imágenes disponibles hoy:** 2 renders por bolso a 404–500 px (baja resolución, provisionales) + 2 renders de grupo a 1600 px (uno por acabado: Amanecer y Caribe).

### Correcciones aplicadas al copy del documento
- "La Marquesa" (una s) → **La Marquessa**.
- Descripción de Mallorca: eliminar la línea duplicada al final.

### Datos confirmados (2ª ronda)
- **Dominio:** todavía **no se compra** `lamarquessa.co`. Se usa la **URL de Vercel** como dominio canónico por ahora → la URL base irá en **variable de entorno** (`NEXT_PUBLIC_SITE_URL`) para que el cambio al dominio propio sea **una sola variable + redirecciones 301**, sin refactor.
- **Instagram:** https://www.instagram.com/lamarquessa.co/ (confirma además la grafía de dos s).
- **Disponibilidad:** **se fabrica a pedido**, con **2 semanas** de tiempo de producción. → No hay inventario que descontar; el copy, la FAQ y el bloque de confianza deben decirlo claro ("hecho a pedido · 2 semanas"), y el schema `Product` lo refleja con `handlingTime` de 14 días.

### Datos que SIGUEN pendientes
- `[PENDIENTE]` **IDs de medición**: Google Search Console, Bing, Meta Pixel, analítica
- `[PENDIENTE]` **Horizonte**: qué dos colores lleva el bicolor seda
- `[PENDIENTE]` **Peso** de cada bolso y **tiempo de envío** (aparte de las 2 semanas de producción)
- `[PENDIENTE]` **Razón social / NIT** para los legales
- `[PENDIENTE]` **Fotos reales** en alta resolución

---

**Fin de la Fase 0.** No he escrito ni tocado código de producción (solo `turbo.json`, config de build, para desbloquear el deploy). A la espera de tu aprobación para la Fase 1.
