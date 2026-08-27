// Template del correo de confirmación de compra. Puro (no depende de Convex
// ni de React) para poder previsualizarlo sin enviar correos. Solo tablas y
// estilos inline: los clientes Gmail/Outlook desechan CSS externo y grids
// modernos. Cada elemento tiene un ancho o cae por defecto al padre.
//
// Tono: formal (usted), luxury restraint. Un solo tipogramado serif, mucho
// aire, señalética en small-caps. Sin CTA gritón, sin bloques decorativos:
// el correo es la firma del pedido, no un anuncio.

import { formatCop } from "./productos";
import { addOnsPorUnidad, nombreFuente, type Personalizacion } from "./personalizacion";

const COLOR = {
  crema: "#F4E8D7",
  linea: "#C1AB99",         // arena — para hairlines
  cacao: "#4A3A2C",
  cacaoSuave: "#8a7a68",
  cobre: "#B38561",
  cobreTexto: "#805337",    // AA sobre crema
} as const;

const FONT_SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export type ItemConfirmacion = {
  nombre: string;
  colorNombre: string;
  tamanoNombre: string;
  cantidad: number;
  precioCop: number; // BASE
  personalizacion?: Personalizacion;
  /** URL absoluta a la foto de portada del producto. Opcional. */
  fotoAbs?: string;
};

export type ArgsConfirmacion = {
  clienteNombre: string;
  items: ItemConfirmacion[];
  subtotalCop: number;
  descuentoCop?: number;
  cupon?: string;
  envioCop: number;
  totalCop: number;
  direccion?: {
    calle: string;
    ciudad: string;
    departamento: string;
    notas?: string;
  };
  produccionSemanas: number;
  envioDias: number;
  siteUrl: string;
  whatsappE164: string;
  whatsappVisible: string;
  instagramUrl: string;
};

/** Texto que Gmail/Apple Mail muestran junto al asunto en la bandeja. */
function preheader(texto: string): string {
  return `<div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;visibility:hidden">
    ${texto}${"&#847;&nbsp;".repeat(80)}
  </div>`;
}

const smallcaps = `font-family:${FONT_SANS};font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${COLOR.cobreTexto}`;

function fmtFechaLarga(): string {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const d = new Date();
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function bloqueItem(i: ItemConfirmacion): string {
  const efectivo = i.precioCop + addOnsPorUnidad(i.personalizacion);
  const detalles: string[] = [`${i.colorNombre} · ${i.tamanoNombre}`];
  if (i.personalizacion?.iniciales) {
    detalles.push(
      `Iniciales ${i.personalizacion.iniciales.texto} · ${nombreFuente(i.personalizacion.iniciales.fuenteId)}`,
    );
  }
  if (i.personalizacion?.colorPersonalizado) {
    detalles.push(`Color personalizado · ${i.personalizacion.colorPersonalizado.descripcion}`);
  }
  const detalleHtml = detalles
    .map((t) => `<div style="font-family:${FONT_SANS};font-size:12px;color:${COLOR.cacaoSuave};line-height:1.6">${t}</div>`)
    .join("");

  const foto = i.fotoAbs
    ? `<td width="60" style="width:60px;padding:0 18px 0 0;vertical-align:top">
         <img src="${i.fotoAbs}" width="60" height="76" alt="" style="display:block;width:60px;height:76px;border:0"/>
       </td>`
    : "";

  return `
    <tr>
      <td style="padding:22px 0;border-top:1px solid ${COLOR.linea}">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
          <tr>
            ${foto}
            <td style="vertical-align:top">
              <div style="font-family:${FONT_SERIF};font-size:17px;color:${COLOR.cacao};line-height:1.25;letter-spacing:0.01em">
                ${i.cantidad} &times; Bolso ${i.nombre}
              </div>
              <div style="margin-top:6px">${detalleHtml}</div>
            </td>
            <td style="width:110px;text-align:right;vertical-align:top;font-family:${FONT_SERIF};font-size:17px;color:${COLOR.cacao};white-space:nowrap">
              ${formatCop(efectivo * i.cantidad)}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function filaTotal(label: string, valor: string, opts: { negativo?: boolean; total?: boolean } = {}): string {
  const color = opts.negativo ? COLOR.cobreTexto : COLOR.cacao;
  const family = opts.total ? FONT_SERIF : FONT_SANS;
  const size = opts.total ? "17px" : "13px";
  const pad = opts.total ? "16px 0 0" : "5px 0";
  const border = opts.total ? `border-top:1px solid ${COLOR.linea}` : "";
  return `
    <tr>
      <td style="padding:${pad};${border};font-family:${family};font-size:${size};color:${opts.total ? COLOR.cacao : COLOR.cacaoSuave}">${label}</td>
      <td style="padding:${pad};${border};font-family:${family};font-size:${size};color:${color};text-align:right;white-space:nowrap">${valor}</td>
    </tr>`;
}

export function armarHtmlConfirmacion(a: ArgsConfirmacion): string {
  const logoUrl = `${a.siteUrl}/marca/logo-cobre.png`;
  const filasItems = a.items.map(bloqueItem).join("");

  const filaDescuento = a.descuentoCop
    ? filaTotal(`Descuento${a.cupon ? ` · ${a.cupon}` : ""}`, `−${formatCop(a.descuentoCop)}`, { negativo: true })
    : "";

  const hayColor = a.items.some((i) => i.personalizacion?.colorPersonalizado);
  const notaCoordinacion = hayColor
    ? `<tr>
        <td style="padding:22px 0 0;border-top:1px solid ${COLOR.linea}">
          <div style="${smallcaps};margin-bottom:8px">Coordinación de color</div>
          <div style="font-family:${FONT_SERIF};font-size:15px;color:${COLOR.cacao};line-height:1.6">
            Le escribiremos por WhatsApp para acordar el tono exacto antes de comenzar la pieza.
          </div>
        </td>
      </tr>`
    : "";

  const direccionHtml = a.direccion
    ? `${a.direccion.calle}<br/>${a.direccion.ciudad}, ${a.direccion.departamento}${a.direccion.notas ? `<br/><span style="font-family:${FONT_SANS};font-size:12px;color:${COLOR.cacaoSuave}">${a.direccion.notas}</span>` : ""}`
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>La Marquessa</title>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:${COLOR.crema};color:${COLOR.cacao};font-family:${FONT_SERIF};-webkit-font-smoothing:antialiased">
  ${preheader("Su pedido ha sido registrado.")}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.crema};border-collapse:collapse">
    <tr>
      <td align="center" style="padding:56px 24px 72px">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:520px;border-collapse:collapse">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:56px">
              <img src="${logoUrl}" alt="La Marquessa" width="120" style="display:block;width:120px;height:auto;border:0"/>
            </td>
          </tr>

          <!-- Titular -->
          <tr>
            <td align="center" style="padding-bottom:12px">
              <div style="${smallcaps}">Pedido en preparación</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:56px">
              <div style="font-family:${FONT_SERIF};font-size:36px;font-weight:400;color:${COLOR.cacao};line-height:1.15;letter-spacing:0.005em;font-style:italic">
                En el taller.
              </div>
              <div style="margin-top:22px;font-family:${FONT_SANS};font-size:11px;letter-spacing:0.2em;color:${COLOR.cacaoSuave};text-transform:uppercase">
                ${fmtFechaLarga()}
              </div>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td>
              <div style="${smallcaps};padding-bottom:8px">Su pedido</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
                ${filasItems}
              </table>
            </td>
          </tr>

          <!-- Totales -->
          <tr>
            <td style="padding-top:14px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${COLOR.linea}">
                ${filaTotal("Subtotal", formatCop(a.subtotalCop))}
                ${filaDescuento}
                ${filaTotal("Envío", formatCop(a.envioCop))}
                ${filaTotal("Total", formatCop(a.totalCop), { total: true })}
              </table>
            </td>
          </tr>

          <!-- Fabricación + envío + dirección, en una tabla compacta -->
          <tr>
            <td style="padding-top:48px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${COLOR.linea}">
                <tr>
                  <td width="50%" style="width:50%;padding:22px 12px 0 0;vertical-align:top">
                    <div style="${smallcaps};margin-bottom:8px">Fabricación</div>
                    <div style="font-family:${FONT_SERIF};font-size:15px;color:${COLOR.cacao};line-height:1.6">
                      ${a.produccionSemanas} semanas
                    </div>
                  </td>
                  <td width="50%" style="width:50%;padding:22px 0 0 12px;vertical-align:top">
                    <div style="${smallcaps};margin-bottom:8px">Envío</div>
                    <div style="font-family:${FONT_SERIF};font-size:15px;color:${COLOR.cacao};line-height:1.6">
                      ${a.envioDias} días hábiles${direccionHtml ? `<br/><span style="font-size:14px;color:${COLOR.cacaoSuave}">${direccionHtml}</span>` : ""}
                    </div>
                  </td>
                </tr>
                ${notaCoordinacion}
              </table>
            </td>
          </tr>

          <!-- Firma -->
          <tr>
            <td align="center" style="padding-top:80px">
              <div style="font-family:${FONT_SERIF};font-size:14px;color:${COLOR.cacaoSuave};letter-spacing:0.08em;text-transform:uppercase">
                Para
              </div>
              <div style="margin-top:6px;font-family:${FONT_SERIF};font-size:22px;font-style:italic;color:${COLOR.cacao};letter-spacing:0.02em">
                ${a.clienteNombre}
              </div>
              <div style="margin-top:36px;font-family:${FONT_SERIF};font-size:16px;font-style:italic;color:${COLOR.cobreTexto};letter-spacing:0.02em">
                Life comes in waves.
              </div>
              <div style="margin-top:24px;font-family:${FONT_SANS};font-size:12px;color:${COLOR.cacao};line-height:1.9">
                La Marquessa &middot; Colombia<br/>
                <a href="https://wa.me/${a.whatsappE164}" style="color:${COLOR.cobreTexto};text-decoration:none">+57 ${a.whatsappVisible}</a>
                &nbsp;&middot;&nbsp;
                <a href="${a.siteUrl}" style="color:${COLOR.cobreTexto};text-decoration:none">lamarquessa.co</a>
                &nbsp;&middot;&nbsp;
                <a href="${a.instagramUrl}" style="color:${COLOR.cobreTexto};text-decoration:none">@lamarquessa.co</a>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:40px;font-family:${FONT_SANS};font-size:10px;letter-spacing:0.06em;color:${COLOR.cacaoSuave};line-height:1.7">
              &copy; ${new Date().getFullYear()} La Marquessa
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
