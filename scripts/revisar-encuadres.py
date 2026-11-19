# -*- coding: utf-8 -*-
"""
Revisa de un vistazo CÓMO QUEDA RECORTADA cada foto de bolso en el marco
cuadrado de la ficha.

Simula exactamente lo que hace el navegador (`object-fit: cover` con el
`object-position` que declare `lib/fotos-encuadre.ts`, que se lee de ahí para
que esta hoja no pueda mentir) y lo pinta todo junto.

Existe porque el fallo del §30 pasó meses sin verse: mirar foto por foto en el
navegador es lento, y las cuadradas salían bien por casualidad y tapaban que
las demás no. Con esto se revisan las 17 en una imagen.

⚠️ CORRER ESTO AL AÑADIR O CAMBIAR UNA FOTO DE BOLSO. Si el bolso sale
cortado, la cura no es recortar el JPG: es añadir la foto al mapa de
`lib/fotos-encuadre.ts` con `0%` (anclar arriba) o `100%` (anclar abajo).

Uso:
    python scripts/revisar-encuadres.py
    # deja la hoja en _capturas-movil/recortes-todas-corregidas.png
"""
import os, glob, io, re
from PIL import Image, ImageDraw, ImageFont

RAIZ = r"C:\Users\crist\Documents\random proyects\La Marquesa\lamarquesa"
FOTOS = os.path.join(RAIZ, "apps", "storefront", "public", "fotos")
SALIDA = os.path.join(RAIZ, "_capturas-movil")
os.makedirs(SALIDA, exist_ok=True)

LADO = 300          # el marco cuadrado de la vista previa
COLS = 5
PIE = 56
MARGEN = 26
HUECO = 18
FONDO = (234, 232, 223)
TINTA = (47, 32, 22)
SUAVE = (107, 92, 80)
ALERTA = (138, 59, 50)

def fuente(p, neg=False):
    n = "segoeuib.ttf" if neg else "segoeui.ttf"
    try: return ImageFont.truetype(r"C:\Windows\Fonts\%s" % n, p)
    except OSError: return ImageFont.load_default()

# Solo las que de verdad van al marco cuadrado de la galería.
rutas = sorted(p for p in glob.glob(os.path.join(FOTOS, "bolso-*.jpg"))
               if not os.path.basename(p)[:-4].rsplit("-", 1)[-1].isdigit())

TS = os.path.join(RAIZ, "apps", "storefront", "lib", "fotos-encuadre.ts")
_t = io.open(TS, encoding="utf-8").read()
ENCUADRES = {m.group(1): int(m.group(2)) / 100
             for m in re.finditer(r'"/fotos/([^"]+)":\s*"(\d+)%"', _t)}
print("encuadres leidos del TS:", ENCUADRES)

def cubre(im, lado, pos_y=0.5):
    """Lo mismo que object-fit:cover con object-position: 50% <pos_y>."""
    esc = max(lado / im.width, lado / im.height)
    w, h = round(im.width * esc), round(im.height * esc)
    g = im.resize((w, h), Image.LANCZOS)
    x = round((w - lado) * 0.5)
    y = round((h - lado) * pos_y)
    return g.crop((x, y, x + lado, y + lado)), (w, h, x, y)

filas = (len(rutas) + COLS - 1) // COLS
W = MARGEN * 2 + COLS * LADO + (COLS - 1) * HUECO
H = MARGEN * 2 + 80 + filas * (LADO + PIE) + (filas - 1) * HUECO
hoja = Image.new("RGB", (W, H), FONDO)
d = ImageDraw.Draw(hoja)
d.text((MARGEN, MARGEN), "Las 17 fotos de bolso, recortadas al marco cuadrado de la ficha",
       font=fuente(24, True), fill=TINTA)
d.text((MARGEN, MARGEN + 34),
       "Esto es literalmente lo que ve el visitante. En verde, las cuatro con encuadre corregido a mano.",
       font=fuente(14), fill=SUAVE)

y0 = MARGEN + 80
f_tit, f_sub = fuente(14, True), fuente(13)
for i, ruta in enumerate(rutas):
    im = Image.open(ruta).convert("RGB")
    py = ENCUADRES.get(os.path.basename(ruta), 0.5)
    rec, (w, h, x, y) = cubre(im, LADO, py)
    cx = MARGEN + (i % COLS) * (LADO + HUECO)
    cy = y0 + (i // COLS) * (LADO + PIE + HUECO)
    hoja.paste(rec, (cx, cy))
    d.rectangle([cx, cy, cx + LADO - 1, cy + LADO - 1], outline=(0, 0, 0))

    prop = im.width / im.height
    perdido_v = round(100 * (h - LADO) / h)
    perdido_h = round(100 * (w - LADO) / w)
    nombre = os.path.basename(ruta)[6:-4]
    if py != 0.5:
        d.rectangle([cx, cy, cx + LADO - 1, cy + LADO - 1], outline=(31, 110, 112), width=4)
    d.text((cx, cy + LADO + 8), nombre + ("  (encuadre %d%%)" % round(py*100) if py != 0.5 else ""),
           font=f_tit, fill=(31,110,112) if py != 0.5 else TINTA)
    txt = "%.2f  ·  se pierde %d%% %s" % (
        prop, max(perdido_v, perdido_h), "de alto" if perdido_v else ("de ancho" if perdido_h else ""))
    if perdido_v == 0 and perdido_h == 0:
        txt = "%.2f  ·  cuadrada, no se recorta" % prop
    d.text((cx, cy + LADO + 28), txt, font=f_sub,
           fill=ALERTA if max(perdido_v, perdido_h) >= 20 else SUAVE)

ruta = os.path.join(SALIDA, "recortes-todas-corregidas.png")
hoja.save(ruta, "PNG", optimize=True)
print(ruta, hoja.size, len(rutas), "fotos")
