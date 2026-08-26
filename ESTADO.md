# ESTADO — La Marquessa · Handoff para la próxima sesión

Última actualización: **25 de agosto de 2026**
Rama activa: **`feat/nueva-interfaz`** — porting de la interfaz nueva, terminado
y pendiente de revisión. `main` sigue en `b150351` sirviendo producción.

> ⚠️ **Antes de tocar nada, lee `docs/HANDOFF-INVENTARIO-ANALITICA.md`.** Es el
> contrato de los 17 eventos de analítica que no se pueden romper, y trae la
> verificación de paridad del porting.

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

**Acabados (3):** Amanecer `#e8bca6` (rosa nude) · Caribe `#bcc1d2` (azul con destellos) · **Horizonte** (bicolor negro `#111111` + rojo `#b3121a`, seda; se pinta partido en diagonal con `muestraColor()`).

**Material:** PLA de proveedor colombiano. **El proveedor NO se menciona en la web.**

### Personalización

Dos formas: color específico o iniciales en la parte inferior. Se cotiza al momento por WhatsApp. Las piezas personalizadas no aceptan cambio ni retracto.

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
- **Google Tag Manager** `GTM-P76W5D68` cargado (falta cablear GA4 dentro de GTM).
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

- **Next 16**: `params` es `Promise` (hay que `await`).
- **Tailwind 4**: `@theme` en CSS, no `tailwind.config`. Para valores arbitrarios con variables CSS: `top-[var(--x)]`, no `top-[--x]`.
- **Convex**: cambios de funciones requieren `npx convex dev` (dev) o `npx convex deploy` (prod). Vars de entorno NO se copian entre dev y prod.
- **turbo.json**: las variables de entorno deben declararse en `build.env` o Vercel avisa que no llegan.
- **gh CLI**: `C:\Users\crist\AppData\Local\Programs\gh\bin\gh.exe` (no está en el PATH).
- **Gmail SMTP**: `GMAIL_USER` + `GMAIL_APP_PASSWORD` (contraseña de app de Google, requiere 2FA activo). Los correos se auto-desactivan si faltan.
- **Los correos usan constantes duplicadas** para el WhatsApp (`correoCliente.ts` y `correoEnvio.ts`) porque `"use node"` no puede importar de `lib/site.ts`. Si el WhatsApp cambia, hay que tocarlo en los 3 sitios.

---

## 10. Últimas cosas hechas (sesión que termina 2026-08-10)

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
f2e4ccf  Middleware: 301 desde subdominios de Vercel al dominio propio
0b5bee6  Ficha de producto: subtitulo H2 con keywords de moda y descripciones enriquecidas
719f134  Handout de sesión: ESTADO.md actualizado + PROMPT-INICIO.md
c9f5b02  Ficha de producto: CTA fijo en móvil + selectores de color a 44px táctil
ceff9b0  Titulos partidos: espacio antes del <br /> para no pegar palabras
```

---

## 12. Porting de la interfaz nueva (rama `feat/nueva-interfaz`)

Implementación del mockup aprobado (`../LM_MOCKUP`) sobre la tienda viva,
siguiendo `HANDOFF-IMPLEMENTACION.md` de ese repositorio.

### Qué está portado

Sistema de diseño, cabecera, pie, y las siete rutas: home, `/tienda`,
`/producto/[slug]`, `/nosotros`, `/envios`, `/contacto`, `/carrito` y
`/checkout`.

Los tokens del mockup viven **encapsulados bajo `.ui-v2`** en
`app/globals-v2.css`, porque colisionan por nombre con los de producción
(`--crema`, `--cobre`, `--cobre-texto` existen en los dos con valores
distintos). Cada página portada se envuelve en `<div className="ui-v2">`.

**Al terminar la revisión**: promover esos tokens a `:root`, borrar los viejos
de `globals.css` y quitar los wrappers, todo en un mismo commit.

### Decisiones que siguen esperando al dueño de la marca

| Qué | Consecuencia hoy |
|---|---|
| **Desde qué número arranca la numeración de piezas** | El "elemento firma" (`Nº 042 · única en el mundo`) no se pinta. El campo `serie` ya está en el schema para activarlo sin migración |
| **Licenciar la tipografía Queens para web** | La display es Queen Serif FREE con Fraunces cubriendo acentos y eñes por fallback por-glifo |
| **Fotos de Manglar y Marea** | Los dos acabados se pueden comprar pero no aparecen en el filtro de la colección, y su panel de referencia dice "Referencia pendiente" |
| **Horario de atención** | Único marcador PENDIENTE visible del sitio, en `/contacto` |
| **El vídeo del hero lleva "La Marquessa" incrustado** | Compite con el H1. Anotado desde el mockup, sin resolver |
| **Nav y pie usan logos distintos sobre el mismo fondo** | `logo-cobre` arriba, `logo-claro` abajo, ambos sobre `--tinta` |
| **Testimonios, destinos entregados y publicaciones de Instagram** | `PruebaSocial` y `CarruselInstagram` NO se portaron: se auto-ocultan sin datos y habrían sido dos componentes que renderizan nada |

### Colores del catálogo

Pasó de 3 a 5 acabados, con los hex del sistema de diseño aprobado. **Siguen
siendo aproximaciones a una descripción verbal: nadie ha medido una pieza
física con luz neutra.** Recalibrar antes de usarlos en material impreso.

El salto más visible respecto a lo que había: Caribe pasó de un gris lavanda
`#bcc1d2` a un turquesa `#2C8CA8`.

### Antes de fusionar a `main`

1. Revisar la rama en un despliegue de vista previa de Vercel.
2. **Prueba de compra real con cupón**, que sigue siendo el bloqueador de
   siempre: el Convex de desarrollo no tiene `MP_ACCESS_TOKEN`, así que el
   `purchase` de una compra verdadera nunca se ha visto de principio a fin.
3. Confirmar en el DebugView de GA4 y en el Meta Pixel Helper que los 17
   eventos siguen llegando desde el despliegue de vista previa.
