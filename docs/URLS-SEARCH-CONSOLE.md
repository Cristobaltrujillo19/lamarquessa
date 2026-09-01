# URLs de lamarquessa.co — para Google Search Console

Generado el 31 de agosto de 2026, verificado contra producción.

**Propiedad a dar de alta:** `https://lamarquessa.co`
**Sitemap a enviar:** `sitemap.xml` (ruta relativa; GSC completa el dominio)

---

## 1. Las 11 URLs indexables

Estas son las que están en el sitemap y las que quieres ver indexadas. Todas
responden `200`, llevan `canonical` propio y ninguna tiene `noindex`.

```
https://lamarquessa.co/
https://lamarquessa.co/tienda
https://lamarquessa.co/nosotros
https://lamarquessa.co/preguntas-frecuentes
https://lamarquessa.co/envios
https://lamarquessa.co/contacto
https://lamarquessa.co/privacidad
https://lamarquessa.co/producto/menorca
https://lamarquessa.co/producto/mallorca
https://lamarquessa.co/producto/kruta
https://lamarquessa.co/producto/montt
```

### Qué es cada una

| URL | Qué es | Prioridad | Frecuencia |
|---|---|---|---|
| `/` | Portada | 1.0 | semanal |
| `/tienda` | Colección, las 4 piezas | 0.9 | semanal |
| `/producto/menorca` | Ficha · 210.000 COP | 0.8 | semanal |
| `/producto/mallorca` | Ficha · 255.000 COP | 0.8 | semanal |
| `/producto/kruta` | Ficha · 230.000 COP | 0.8 | semanal |
| `/producto/montt` | Ficha · 195.000 COP | 0.8 | semanal |
| `/nosotros` | Historia de la marca | 0.7 | mensual |
| `/preguntas-frecuentes` | 15 preguntas, con schema FAQPage | 0.7 | mensual |
| `/envios` | Plazos y devoluciones | 0.6 | mensual |
| `/contacto` | WhatsApp y correo | 0.6 | mensual |
| `/privacidad` | Ley 1581 | 0.2 | anual |

---

## 2. Las que NO deben indexarse

No las envíes a Search Console. Están excluidas en `robots.txt`.

```
https://lamarquessa.co/carrito
https://lamarquessa.co/checkout
https://lamarquessa.co/gracias
https://lamarquessa.co/pago-fallido
https://lamarquessa.co/panel
```

Son el embudo de compra y la trastienda: no aportan nada en buscadores y
compiten con las páginas que sí venden.

---

## 3. Orden para inspeccionar en GSC

Con cuota limitada de inspección manual, este es el orden que rinde:

1. `/` — sin la portada, nada más importa
2. Las cuatro fichas de producto — son las que convierten
3. `/tienda`
4. `/preguntas-frecuentes` — la que puede ganar fragmentos enriquecidos
5. El resto

---

## 4. Qué revisar una vez dada de alta

- **Cobertura**: que las 11 salgan como *Válidas*. Si alguna sale como
  «Rastreada, actualmente sin indexar», suele ser cuestión de tiempo en un
  dominio nuevo.
- **Mejoras → Fragmentos de producto**: las cuatro fichas emiten JSON-LD
  `Product` con precio real, `InStock`, 14 días de fabricación y 2 de
  tránsito. Deberían aparecer aquí.
- **Mejoras → Preguntas frecuentes**: `/preguntas-frecuentes` emite `FAQPage`.
- **Experiencia → Core Web Vitals**: nunca se han medido. Este es el primer
  sitio donde vas a ver datos de campo reales.

---

## 5. Dos cosas que conviene arreglar

### El `noindex` de /gracias y /pago-fallido no se puede leer

Esas dos páginas llevan `<meta name="robots" content="noindex, nofollow">`
**y además** están bloqueadas en `robots.txt`. Las dos cosas juntas se
estorban: si Google no puede rastrear la página, tampoco puede leer el
`noindex` que le pide no indexarla.

En la práctica no pasa nada mientras nadie las enlace desde fuera. Si alguna
vez aparecen en GSC como indexadas sin descripción, la solución es quitarlas
del `Disallow` y dejar que el `noindex` haga su trabajo.

`/carrito` y `/checkout` están solo bloqueadas por `robots.txt`, sin
`noindex`. Mismo razonamiento.

### El H1 de la portada está en inglés

*"Colombian statement pieces inspired by the sea."* Es una decisión de marca,
pero conviene saber que va en contra del eje SEO del proyecto: **«bolso
impreso en 3D» está vacío en Colombia y es la oportunidad real**. La portada
no compite por esa consulta hoy.

---

## 6. Cuando cambie el catálogo

El sitemap se arma solo desde Convex: si publicas u ocultas un bolso en el
panel, entra o sale sin tocar código. No hay que regenerar nada a mano.

Lo que **sí** hay que hacer al añadir una ruta nueva es darla de alta en
`apps/storefront/app/sitemap.ts`. Las rutas fijas están escritas a mano, y
por eso `/envios` y `/contacto` llevaban meses fuera del sitemap.
