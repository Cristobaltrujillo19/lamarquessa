# -*- coding: utf-8 -*-
"""
Genera las once tarjetas de premio como PNG, listas para mandar por WhatsApp.

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
serif). Cuando se licencie una Queens completa, se cambia aquí y ya.
"""
import os
from PIL import Image, ImageDraw, ImageFont

RAIZ = r"C:\Users\crist\Documents\random proyects\La Marquesa\lamarquesa"
SALIDA = os.path.join(RAIZ, "_tarjetas-feria")

SERIF = r"C:\Windows\Fonts\georgia.ttf"
SERIF_I = r"C:\Windows\Fonts\georgiai.ttf"
MONO = r"C:\Windows\Fonts\consola.ttf"
MONO_B = r"C:\Windows\Fonts\consolab.ttf"

# El logotipo en su version CLARA: esta hecho para fondos oscuros, que es
# exactamente lo que es la tarjeta. La version cobre desaparece sobre tinta.
LOGO = os.path.join(RAIZ, r"apps\storefront\public\marca\logo-claro.png")
INSTAGRAM = "@lamarquessa.co"

W, H = 1080, 1350
MARGEN = 64
PAD = 76

FONDO = (47, 32, 22)          # --tinta
TEXTO = (251, 250, 247)       # --espuma
SUAVE = (188, 173, 158)
COBRE = (201, 160, 122)
FILETE = (251, 250, 247, 58)

PREMIOS = [
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
]

PREMIO = {
    "iniciales": ["Puedes personalizar la pieza", "que elijas con tus iniciales."],
    "descuento": ["Un 10% sobre tu pedido."],
}


def espaciado(d, xy, texto, fuente, fill, tracking):
    """Letter-spacing a mano: Pillow no lo trae, y sin él una línea en
    versalitas se ve apelmazada — lo contrario de lo que se lee caro."""
    x, y = xy
    for ch in texto:
        d.text((x, y), ch, font=fuente, fill=fill)
        x += d.textlength(ch, font=fuente) + tracking


def tarjeta(nombre, codigo, tipo, ruta):
    img = Image.new("RGB", (W, H), FONDO)
    d = ImageDraw.Draw(img, "RGBA")

    # Filete interior, como el de una lámina enmarcada. Uno solo: en esta marca
    # la contención es lo que se lee caro, no la ornamentación.
    d.rectangle([MARGEN, MARGEN, W - MARGEN, H - MARGEN], outline=FILETE, width=2)

    izq = MARGEN + PAD
    der = W - MARGEN - PAD
    ancho = der - izq

    # ---------- El logotipo, arriba ----------
    # Sustituye al nombre escrito en versalitas que habia antes: teniendo la
    # firma de la marca, escribirla ademas era decir lo mismo dos veces.
    logo = Image.open(LOGO).convert("RGBA")
    # 400 y no menos: los filamentos de la L y la M son finisimos, y por debajo
    # de este tamano se deshacen contra el fondo oscuro.
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
    espaciado(d, (izq, y_rot), "TU CÓDIGO", f_rot, SUAVE, 5)
    d.text((izq, y_cod), codigo, font=f_cod, fill=COBRE)
    d.text((izq, y_vig1), "Personal y de un solo uso", font=f_vig, fill=SUAVE)
    d.text((izq, y_vig2), "Hasta el 8 de marzo de 2027", font=f_vig, fill=SUAVE)

    # El @ va a la derecha, alineado al pie: firma la tarjeta sin competir con
    # el codigo, que es lo unico que ella tiene que leer con atencion.
    f_ig = ImageFont.truetype(MONO, 23)
    ancho_ig = d.textlength(INSTAGRAM, font=f_ig)
    d.text((der - ancho_ig, y_vig2 - 16), INSTAGRAM, font=f_ig, fill=COBRE)

    # ---------- Bloque central, centrado entre el sello y el filete ----------
    # El nombre se encoge si no cabe: "María Paula" es el caso largo.
    tam = 124
    while tam > 58:
        f_nombre = ImageFont.truetype(SERIF, tam)
        if d.textlength(nombre, font=f_nombre) <= ancho:
            break
        tam -= 3
    f_nombre = ImageFont.truetype(SERIF, tam)
    f_ganaste = ImageFont.truetype(SERIF_I, 44)
    f_premio = ImageFont.truetype(SERIF, 40)

    lineas = PREMIO[tipo]
    alto_ganaste = 58
    alto_nombre = tam * 1.16
    alto_premio = len(lineas) * 56
    alto_total = alto_ganaste + alto_nombre + 34 + alto_premio

    arriba = y_logo + logo_h + 40       # bajo el logotipo
    abajo = y_regla - 46                # sobre el filete
    y = arriba + max(0, (abajo - arriba - alto_total) / 2)

    d.text((izq, y), "Ganaste,", font=f_ganaste, fill=SUAVE)
    y += alto_ganaste
    d.text((izq, y), nombre, font=f_nombre, fill=TEXTO)
    y += alto_nombre + 34
    for ln in lineas:
        d.text((izq, y), ln, font=f_premio, fill=TEXTO)
        y += 56

    img.save(ruta, "PNG", optimize=True)


os.makedirs(SALIDA, exist_ok=True)
hechas = []
for nombre, codigo, tipo in PREMIOS:
    limpio = (
        nombre.lower()
        .replace("í", "i").replace("á", "a").replace("é", "e")
        .replace("ó", "o").replace("ú", "u").replace(" ", "-")
    )
    ruta = os.path.join(SALIDA, "premio-%s.png" % limpio)
    tarjeta(nombre, codigo, tipo, ruta)
    hechas.append(ruta)

print("Generadas %d tarjetas en %s" % (len(hechas), SALIDA))
