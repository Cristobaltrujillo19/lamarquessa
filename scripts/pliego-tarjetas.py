# -*- coding: utf-8 -*-
"""
Arma las tarjetas de una campaña en UNA hoja carta, a doble cara, lista para
imprimir y cortar. Lee los PNG que genera `tarjetas-premio.py` (lienzo
`impresion`), así que hay que correr ese primero.

⚠️ Las tarjetas salen al 81 %, unos 8,1 x 12,2 cm, y no a 10 x 15. Tres de
10 cm de ancho son 30 cm y la carta mide 27,9: no caben ni en horizontal. El 81 %
es lo que deja 1,1 cm de margen a los lados, que es lo mínimo para que las
marcas de corte no caigan en la franja que las impresoras no imprimen.

Cara 1: los tres frentes. Cara 2: tres dorsos en las MISMAS casillas. Las tres
casillas están centradas y son iguales, así que el pliego es simétrico en los
dos ejes: el dorso cae bien detrás del frente se voltee la hoja por donde se
voltee. Lo único que cambia el borde de volteo es si el logo del dorso queda
derecho o de cabeza.

Uso:
    python scripts/pliego-tarjetas.py
"""
import os
from PIL import Image, ImageDraw

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARPETA = os.path.join(RAIZ, "_tarjetas-influencers")
FRENTES = ["bono-conchita-impresion.png", "bono-caro-impresion.png", "bono-paula-impresion.png"]
DORSO = "bono-dorso-impresion.png"
SALIDA = os.path.join(CARPETA, "bonos-hoja-carta.pdf")

DPI = 300
HOJA_W, HOJA_H = 3300, 2550        # carta horizontal: 11 x 8,5 in
ESCALA = 0.81
SANGRADO = 35                       # el de los PNG, a tamaño completo
MARCA = 70                          # largo de la marca de corte (~6 mm)
HOLGURA = 12                        # separación entre la marca y el sangrado


def casillas(card_w, card_h):
    """Esquina superior izquierda de cada tarjeta (con sangrado). Los
    sangrados de tarjetas vecinas se tocan: entre dos cortes queda una sola
    franja oscura, y la guillotina corta dentro de color, nunca en blanco."""
    total = card_w * 3
    x0 = (HOJA_W - total) // 2
    y0 = (HOJA_H - card_h) // 2
    return [(x0 + i * card_w, y0) for i in range(3)]


def pagina(nombres):
    hoja = Image.new("RGB", (HOJA_W, HOJA_H), "white")
    d = ImageDraw.Draw(hoja)

    muestra = Image.open(os.path.join(CARPETA, nombres[0]))
    card_w = round(muestra.width * ESCALA)
    card_h = round(muestra.height * ESCALA)
    s = round(SANGRADO * ESCALA)

    pos = casillas(card_w, card_h)
    for (x, y), n in zip(pos, nombres):
        img = Image.open(os.path.join(CARPETA, n)).convert("RGB")
        hoja.paste(img.resize((card_w, card_h), Image.LANCZOS), (x, y))

    # Líneas de corte: cada borde de tarjeta SIN sangrado.
    arriba = pos[0][1] + s
    abajo = pos[0][1] + card_h - s
    izquierda = pos[0][0] + s
    derecha = pos[-1][0] + card_w - s
    cortes_x = sorted({x + s for x, _ in pos} | {x + card_w - s for x, _ in pos})

    tinta = (0, 0, 0)
    borde_arriba = pos[0][1]
    borde_abajo = pos[0][1] + card_h
    for cx in cortes_x:
        d.line([cx, borde_arriba - HOLGURA - MARCA, cx, borde_arriba - HOLGURA], fill=tinta, width=2)
        d.line([cx, borde_abajo + HOLGURA, cx, borde_abajo + HOLGURA + MARCA], fill=tinta, width=2)
    borde_izq = pos[0][0]
    borde_der = pos[-1][0] + card_w
    for cy in (arriba, abajo):
        d.line([borde_izq - HOLGURA - MARCA, cy, borde_izq - HOLGURA, cy], fill=tinta, width=2)
        d.line([borde_der + HOLGURA, cy, borde_der + HOLGURA + MARCA, cy], fill=tinta, width=2)

    return hoja, card_w - 2 * s, abajo - arriba


frente, tw, th = pagina(FRENTES)
dorso, _, _ = pagina([DORSO] * 3)

# JPEG al 95 sin submuestreo de color: el PDF de Pillow codifica en JPEG, y con
# el submuestreo por defecto los bordes del texto claro sobre café se ensucian.
frente.save(SALIDA, "PDF", resolution=DPI, save_all=True, append_images=[dorso],
            quality=95, subsampling=0)

print("%s  (2 caras, tarjeta de %.1f x %.1f cm)" % (
    os.path.relpath(SALIDA, RAIZ), tw / DPI * 2.54, th / DPI * 2.54))
