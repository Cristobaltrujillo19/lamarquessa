# SEO-KEYWORDS — La Marquessa

Investigación de términos para el comprador colombiano. Fecha: 2026-07-28.

**Sobre los volúmenes:** este documento **no trae cifras de volumen de búsqueda**, porque todavía no hay acceso a Google Keyword Planner (falta el developer token de la API de Google Ads) ni a DataForSEO. Las cifras inventadas son peores que ninguna cifra, así que van marcadas `[PENDIENTE: volumen]`. Todo lo demás —intención, competencia real, SERP y mapeo a páginas— sí está verificado buscando.

Regla que se respeta en todo el documento: **una intención = una página**. Ningún término está asignado a dos páginas (sin canibalización).

---

## 0. Tres hallazgos que cambian la estrategia

### 0.1 "Bolsos artesanales Colombia" es una trampa

Es el término obvio, y es el equivocado. Al buscarlo, la SERP colombiana devuelve:

- **MercadoLibre** ocupando los tres primeros resultados (imposible de desbancar a corto plazo).
- Y sobre todo: el término significa **otra cosa** para el usuario. "Artesanal" en Colombia evoca **mochilas wayuu, molas y arhuacas** — tejido indígena a crochet — o **cuero** (Vélez, Mario Hernández, Artencuero, ZUHA).

Un bolso impreso en 3D no es ninguna de las dos. Rankear ahí traería visitas que rebotan porque esperaban otra cosa. **Se descarta como objetivo principal**, aunque se usa como término secundario donde encaja ("hecho a mano" sí es literal en nuestro caso).

### 0.2 "Bolso impreso en 3D" está casi vacío en Colombia

Al buscar el término, los resultados son **internacionales y escasos**: XYZBAG (Italia), NODOS (Madrid), Coperni x Disney, y repositorios de modelos STL (Cults3D, MakerWorld). **No aparece ninguna marca colombiana vendiendo bolsos impresos en 3D.**

Esto es exactamente lo que el brief anticipaba: baja competencia, alta intención, y aquí se gana rápido. **Es el eje central de toda la estrategia.**

### 0.3 El producto está justo sobre la tendencia 2026

La prensa de moda para primavera-verano 2026 describe: **mini bolsos, formas esculturales, siluetas estructuradas, formas geométricas, bolsos media luna y bucket bags reinterpretados**.

Menorca, Mallorca, Kruta y Montt son literalmente eso. Es una veta de tráfico con demanda real y sin la carga de "artesanal = wayuu".

---

## 1. ⚠️ Riesgo de marca: el nombre está disputado

Al buscar la marca aparecen varios negocios con nombre casi idéntico, **varios de ellos vendiendo bolsos**:

| Quién | Dónde | Riesgo |
|---|---|---|
| **La Marqueza Equestrian** | lamarquezaequestrian.com | **Alto** — marca **colombiana** de marroquinería fundada en 2019. Mismo país, mismo producto, nombre casi igual |
| **LA MARQUESA (Boutique Marquesa Style)** | boutiquemarquesastyle.com | Alto — tiene página `/collections/bolsos` |
| **La Marquesa** | lamarquesa.cl | Medio — Chile, vende bolsos y mochilas |
| **@UniformesLaMarquessa** | Facebook | Medio — **usa la grafía de dos eses** |
| **Sra Marquesa Bolsos Artesanales** | Instagram | Bajo |

**Qué significa:** la búsqueda de marca no será un paseo. Nadie "posee" el nombre todavía en Google, pero hay que ganárselo.

**Qué hacer:**
1. Ser **implacablemente consistente** con "La Marquessa" (ya hecho en Fase 1: `Organization` schema con `alternateName`).
2. **Anclar la marca a su diferenciador** en todos los títulos: no competimos por "La Marquessa" a secas, sino por *"La Marquessa bolsos impresos en 3D"*, que nadie disputa.
3. El handle `@lamarquessa.co` ya es coherente; conviene asegurar el mismo nombre en el resto de redes.
4. `[PENDIENTE: decisión]` Vale la pena revisar disponibilidad de marca registrada en la SIC, dado el parecido con La Marqueza Equestrian (marca colombiana activa del mismo rubro).

---

## 2. Mapa de keywords → páginas

Estado: ✅ existe · 🔨 hay que crearla

### 2.1 Diferenciador — la prioridad (baja competencia, alta intención)

| Término | Intención | Página objetivo | Estado |
|---|---|---|---|
| bolso impreso en 3D | Comercial / investigación | `/` (home) | ✅ |
| bolsos impresos en 3D Colombia | Transaccional | `/` (home) | ✅ |
| bolsos diseño 3D Colombia | Comercial | `/tienda` | ✅ |
| cómo se hace un bolso impreso en 3D | Informacional | `/nosotros` | ✅ |
| bolso impresión 3D y hecho a mano | Comercial | `/nosotros` | ✅ |
| bolso pieza única hecha a mano | Comercial | `/tienda` | ✅ |

`[PENDIENTE: volumen]` para todos. **Nota realista:** el volumen aquí probablemente sea **bajo** (es una categoría naciente en Colombia). Su valor no es el tráfico bruto, sino que **la intención es altísima y no hay competencia**: quien busca esto quiere exactamente lo que vendemos.

### 2.2 Tendencia / forma — el tráfico de volumen

| Término | Intención | Página objetivo | Estado |
|---|---|---|---|
| mini bolso de mano mujer | Comercial | `/tienda` | ✅ |
| bolso escultural | Comercial | `/tienda` | ✅ |
| bolso media luna | Comercial | `/producto/montt` | ✅ |
| bolso de mano pequeño para salir | Comercial | `/producto/kruta` | ✅ |
| bolso rígido pequeño | Comercial | `/producto/menorca` | ✅ |
| bolsos tendencia 2026 mujer | Informacional | 🔨 guía de blog | 🔨 |

### 2.3 Transaccional general

| Término | Intención | Página objetivo | Estado |
|---|---|---|---|
| comprar bolso único mujer Colombia | Transaccional | `/tienda` | ✅ |
| bolsos de diseño Colombia | Comercial | `/tienda` | ✅ |
| bolsos hechos a mano mujer Colombia | Comercial | `/tienda` | ✅ |
| bolsos exclusivos mujer Colombia | Comercial | `/tienda` | ✅ |

⚠️ **Deliberadamente NO objetivo:** `bolsos artesanales Colombia`, `mochilas wayuu`, `carteras de cuero`. Alta competencia + intención equivocada (ver 0.1).

### 2.4 Producto — una página por bolso

| Término | Página | Estado |
|---|---|---|
| bolso Menorca La Marquessa | `/producto/menorca` | ✅ |
| bolso Mallorca La Marquessa | `/producto/mallorca` | ✅ |
| bolso Kruta La Marquessa | `/producto/kruta` | ✅ |
| bolso Montt La Marquessa | `/producto/montt` | ✅ |

Cada ficha ya tiene título único, `Product` schema con precio real y descripción propia (Fase 1).

### 2.5 Informacional / captación temprana

| Término | Intención | Página objetivo | Estado |
|---|---|---|---|
| ¿es resistente un bolso impreso en 3D? | Informacional | 🔨 `/preguntas-frecuentes` | 🔨 |
| ¿qué es el PLA? ¿es ecológico? | Informacional | 🔨 `/preguntas-frecuentes` | 🔨 |
| cómo cuidar un bolso impreso en 3D | Informacional | 🔨 guía | 🔨 |
| qué es un bolso de edición única | Informacional | 🔨 guía | 🔨 |
| regalo original para mujer Colombia | Comercial | 🔨 guía de regalo | 🔨 |

**Nota sobre "regalo original para mujer Colombia":** la SERP está copada por listicles genéricos y grandes retailers (Falabella, Vélez). Se puede entrar con un ángulo honesto y específico: *"un regalo que no se puede repetir"* — que es literalmente cierto aquí y nadie más puede decirlo.

### 2.6 Marca (incluye errores de escritura)

| Término | Página | Estado |
|---|---|---|
| La Marquessa | `/` | ✅ |
| La Marquesa bolsos (una s) | `/` vía `alternateName` | ✅ |
| La Marquessa Colombia | `/` | ✅ |
| lamarquessa.co | `/` | ✅ |

Ya cubierto en Fase 1 con `Organization` + `alternateName`.

---

## 3. Páginas que faltan (derivadas de esta investigación)

Ordenadas por impacto:

1. **`/preguntas-frecuentes`** — Responde las objeciones reales de compra (¿resiste?, ¿cuánto pesa?, ¿cabe el celular?, ¿cuánto tarda?, ¿puedo devolverlo?) y captura búsquedas informacionales. Con schema `FAQPage`. **Es también lo que más citan los buscadores con IA.**
2. **Guía: cómo cuidar un bolso impreso en 3D** — Nadie lo ha escrito para el mercado colombiano. Tráfico informacional + confianza post-compra.
3. **Guía de regalo** — Estacional (día de la madre, diciembre, amor y amistad), ángulo de "pieza irrepetible".
4. **`/contacto`** — Confianza y señal local.
5. **Legales**: envíos, cambios y devoluciones (derecho de retracto), términos.

---

## 4. Cómo se completan los volúmenes después

Sin rehacer nada:

- **Google Keyword Planner** — cuando el developer token esté aprobado, la configuración va en `~/.config/claude-seo/google-api.json` (plantilla ya creada). Ojo: da rangos amplios si la cuenta no tiene inversión activa.
- **DataForSEO** — alternativa inmediata, de pago por uso, sin espera de aprobación.

Al llegar los datos, se rellena la columna de volumen y se **re-prioriza**: si "mini bolso de mano" resulta tener 20× el volumen de "bolso impreso en 3D", el peso del contenido se ajusta — pero el eje diferenciador se mantiene, porque es donde se convierte.

---

## 5. Resumen ejecutivo

- **Se gana en** "bolso impreso en 3D" y sus variantes: nadie lo ocupa en Colombia y la intención es perfecta.
- **Se compite en** las formas de tendencia 2026 (mini, escultural, media luna): ahí está el volumen.
- **Se evita** "artesanal/wayuu/cuero": intención equivocada y competencia imbatible.
- **Se vigila** el nombre: hay varias marcas parecidas, una de ellas colombiana y del mismo rubro.
- **Falta crear**: FAQ (prioridad 1), guías de cuidado y regalo, contacto y legales.
