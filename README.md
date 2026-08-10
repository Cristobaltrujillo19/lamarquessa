# La Marquessa

Marca colombiana de **bolsos de autor impresos en 3D y hechos a mano**.
"Un sueño tejido por las olas."

**En vivo:** https://lamarquessa.co

## Estructura

```
lamarquessa/
├── apps/
│   └── storefront/   Next 16 + React 19 + Tailwind 4 + Convex (tienda + panel)
├── packages/          código compartido (vacío por ahora)
├── pnpm-workspace.yaml
└── turbo.json
```

La landing en Astro (`apps/landing`) fue absorbida por `storefront` durante
Fase 1: hoy todo el sitio vive en un solo proyecto de Next.

## Comandos (desde la raíz)

| Comando | Qué hace |
| --- | --- |
| `pnpm install` | Instala dependencias |
| `pnpm -C apps/storefront dev` | Levanta el sitio en http://localhost:3000 |
| `pnpm build` | Compila (Turborepo cachea) |

Convex (backend de datos):

| Comando | Qué hace |
| --- | --- |
| `npx convex dev --once` | Propaga schema y funciones a dev (`agreeable-buzzard-367`) |
| `npx convex deploy -y` | Despliega a producción (`hearty-lemur-822`) |

**Regla crítica:** cambios en `apps/storefront/convex/**` requieren
`npx convex deploy -y` a mano antes del `git push`. Vercel no lo corre.

## Despliegue

- **Vercel** (Root Directory `apps/storefront`) → dominio propio
  `https://lamarquessa.co` (apex canónico; `www` redirige al apex).
- Un middleware en `apps/storefront/middleware.ts` devuelve 301 a
  `lamarquessa.co` para cualquier host distinto (así la URL antigua del
  proyecto en Vercel no compite en Google).
- Variables de entorno en Vercel Production: `NEXT_PUBLIC_SITE_URL`,
  `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `PANEL_PASSWORD`, y en
  Convex prod: `ADMIN_API_SECRET`, `MP_ACCESS_TOKEN`, `SITE_URL`,
  `GMAIL_USER`, `GMAIL_APP_PASSWORD`.

## Documentación complementaria

- `ESTADO.md` — handoff para la próxima sesión.
- `AUDITORIA.md` — auditoría inicial del sitio (histórica).
- `SEO-KEYWORDS.md` — investigación de keywords y estrategia.
- `PROMPT-INICIO.md` — prompt de arranque de sesión.
