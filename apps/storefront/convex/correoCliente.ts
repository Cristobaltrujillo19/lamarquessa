"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { armarHtmlConfirmacion, type ItemConfirmacion } from "../lib/emailConfirmacion";
import nodemailer from "nodemailer";

// WhatsApp de la marca. Convex y Next viven en paquetes separados, así que
// este archivo no puede importar la constante compartida de lib/site.ts sin
// arrastrar dependencias del cliente. Si el número cambia, hay que tocarlo
// también en lib/site.ts.
const WHATSAPP = "573332779109";
const WHATSAPP_VISIBLE = "333 277 9109";
const INSTAGRAM_URL = "https://www.instagram.com/lamarquessa.co/";
const PRODUCCION_SEMANAS = 2;
const ENVIO_DIAS = 2;

// Confirmación de compra al cliente, por el SMTP de Google Workspace (no necesita
// dominio verificado). Sale desde GMAIL_FROM. Se auto-desactiva si faltan las
// credenciales, así que es seguro tenerla antes de configurar el correo.
export const enviarConfirmacionCliente = internalAction({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, { pedidoId }): Promise<void> => {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
      console.warn("Falta GMAIL_USER/GMAIL_APP_PASSWORD; no se envía la confirmación");
      return;
    }

    const data = await ctx.runQuery(internal.orders.detallePedido, { pedidoId });
    if (!data) return;
    const { pedido, cliente } = data;
    if (!cliente?.email) return; // el correo es opcional en el checkout
    const siteUrl = process.env.SITE_URL ?? "https://lamarquessa.co";

    // Se busca la foto de portada por slug para las miniaturas del correo.
    // Una sola query al catálogo; los pedidos rara vez pasan de 3-4 líneas.
    const catalogo = await ctx.runQuery(api.productos.catalogo, {});
    const fotoPorSlug = new Map(catalogo.map((p) => [p.slug, p.fotos[0]]));

    const items: ItemConfirmacion[] = pedido.items.map((i) => {
      const foto = fotoPorSlug.get(i.slug);
      return {
        nombre: i.nombre,
        colorNombre: i.colorNombre,
        tamanoNombre: i.tamanoNombre,
        cantidad: i.cantidad,
        precioCop: i.precioCop,
        personalizacion: i.personalizacion,
        fotoAbs: foto ? `${siteUrl}${foto}` : undefined,
      };
    });

    const subtotalCop = pedido.totalCop + (pedido.descuentoCop ?? 0) - pedido.envioCop;

    const html = armarHtmlConfirmacion({
      clienteNombre: cliente.nombre,
      items,
      subtotalCop,
      descuentoCop: pedido.descuentoCop,
      cupon: pedido.cupon,
      envioCop: pedido.envioCop,
      totalCop: pedido.totalCop,
      direccion: pedido.direccion,
      produccionSemanas: PRODUCCION_SEMANAS,
      envioDias: ENVIO_DIAS,
      siteUrl,
      whatsappE164: WHATSAPP,
      whatsappVisible: WHATSAPP_VISIBLE,
      instagramUrl: INSTAGRAM_URL,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    try {
      await transporter.sendMail({
        from: process.env.GMAIL_FROM ?? `La Marquessa <${user}>`,
        to: cliente.email,
        subject: "Recibimos tu pedido — La Marquessa",
        html,
      });
    } catch (e) {
      console.error("Gmail SMTP falló:", e);
    }
  },
});
