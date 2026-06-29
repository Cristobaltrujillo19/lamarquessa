# La Marquessa

Monorepo del sitio de La Marquessa: una marca costera de accesorios.
"Un sueño tejido por las olas."

## Estructura

```
lamarquessa/
├── apps/
│   ├── landing/      Astro — la página de marca (lamarquessa.co)
│   └── storefront/   Next.js — la tienda (shop.lamarquessa.co)  ← fase 2
├── packages/         código compartido (vacío por ahora)
├── pnpm-workspace.yaml   le dice a pnpm cuáles carpetas son proyectos
└── turbo.json            le dice a Turborepo cómo correr tareas
```

## Comandos (desde esta carpeta)

| Comando | Qué hace |
| --- | --- |
| `pnpm install` | Instala dependencias de todas las apps |
| `pnpm dev` | Levanta las apps (landing en http://localhost:4321) |
| `pnpm dev:landing` | Levanta solo la landing |
| `pnpm build` | Compila todo (Turborepo cachea) |

## Despliegue (Vercel)

Cada app se despliega como su **propio proyecto de Vercel** apuntando a este repo:

1. Proyecto de Vercel con **Root Directory** = `apps/landing` → dominio `lamarquessa.co`.
2. (Fase 2) Segundo proyecto, Root Directory `apps/storefront` → `shop.lamarquessa.co`.
3. En el proyecto de la landing, variable `PUBLIC_SHOP_URL=https://shop.lamarquessa.co`.

## Pendiente de la marca (reemplazar placeholders)

- **Contacto:** WhatsApp, Instagram y correo reales en `apps/landing/src/lib/site.ts`.
- **Colección:** piezas reales (fotos, precios, variantes) en `apps/landing/src/lib/coleccion.ts`.
- **Tipografías:** si hay licencia de *Beauty Angelique* y *Queen Serif*, reemplazan a las
  equivalentes web (Pinyon Script + Cormorant Garamond) cargadas en `Base.astro`.
- **Dominio:** ajustar `site` en `apps/landing/astro.config.mjs`.
