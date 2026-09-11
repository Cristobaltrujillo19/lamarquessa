# -*- coding: utf-8 -*-
"""
Genera las tarjetas de cupón, en dos soportes distintos.

Hay DOS lienzos y no son intercambiables:

  wpp        1080x1350 (4:5) — la proporción vertical que WhatsApp enseña sin
             recortar en la vista previa del chat. Más ancha se corta por los
             lados; cuadrada desperdicia alto en un teléfono.

  impresion  10x15 cm a 300 dpi, con 3 mm de sangrado por lado. Para entregar
             en mano. Trae DORSO, y en el frente lleva `lamarquessa.co`: en el
             papel no hay enlace que tocar, así que si la dirección no está
             impresa el cupón no sirve para nada.

⚠️ Las medidas de letra del lienzo de impresión NO son las de pantalla
escaladas. A 300 dpi, 1 pt = 4,17 px: la vigencia de 21 px de WhatsApp serían
5,5 pt en papel, ilegible. En `impresion` los tamaños chicos están puestos en
puntos reales (8 pt la vigencia, 7 pt el rótulo).

⚠️ NO se usa queen-serif.otf, la display real de la marca, aunque sea lo que
más se parecería al sitio. Le faltan la COMA, el PUNTO y el %, y sus vocales
acentuadas están en el cmap pero se dibujan VACÍAS: "María" salía "Maria" y
"Ganaste," salía "Ganaste☒". Estar en el cmap no es tener glifo — comprobarlo
con `getBestCmap` da un falso negativo.

Georgia tiene cobertura completa y cae dentro de la familia de respaldos que
el propio sitio declara para su display (Iowan Old Style, Times New Roman,
serif). Cuando se licencie una Queens completa, se cambia SERIF y ya.

Uso:
    python scripts/tarjetas-premio.py                     # todo
    python scripts/tarjetas-premio.py feria               # una campaña
    python scripts/tarjetas-premio.py influencers wpp     # y un solo lienzo
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
SITIO = "lamarquessa.co"

FONDO = (47, 32, 22)          # --tinta
TEXTO = (251, 250, 247)       # --espuma
SUAVE = (188, 173, 158)
COBRE = (201, 160, 122)
FILETE = (251, 250, 247, 58)


LIENZOS = {
    "wpp": {
        "sufijo": "",
        "w": 1080, "h": 1350,
        "sangrado": 0,
        # 64 px = 6 % del ancho. Sin corte físico de por medio, el filete puede
        # ir cerca del borde sin riesgo.
        "margen": 64, "pad": 76,
        "dpi": 72,
        "logo": 400,
        "sitio": False,   # en pantalla el enlace va en el mensaje, no dibujado
        "dorso": False,
        "f": {"nombre": 124, "nombre_min": 58, "saludo": 44, "texto": 40,
              "codigo": 44, "rotulo": 21, "vigencia": 21, "ig": 23},
        "alto_saludo": 58, "salto_texto": 56,
    },
    "impresion": {
        "sufijo": "-impresion",
        # 10 x 15 cm a 300 dpi.
        "w": 1181, "h": 1772,
        # 3 mm de sangrado por lado -> el archivo sale 1251 x 1842.
        "sangrado": 35,
        # ⚠️ 118 px = 10 mm desde el corte, MUCHO más que en pantalla. Un filete
        # cerca del borde es justo lo que delata una guillotina que se desvió
        # medio milímetro: el marco queda torcido y se ve barato.
        "margen": 118, "pad": 86,
        "dpi": 300,
        "logo": 430,
        "sitio": True,    # en papel no hay enlace que tocar
        "dorso": True,
        "f": {"nombre": 132, "nombre_min": 62, "saludo": 48, "texto": 44,
              "codigo": 50, "rotulo": 29, "vigencia": 33, "ig": 31},
        "alto_saludo": 64, "salto_texto": 62,
    },
}


CAMPANAS = {
    # Premios de la feria de septiembre de 2026. Personales y de un solo uso.
    "feria": {
        "carpeta": "_tarjetas-feria",
        "prefijo": "premio",
        "lienzos": ["wpp"],
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
    #
    # ⚠️ Esta tarjeta SE ENTREGA EN MANO, junto con el bolso. No se manda por
    # WhatsApp. Por eso su lienzo es `impresion` — pero se deja también el de
    # pantalla, que sirve para que ella lo reenvíe a su comunidad después.
    "influencers": {
        "carpeta": "_tarjetas-influencers",
        "prefijo": "bono",
        "lienzos": ["impresion", "wpp"],
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


def ancho_espaciado(d, texto, fuente, tracking):
    return sum(d.textlength(c, font=fuente) + tracking for c in texto) - tracking


def logotipo(ancho):
    logo = Image.open(LOGO).convert("RGBA")
    alto = round(logo.height * (ancho / logo.width))
    return logo.resize((ancho, alto), Image.LANCZOS), alto


def lienzo_base(L):
    """Imagen con el sangrado ya incluido, el filete puesto, y las coordenadas
    útiles ya corridas por el sangrado."""
    s = L["sangrado"]
    img = Image.new("RGB", (L["w"] + 2 * s, L["h"] + 2 * s), FONDO)
    d = ImageDraw.Draw(img, "RGBA")

    # Filete interior, como el de una lámina enmarcada. Uno solo: en esta marca
    # la contención es lo que se lee caro, no la ornamentación.
    m = L["margen"]
    d.rectangle([s + m, s + m, s + L["w"] - m, s + L["h"] - m], outline=FILETE, width=2)

    izq = s + m + L["pad"]
    der = s + L["w"] - m - L["pad"]
    return img, d, izq, der, s + m + L["pad"], s + L["h"] - m - L["pad"]


def tarjeta(campana, nombre, codigo, tipo, ruta, L):
    img, d, izq, der, y_logo, base = lienzo_base(L)
    ancho = der - izq
    f = L["f"]

    # ---------- El logotipo, arriba ----------
    # Sustituye al nombre escrito en versalitas que había antes: teniendo la
    # firma de la marca, escribirla además era decir lo mismo dos veces.
    # 400 px y no menos: los filamentos de la L y la M son finísimos, y por
    # debajo de este tamaño se deshacen contra el fondo oscuro.
    logo, logo_h = logotipo(L["logo"])
    img.paste(logo, (izq, y_logo), logo)

    # ---------- Cierre, abajo (se mide primero para poder centrar lo de enmedio) ----------
    f_vig = ImageFont.truetype(MONO, f["vigencia"])
    f_cod = ImageFont.truetype(MONO_B, f["codigo"])
    f_rot = ImageFont.truetype(MONO, f["rotulo"])

    y_vig2 = base - f["vigencia"]
    y_vig1 = y_vig2 - round(f["vigencia"] * 1.52)
    y_cod = y_vig1 - round(f["codigo"] * 1.72)
    y_rot = y_cod - round(f["rotulo"] * 2.1)
    y_regla = y_rot - round(f["rotulo"] * 1.9)

    d.line([izq, y_regla, der, y_regla], fill=FILETE, width=2)
    espaciado(d, (izq, y_rot), campana["rotulo"], f_rot, SUAVE, f["rotulo"] * 0.24)
    d.text((izq, y_cod), codigo, font=f_cod, fill=COBRE)
    d.text((izq, y_vig1), campana["vigencia"][0], font=f_vig, fill=SUAVE)
    d.text((izq, y_vig2), campana["vigencia"][1], font=f_vig, fill=SUAVE)

    if L["sitio"]:
        # En papel no hay nada que tocar. La dirección va a la altura del
        # código y alineada a la derecha, que es como se lee el par completo:
        # este código, en esta dirección. Sin ella la tarjeta es un chiste.
        f_sitio = ImageFont.truetype(MONO, f["ig"])
        ancho_s = ancho_espaciado(d, SITIO, f_sitio, 2)
        espaciado(d, (der - ancho_s, y_cod + f["codigo"] - f["ig"] - 4),
                  SITIO, f_sitio, TEXTO, 2)
    else:
        # En pantalla el @ firma la tarjeta sin competir con el código, que es
        # lo único que hay que leer con atención. En papel se va al dorso.
        f_ig = ImageFont.truetype(MONO, f["ig"])
        ancho_ig = d.textlength(INSTAGRAM, font=f_ig)
        d.text((der - ancho_ig, y_vig2 - 16), INSTAGRAM, font=f_ig, fill=COBRE)

    # ---------- Bloque central, centrado entre el logotipo y el filete ----------
    # El nombre se encoge si no cabe: "María Paula" es el caso largo.
    tam = f["nombre"]
    while tam > f["nombre_min"]:
        if d.textlength(nombre, font=ImageFont.truetype(SERIF, tam)) <= ancho:
            break
        tam -= 3
    f_nombre = ImageFont.truetype(SERIF, tam)
    f_saludo = ImageFont.truetype(SERIF_I, f["saludo"])
    f_texto = ImageFont.truetype(SERIF, f["texto"])

    lineas = campana["textos"][tipo]
    alto_total = (L["alto_saludo"] + tam * 1.16 + 34
                  + len(lineas) * L["salto_texto"])

    arriba = y_logo + logo_h + 40
    y = arriba + max(0, (y_regla - 46 - arriba - alto_total) / 2)

    d.text((izq, y), campana["saludo"], font=f_saludo, fill=SUAVE)
    y += L["alto_saludo"]
    d.text((izq, y), nombre, font=f_nombre, fill=TEXTO)
    y += tam * 1.16 + 34
    for ln in lineas:
        d.text((izq, y), ln, font=f_texto, fill=TEXTO)
        y += L["salto_texto"]

    img.save(ruta, "PNG", optimize=True, dpi=(L["dpi"], L["dpi"]))


def dorso(ruta, L):
    """El reverso: solo la firma, centrada. Existe porque la tarjeta impresa se
    voltea, y un dorso liso desperdicia la única cara que se ve cuando queda
    boca abajo sobre la mesa."""
    img, d, izq, der, _, _ = lienzo_base(L)
    s, f = L["sangrado"], L["f"]

    logo, logo_h = logotipo(round(L["logo"] * 1.15))
    cx = s + L["w"] // 2
    cy = s + L["h"] // 2
    img.paste(logo, (cx - logo.width // 2, cy - logo_h), logo)

    f_ig = ImageFont.truetype(MONO, f["ig"])
    ancho_ig = ancho_espaciado(d, INSTAGRAM, f_ig, 3)
    espaciado(d, (cx - ancho_ig / 2, cy + 44), INSTAGRAM, f_ig, COBRE, 3)

    img.save(ruta, "PNG", optimize=True, dpi=(L["dpi"], L["dpi"]))


def sin_tildes(s):
    for a, b in (("í", "i"), ("á", "a"), ("é", "e"), ("ó", "o"), ("ú", "u"), ("ñ", "n"), (" ", "-")):
        s = s.replace(a, b)
    return s


args = sys.argv[1:]
pedidas = [a for a in args if a in CAMPANAS] or list(CAMPANAS)
solo_lienzo = [a for a in args if a in LIENZOS]

for clave in pedidas:
    c = CAMPANAS[clave]
    salida = os.path.join(RAIZ, c["carpeta"])
    os.makedirs(salida, exist_ok=True)
    for nl in c["lienzos"]:
        if solo_lienzo and nl not in solo_lienzo:
            continue
        L = LIENZOS[nl]
        for nombre, codigo, tipo in c["gente"]:
            ruta = os.path.join(salida, "%s-%s%s.png" % (
                c["prefijo"], sin_tildes(nombre.lower()), L["sufijo"]))
            tarjeta(c, nombre, codigo, tipo, ruta, L)
        if L["dorso"]:
            dorso(os.path.join(salida, "%s-dorso%s.png" % (c["prefijo"], L["sufijo"])), L)
        print("%-12s %-10s %2d tarjetas%s -> %s" % (
            clave, nl, len(c["gente"]),
            " + dorso" if L["dorso"] else "", c["carpeta"]))
