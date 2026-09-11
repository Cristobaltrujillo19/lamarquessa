# -*- coding: utf-8 -*-
"""
Genera las tarjetas de cupón como PNG, listas para mandar por WhatsApp.

1080x1350 (4:5): la proporción vertical que WhatsApp enseña sin recortar en la
vista previa del chat. Más ancha se corta por los lados; cuadrada desperdicia
alto en un teléfono.

⚠️ NO se usa queen-serif.otf, la display real de la marca, aunque sea lo que
más se parecería al sitio. Le faltan la COMA, el PUNTO y el %, y sus vocales
acentuadas están en el cmap pero se dibujan VACÍAS: "María" salía "Maria" y
"Ganaste," salía "Ganaste☒". Estar en el cmap no es tener glifo — comprobarlo
con `getBestCmap` da un falso negativo.

Georgia tiene cobertura completa y cae dentro de la familia de respaldos que
el propio sitio declara para su display (Iowan Old Style, Times New Roman,
serif). Cuando se licencie una Queens completa, se cambia SERIF y ya.

Uso:
    python scripts/tarjetas-premio.py            # todas las campañas
    python scripts/tarjetas-premio.py feria      # solo una
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SERIF = r"C:\Windows\Fonts\georgia.ttf"
SERIF_I = r"C:\Windows\Fonts\georgiai.ttf"
MONO = r"C:\Windows\Fonts\consola.ttf"
MONO_B = r"C:\Windows\Fonts\consolab.ttf"

# El logotipo en su versión CLARA: está hecho para fondos oscuros, que es
# exactamente lo que es la tarjeta. La versión cobre desaparece sobre tinta.
LOGO = os.path.join(RAIZ, "apps", "storefront", "public", "marca", "logo-claro.png")
INSTAGRAM = "@lamarquessa.co"

W, H = 1080, 1350
MARGEN = 64
PAD = 76

FONDO = (47, 32, 22)          # --tinta
TEXTO = (251, 250, 247)       # --espuma
SUAVE = (188, 173, 158)
COBRE = (201, 160, 122)
FILETE = (251, 250, 247, 58)


CAMPANAS = {
    # Premios de la feria de septiembre de 2026. Personales y de un solo uso.
    "feria": {
        "carpeta": "_tarjetas-feria",
        "prefijo": "premio",
        "saludo": "Ganaste,",
        "rotulo": "TU CÓDIGO",
        "vigencia": ["Personal y de un solo uso", "Hasta el 8 de marzo de 2027"],
        "gente": [
            ("Marcela",     "MARCELAB-2K8G",   "iniciales"),
            ("Tefa",        "TEFAM-FY6C",      "iniciales"),
            ("Aleja",       "ALEJAH-RD39",     "iniciales"),
            ("Sara",        "SARAC-CW59",      "iniciales"),
            ("Amalia",      "AMALIAV-Q5D9",    "iniciales"),
            ("María Paula", "MPAULAM-TEBC",    "iniciales"),
            ("Stefany",     "STEFANYC-FJ7S",   "iniciales"),
            ("Emiliana",    "EMILIANAR-FE7D",  "iniciales"),
            ("Mapi",        "MAPI-NPGW",       "descuento"),
            ("Susana",      "SUSANAR-V9WJ",    "descuento"),
            ("Stephanie",   "STEPHANIEA-CZVA", "descuento"),
        ],
        "textos": {
            "iniciales": ["Puedes personalizar la pieza", "que elijas con tus iniciales."],
            "descuento": ["Un 10% sobre tu pedido."],
        },
    },
    # Influencers a las que se les regaló pieza. El código lo comparten con su
    # comunidad, asi que la tarjeta NO habla de un premio ganado: habla de algo
    # que ella reparte.
    "influencers": {
        "carpeta": "_tarjetas-influencers",
        "prefijo": "bono",
        "saludo": "Para tu comunidad,",
        # "EL" y no "TU": el codigo no es suyo, es el que ella regala.
        "rotulo": "EL CÓDIGO",
        "vigencia": ["Para compartir, sin límite de usos", "Hasta el 11 de diciembre de 2026"],
        "gente": [
            ("Conchita", "CONCHITA10", "comunidad"),
            ("Caro",     "CARO10",     "comunidad"),
            ("Paula",    "PAULA10",    "comunidad"),
        ],
        "textos": {
            "comunidad": ["Un 10% en toda la tienda,", "para quien tú quieras."],
        },
    },
}


def espaciado(d, xy, texto, fuente, fill, tracking):
    """Letter-spacing a mano: Pillow no lo trae, y sin él una línea en
    versalitas se ve apelmazada — lo contrario de lo que se lee caro."""
    x, y = xy
    for ch in texto:
        d.text((x, y), ch, font=fuente, fill=fill)
        x += d.textlength(ch, font=fuente) + tracking


def tarjeta(campana, nombre, codigo, tipo, ruta):
    img = Image.new("RGB", (W, H), FONDO)
    d = ImageDraw.Draw(img, "RGBA")

    # Filete interior, como el de una lámina enmarcada. Uno solo: en esta marca
    # la contención es lo que se lee caro, no la ornamentación.
    d.rectangle([MARGEN, MARGEN, W - MARGEN, H - MARGEN], outline=FILETE, width=2)

    izq = MARGEN + PAD
    der = W - MARGEN - PAD
    ancho = der - izq

    # ---------- El logotipo, arriba ----------
    # Sustituye al nombre escrito en versalitas que había antes: teniendo la
    # firma de la marca, escribirla además era decir lo mismo dos veces.
    logo = Image.open(LOGO).convert("RGBA")
    # 400 px y no menos: los filamentos de la L y la M son finísimos, y por
    # debajo de este tamaño se deshacen contra el fondo oscuro.
    logo_w = 400
    logo_h = round(logo.height * (logo_w / logo.width))
    logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
    y_logo = MARGEN + PAD
    img.paste(logo, (izq, y_logo), logo)

    # ---------- Cierre, abajo (se mide primero para poder centrar lo de enmedio) ----------
    base = H - MARGEN - PAD
    f_vig = ImageFont.truetype(MONO, 21)
    f_cod = ImageFont.truetype(MONO_B, 44)
    f_rot = ImageFont.truetype(MONO, 21)

    y_vig2 = base - 24
    y_vig1 = y_vig2 - 32
    y_cod = y_vig1 - 76
    y_rot = y_cod - 44
    y_regla = y_rot - 40

    d.line([izq, y_regla, der, y_regla], fill=FILETE, width=2)
    espaciado(d, (izq, y_rot), campana["rotulo"], f_rot, SUAVE, 5)
    d.text((izq, y_cod), codigo, font=f_cod, fill=COBRE)
    d.text((izq, y_vig1), campana["vigencia"][0], font=f_vig, fill=SUAVE)
    d.text((izq, y_vig2), campana["vigencia"][1], font=f_vig, fill=SUAVE)

    # El @ va a la derecha, alineado al pie: firma la tarjeta sin competir con
    # el código, que es lo único que hay que leer con atención.
    f_ig = ImageFont.truetype(MONO, 23)
    ancho_ig = d.textlength(INSTAGRAM, font=f_ig)
    d.text((der - ancho_ig, y_vig2 - 16), INSTAGRAM, font=f_ig, fill=COBRE)

    # ---------- Bloque central, centrado entre el logotipo y el filete ----------
    # El nombre se encoge si no cabe: "María Paula" es el caso largo.
    tam = 124
    while tam > 58:
        f_nombre = ImageFont.truetype(SERIF, tam)
        if d.textlength(nombre, font=f_nombre) <= ancho:
            break
        tam -= 3
    f_nombre = ImageFont.truetype(SERIF, tam)
    f_saludo = ImageFont.truetype(SERIF_I, 44)
    f_texto = ImageFont.truetype(SERIF, 40)

    lineas = campana["textos"][tipo]
    alto_saludo = 58
    alto_nombre = tam * 1.16
    alto_texto = len(lineas) * 56
    alto_total = alto_saludo + alto_nombre + 34 + alto_texto

    arriba = y_logo + logo_h + 40
    abajo = y_regla - 46
    y = arriba + max(0, (abajo - arriba - alto_total) / 2)

    d.text((izq, y), campana["saludo"], font=f_saludo, fill=SUAVE)
    y += alto_saludo
    d.text((izq, y), nombre, font=f_nombre, fill=TEXTO)
    y += alto_nombre + 34
    for ln in lineas:
        d.text((izq, y), ln, font=f_texto, fill=TEXTO)
        y += 56

    img.save(ruta, "PNG", optimize=True)


def sin_tildes(s):
    for a, b in (("í", "i"), ("á", "a"), ("é", "e"), ("ó", "o"), ("ú", "u"), ("ñ", "n"), (" ", "-")):
        s = s.replace(a, b)
    return s


pedidas = sys.argv[1:] or list(CAMPANAS)
for clave in pedidas:
    if clave not in CAMPANAS:
        print("campaña desconocida: %s" % clave)
        continue
    c = CAMPANAS[clave]
    salida = os.path.join(RAIZ, c["carpeta"])
    os.makedirs(salida, exist_ok=True)
    for nombre, codigo, tipo in c["gente"]:
        ruta = os.path.join(salida, "%s-%s.png" % (c["prefijo"], sin_tildes(nombre.lower())))
        tarjeta(c, nombre, codigo, tipo, ruta)
    print("%-12s %2d tarjetas -> %s" % (clave, len(c["gente"]), c["carpeta"]))
