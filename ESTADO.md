# ESTADO — La Marquessa · Handoff para la próxima sesión

Última actualización: **28 de julio de 2026**
Rama: `main` · Último commit: `c6e1ee6` · Árbol local: limpio · Todo pusheado.

---

## 1. Qué es este proyecto

**La Marquessa** (dos eses — grafía oficial decidida) es una marca colombiana de **bolsos de autor impresos en 3D y terminados a mano**. Cada pieza se fabrica una por una, así que no hay dos iguales.

- **Objetivo del sitio: VENDER.** No es pre-lanzamiento (esa decisión cambió durante el proyecto).
- Mercado: Colombia · Idioma: es-CO · Moneda: COP
- Fabricación **a pedido, 2 semanas** de producción.
- Canal paralelo: campaña de lanzamiento con influencers (tráfico móvil desde Instagram).

### Universo de marca
Mar, olas, Caribe, el sueño de recorrer el mundo en velero.
Tagline: *"Un sueño tejido por las olas"* · *"Life comes in waves"* · *"del amor, del mar y del amor al mar"*.

### Catálogo real (4 bolsos, ya cargados)

| Bolso | Precio COP | Alto × Ancho × Prof | Notas |
|---|---|---|---|
| **Menorca** | 210.000 | 20 × 19,2 × 8,7 cm | Textura de espuma, asa integrada |
| **Mallorca** | 255.000 | 23,7 × 22,8 × 10,4 cm | Talla grande de Menorca; su render lleva **zoom 1.2×** para que se vea mayor |
| **Kruta** | 230.000 | 20,5 × 12,8 × 12,8 cm | Vertical, lisa, un pliegue |
| **Montt** | 195.000 | 17,5 × 18,2 × 12,3 cm | Ancha y baja, pliegue diagonal |

**Acabados (3):** Amanecer `#e8bca6` (rosa nude) · Caribe `#bcc1d2` (azul con destellos) · Horizonte (seda bicolor, **color provisional — falta dato real**).
**Material:** PLA de proveedor colombiano (4D-LAB). **El proveedor NO se menciona en la web.**

---

## 2. Cómo correr el proyecto

Monorepo pnpm + Turborepo en `C:\Users\crist\Documents\random proyects\La Marquesa\lamarquesa`.
**Usar PowerShell** (no Bash) para node/pnpm/npx/convex.

```
pnpm -C apps/storefront dev        # http://localhost:3000
npx convex dev                     # desde apps/storefront, para cambios de backend
```

**Ya no existe `apps/landing`** — se unificó todo dentro de `apps/storefront` (Next 16 + React 19 + Tailwind 4 + Convex).

### Datos clave
- **Producción:** https://lamarquessa-landing-gtpv-three.vercel.app
- **Repo:** github.com/Cristobaltrujillo19/lamarquessa
- **Panel:** `/panel` → usuario `admin`, contraseña = `PANEL_PASSWORD` (local: `marquessa2026`)
- **Convex dev:** `dev:agreeable-buzzard-367` · **Convex prod:** `hearty-lemur-822`
- **Dominio propio:** `lamarquessa.co` **NO comprado todavía**
- **Instagram:** https://www.instagram.com/lamarquessa.co/

---

## 3. Qué está HECHO

### ✅ Fase 0 — Auditoría
`AUDITORIA.md` en la raíz. Incluye el inventario SEO previo, contraste medido, y las 8 decisiones tomadas.

### ✅ Fase 1 — Cimientos técnicos (en producción)
- **Unificación**: landing (Astro) migrado a Next; `apps/landing` eliminado. Los componentes de marca se portaron a React **conservando su CSS** (CSS Modules) para no cambiar el diseño.
- **Catálogo real** cargado en Convex; eliminados los 4 placeholders.
- **16 imágenes propias** importadas en AVIF + JPEG (2 de estudio + 2 de contexto por bolso). Origen: `C:\Users\crist\Documents\random proyects\La Marquesa\Renders`.
- **SEO**: metadata única por página, canonical absoluto, Open Graph completo + `og.jpg` generado, un `<h1>` por página, `sitemap.xml` (8 URLs), `robots.txt` que **no bloquea crawlers de IA**.
- **JSON-LD**: `Organization` (con `alternateName: "La Marquesa"`), `WebSite`, `BreadcrumbList`, `Product` (precio real, `InStock`, `handlingTime` 14 días).
- **Accesibilidad**: el cobre del manual `#B38561` da **2.70:1** sobre crema y falla AA. Se derivó **`#805337`** (5.41:1) para texto y botones; el original se conserva para uso decorativo.
- **Hero**: carrete con fotos de producto, ancho limitado a 1100px y `object-position` por foto para que el bolso sea el centro (las verticales se cortaban).

### ✅ Google Tag Manager
Contenedor **`GTM-P76W5D68`** montado por variable de entorno, carga `afterInteractive`, con `<noscript>` de respaldo y **excluido de `/panel`**. Verificado en navegador real.
Incluye helper `enviarEvento()` en `components/Analitica.tsx`, listo para cablear eventos.

### ✅ Política Ley 1581
`/privacidad` completada como política de tratamiento de datos (11 secciones, plazos legales 10/15 días hábiles, derechos del titular, terceros, cookies).
⚠️ **Estaba desplegándose al cierre de la sesión** — verificar que ya esté viva.

### ✅ Investigación de keywords
`SEO-KEYWORDS.md`. **Sin volúmenes** (marcados `[PENDIENTE: volumen]`, no se inventaron).

### ✅ Extras
- **Brand kit** en `C:\Users\crist\Documents\random proyects\La Marquesa\La-Marquessa-Brand-Kit` (logos, símbolos, patrones, SVG, fuentes incl. Jost).
- **Plugin claude-seo** instalado (18 agentes + 31 skills + runtime Python/Chromium). Verificado con `doctor`.

---

## 4. Los 3 hallazgos estratégicos (no perderlos)

1. **"Bolsos artesanales Colombia" es una trampa.** La SERP la copan MercadoLibre y el término significa *wayuu / mola / cuero*. Un bolso impreso en 3D no es eso: traería visitas que rebotan. **Descartado como objetivo.**
2. **"Bolso impreso en 3D" está vacío en Colombia.** Solo hay marcas internacionales (XYZBAG, NODOS, Coperni). **Es el eje de la estrategia.**
3. **El producto coincide con la tendencia 2026**: mini bolsos, formas esculturales, media luna. Ahí está el volumen.

⚠️ **Riesgo de marca:** existen negocios con nombre casi idéntico, uno **colombiano y del mismo rubro** (*La Marqueza Equestrian*), además de *Boutique Marquesa Style* y *@UniformesLaMarquessa*. Táctica: no competir por "La Marquessa" a secas, sino anclarla siempre a *"bolsos impresos en 3D"*. Conviene revisar disponibilidad de marca en la SIC.

---

## 5. Qué FALTA — por fases

### 🔄 Fase 2 — Contenido (~25%)
- [ ] **Página FAQ** con schema `FAQPage` ← **la más importante**
- [ ] Guías: "cómo cuidar un bolso impreso en 3D", "regalo que no se puede repetir"
- [ ] Página de contacto
- [ ] Legales: envíos, cambios/devoluciones (derecho de retracto), términos
- [ ] Reescribir el copy del sitio con el tono de marca

### ⚠️ Fase 3 — Conversión (~30%)
- [ ] **Checkout real con Mercado Pago** (hoy `/checkout` es un stub que NO cobra)
- [ ] CTA fijo (sticky) en móvil en la ficha de producto
- [ ] Escasez honesta (numeración de pieza)
- [ ] Prueba social (firma de la diseñadora, taller, contenido de influencers)
- [ ] Foto macro de la textura 3D (el diferenciador que hoy no se ve)
- [ ] Eventos de analítica: `view_product`, `whatsapp_click`, `instagram_click`, `faq_open`, `scroll_50`
- [ ] Banner de consentimiento de cookies (Consent Mode)

### ⚠️ Fase 4 — Rendimiento (~40%)
- [ ] `srcset` responsive (400/800/1200/1600)
- [ ] Autoalojar las 3 fuentes de Google (Jost, Cormorant, Pinyon)
- [ ] **Medir Core Web Vitals** (nunca se han medido)

### ⚠️ Fase 5 — Accesibilidad (~35%)
- [ ] Navegación completa por teclado con foco visible
- [ ] Probar en 320 / 390 / 768 / 1440 px

### ❌ Fase 6 — Verificación (0%)
- [ ] Lighthouse móvil (objetivo ≥95 SEO y Accesibilidad, ≥90 Rendimiento)
- [ ] Validar JSON-LD con Rich Results Test
- [ ] Capturas a 390px
- [ ] `CAMBIOS.md`

---

## 6. 🚧 Bloqueado esperando al usuario

| Qué falta | Consecuencia |
|---|---|
| **Etiqueta GA4 dentro de GTM** (en tagmanager.google.com, y publicar) | GTM carga pero **no mide nada** |
| **Razón social, NIT, domicilio, teléfono** | La política legal queda incompleta (`[pendiente]` en la página) |
| **`NEXT_PUBLIC_SITE_URL`** en Vercel | Funciona con el valor por defecto, pero conviene |
| **Borrar/redirigir el proyecto `lamarquessa-landing` en Vercel** | El sitio viejo sigue vivo y **compite en Google** (contenido duplicado) |
| Credenciales de **Mercado Pago** | No se puede cobrar |
| Colores reales del acabado **Horizonte** | Muestra provisional |
| **Peso** de cada bolso, **costo y tiempo de envío** | Datos faltantes en fichas y schema |
| Número real de **WhatsApp** y correo | Hoy son placeholders (`573000000000`, `hola@lamarquessa.co`) |
| Developer token de **Google Ads** (requiere cuenta MCC, 1-3 días) | Sin volúmenes de búsqueda reales |

---

## 7. Reglas de trabajo acordadas

- **No inventar datos.** Precios, plazos, medidas, reseñas: si no está dado, marcar `[PENDIENTE: dato]` y preguntar.
- **Nunca generar `AggregateRating` ni `Review` falsos.**
- Commits atómicos, **uno por fase**, en español.
- **No borrar nada sin listarlo antes.**
- Al terminar cada fase: resumen breve y **esperar** antes de seguir.
- Verificar de verdad (build, curl del HTML servido, navegador) en vez de asumir.
- **PowerShell** para node/pnpm/convex. Ojo: `Set-Content` corrompió acentos una vez (releyó UTF-8 como ANSI) — usar las herramientas de edición, no PowerShell, para escribir archivos de código.

---

## 8. Gotchas técnicos

- **Next 16**: `params` es `Promise` (hay que `await`).
- **Tailwind 4**: `@theme` en CSS, no `tailwind.config`.
- **Convex**: cambios de funciones requieren `npx convex dev` (dev) o `npx convex deploy` (prod). Las variables de entorno **no se copian** entre dev y prod.
- **turbo.json**: las variables de entorno deben declararse en `build.env` o Vercel avisa que no llegan.
- El error de hidratación `cz-shortcut-listen` lo causa una **extensión del navegador**, no el código (ya silenciado con `suppressHydrationWarning`).
- **gh CLI**: `C:\Users\crist\AppData\Local\Programs\gh\bin\gh.exe` (no está en el PATH).
