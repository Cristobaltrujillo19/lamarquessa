# -*- coding: utf-8 -*-
"""
Baja las cinco familias de Google Fonts al repo, para que el BUILD no dependa
de la red.

Por qué existe: ver §28 del ESTADO. `next/font/google` se trae las fuentes en
tiempo de compilación, y su cargador da por hecho que toda URL que saca del CSS
de Google termina en la extensión (`exec(url)[1]`, sin comprobar). Cuando
Google responde otra cosa —cosa que pasa desde una IP de datacenter, que es
justo lo que hace Vercel en un build en frío— revienta con un `TypeError` a
cinco niveles de profundidad y el despliegue se cae. Pasó en dos de tres
pushes seguidos.

Con las fuentes dentro del repo el build no habla con Google. Lo que recibe el
visitante es lo mismo: los MISMOS ficheros woff2, servidos desde el dominio.

⚠️ Solo el subconjunto `latin`, que es lo que ya pedía `subsets: ["latin"]`.
Cubre el español entero (á é í ó ú ñ ü ¿ ¡ viven en U+0000–00FF).

⚠️ Hay que pedirlo con cabecera de navegador moderno, o Google devuelve TTF en
vez de woff2 y los ficheros pesan el triple.

Uso:
    python scripts/bajar-fuentes.py
"""
import hashlib
import os
import re
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "apps", "storefront", "app", "fuentes")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

# (carpeta, consulta css2, nº de caras latin que se esperan)
# Los pesos y estilos son EXACTAMENTE los que declaraba layout.tsx: ni uno más,
# para no meter en el repo cursivas que nadie pinta.
FAMILIAS = [
    ("jost", "Jost:wght@300;400;500", 3),
    ("cormorant-garamond",
     "Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500", 4),
    ("pinyon-script", "Pinyon+Script:wght@400", 1),
    ("fraunces", "Fraunces:ital,wght@0,400;0,500;1,400;1,500", 4),
    ("archivo", "Archivo:wght@400;500", 2),
]

BLOQUE = re.compile(
    r"/\*\s*([a-z0-9-]+)\s*\*/\s*@font-face\s*\{(.*?)\}", re.S | re.I)


def pedir(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def caras_latin(css):
    """Las @font-face del subconjunto `latin`, en orden.

    Google emite un bloque por subconjunto (cyrillic, griego, vietnamita,
    latin-ext, latin) precedido de un comentario con su nombre. Nos quedamos
    solo con `latin`: el resto son kilobytes que esta tienda no pinta.
    """
    caras = []
    for nombre, cuerpo in BLOQUE.findall(css):
        if nombre.strip().lower() != "latin":
            continue
        url = re.search(r"url\((https://[^)]+)\)", cuerpo)
        if not url:
            continue
        peso = re.search(r"font-weight:\s*([^;]+);", cuerpo)
        estilo = re.search(r"font-style:\s*([^;]+);", cuerpo)
        caras.append({
            "url": url.group(1),
            "peso": peso.group(1).strip() if peso else "400",
            "estilo": estilo.group(1).strip() if estilo else "normal",
        })
    return caras


os.makedirs(DESTINO, exist_ok=True)
for viejo in os.listdir(DESTINO):
    if viejo.endswith(".woff2"):
        os.remove(os.path.join(DESTINO, viejo))

total = 0
resumen = []

for carpeta, consulta, esperadas in FAMILIAS:
    url = "https://fonts.googleapis.com/css2?family=%s&display=swap" % consulta
    caras = caras_latin(pedir(url).decode("utf-8"))

    if len(caras) != esperadas:
        print("AVISO %s: Google devolvio %d caras latin y se esperaban %d."
              % (carpeta, len(caras), esperadas))
        print("      Revisalo a mano antes de dar esto por bueno.")

    # Las cinco son fuentes VARIABLES: Google sirve UN woff2 por (familia,
    # estilo) que ya trae dentro todo el rango de pesos, y repite esa misma URL
    # para cada peso que le pidas. Comprobado por hash: de 14 descargas salen 7
    # ficheros distintos. Guardar uno por peso duplicaria 240 KB en el repo
    # para nada, asi que se agrupan por contenido y en layout.tsx se declara el
    # RANGO de pesos en vez de uno suelto.
    por_contenido = {}
    for cara in caras:
        datos = pedir(cara["url"])
        if not datos.startswith(b"wOF2"):
            raise SystemExit("%s no es woff2 (empieza por %r). Revisa el UA."
                             % (carpeta, datos[:4]))
        clave = hashlib.sha256(datos).hexdigest()
        if clave not in por_contenido:
            sufijo = "-italic" if cara["estilo"] == "italic" else ""
            por_contenido[clave] = {
                "nombre": "%s%s.woff2" % (carpeta, sufijo),
                "estilo": cara["estilo"],
                "pesos": [],
                "datos": datos,
            }
        por_contenido[clave]["pesos"].append(int(cara["peso"]))

    for e in por_contenido.values():
        with open(os.path.join(DESTINO, e["nombre"]), "wb") as f:
            f.write(e["datos"])
        lo, hi = min(e["pesos"]), max(e["pesos"])
        rango = str(lo) if lo == hi else "%d %d" % (lo, hi)
        total += len(e["datos"])
        resumen.append((e["nombre"], rango, e["estilo"]))
        print("%-32s peso %-9s %-7s %6.1f KB"
              % (e["nombre"], rango, e["estilo"], len(e["datos"]) / 1024))

print("")
print("%d ficheros, %.0f KB -> %s"
      % (len(resumen), total / 1024, os.path.relpath(DESTINO, RAIZ)))
print("")
print("Para layout.tsx:")
for nombre, rango, estilo in resumen:
    print('  { path: "./fuentes/%s", weight: "%s", style: "%s" },'
          % (nombre, rango, estilo))
