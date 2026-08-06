# Prompt de inicio para la próxima sesión

Cópialo y pégalo tal cual como primer mensaje al abrir una sesión nueva de Claude Code en este proyecto.

---

## Prompt

Continúo el proyecto web de La Marquessa (marca colombiana de bolsos impresos en 3D, hechos a mano). El checkout con Mercado Pago está en vivo, la FAQ publicada, y el sitio pasó una auditoría móvil completa.

Antes de proponer o tocar nada, lee estos cuatro archivos en la raíz del repo
`C:\Users\crist\Documents\random proyects\La Marquesa\lamarquesa`:

1. `ESTADO.md`      — dónde estamos, qué falta, qué está bloqueado
2. `AUDITORIA.md`   — la auditoría inicial y las decisiones tomadas
3. `SEO-KEYWORDS.md` — la investigación de keywords y la estrategia
4. `README.md`      — si tiene contenido, es orientativo

Tu memoria del proyecto (`lamarquessa-storefront`, `lamarquessa-proyecto`) también tiene el estado actual — úsala como punto de partida.

**Resumen**: el objetivo del sitio es VENDER. Ya está en producción con Mercado Pago funcionando, correo por Gmail SMTP, panel de operaciones, y todo el catálogo real. El sitio pasa auditoría móvil (menú hamburguesa, CTA fijo, tap targets 44×44).

**Lo que sigue, por orden acordado:**

1. **Fase 3 conversión (parcial)** — escasez honesta con numeración de pieza (decisión pendiente: ¿desde qué número empiezo?), prueba social (bloqueada por material tuyo).
2. **Cerrar bloqueadores para vender**: rotar `ADMIN_API_SECRET`, prueba real con cupón para verificar webhook, GA4 dentro de GTM, datos legales de la empresa.
3. **Fase 4 rendimiento**: srcset responsive, medir Core Web Vitals.
4. **Fase 6 verificación**: Lighthouse móvil, Rich Results Test.

**Reglas** (no negociables):

- **No inventar datos** (precios, plazos, medidas, reseñas). Si falta, marcar `[PENDIENTE: dato]` y preguntar.
- Nunca generar `AggregateRating` ni reseñas falsas.
- Commits atómicos en español, uno por tema.
- **Convex prod se despliega A MANO** — orden obligatorio cuando toque backend: `npx convex deploy -y` → verificar con `function-spec --prod` → `git push`. Vercel NO corre `convex deploy`.
- No borrar nada sin listarlo antes.
- Al terminar cada fase: resumen breve y esperar antes de seguir.
- PowerShell para node/pnpm/convex.
- Verificar de verdad (build, medición del DOM, navegador) en vez de asumir.
- Para pasar JSON a `npx convex run` desde PowerShell: comillas dobles por fuera y simples por dentro — `"{secret:'$s'}"`.

Empieza confirmando qué encontraste en `ESTADO.md`, la memoria, y decime por dónde quieres retomar.

---

## Notas para ti (dueño), no para Claude

- La cuenta Mercado Pago se llama **"Amor y Brillitos"** (paraguas SER + La Marquessa) — verificable en la pasarela y con `Invoke-RestMethod` a `api.mercadopago.com/users/me`.
- El WhatsApp real es `573332779109`, correo `info.lamarquessa@gmail.com`.
- Todo lo demás (variables, credenciales, secretos) vive en Convex prod o en Vercel — nunca las pegues en el chat.
