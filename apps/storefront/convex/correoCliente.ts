"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { formatCop } from "../lib/productos";
import nodemailer from "nodemailer";

// WhatsApp de la marca. Convex y Next viven en paquetes separados, así que
// este archivo no puede importar la constante compartida de lib/site.ts sin
// arrastrar dependencias del cliente. Si el número cambia, hay que tocarlo
// también en lib/site.ts.
const WHATSAPP = "573332779109";
const WHATSAPP_VISIBLE = "333 277 9109";

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
    const d = pedido.direccion; // las ventas presenciales "en mano" no la tienen

    const items = pedido.items
      .map(
        (i) =>
          `<li>${i.cantidad}× ${i.nombre} · ${i.colorNombre} ${i.tamanoNombre} — ${formatCop(i.precioCop)}</li>`,
      )
      .join("");

    const bloqueEnvio = d
      ? `<p><strong>Lo enviaremos a:</strong><br/>
           ${d.calle}<br/>
           ${d.ciudad}, ${d.departamento}</p>`
      : "";
    const lineaDescuento = pedido.descuentoCop
      ? `Descuento: −${formatCop(pedido.descuentoCop)}<br/>`
      : "";

    const html = `
      <div style="font-family:'Georgia',serif;color:#4A3A2C;line-height:1.6;max-width:520px">
        <h2 style="color:#B38561;font-weight:normal">Gracias por tu compra 🐚</h2>
        <p>Hola ${cliente.nombre}, recibimos tu pedido y ya lo preparamos a mano, con el cuidado de siempre.</p>
        <p><strong>Tu pedido:</strong></p>
        <ul>${items}</ul>
        <p>${lineaDescuento}Envío: ${formatCop(pedido.envioCop)}<br/>
           <strong>Total: ${formatCop(pedido.totalCop)}</strong></p>
        ${bloqueEnvio}
        <div style="background:#F4E8D7;border-radius:12px;padding:14px 18px;margin-top:18px">
          <p style="margin:0">📱 <strong>Coordinamos el envío por WhatsApp:</strong><br/>
            <a href="https://wa.me/${WHATSAPP}" style="color:#B38561;font-weight:bold;text-decoration:none">+57 ${WHATSAPP_VISIBLE}</a>
          </p>
        </div>
        <p style="color:#8a7a68;font-size:13px;margin-top:18px">
          Este correo es <strong>solo informativo</strong>, por favor no respondas a este mensaje.
          Para cualquier cosa, escríbenos por WhatsApp al <strong>${WHATSAPP_VISIBLE}</strong>.
        </p>
        <p style="margin-top:16px;color:#8a7a68;font-style:italic">Un sueño tejido por las olas.</p>
        <p style="margin-top:4px">— La Marquessa · Colombia</p>
      </div>`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    try {
      await transporter.sendMail({
        from: process.env.GMAIL_FROM ?? `La Marquessa <${user}>`,
        to: cliente.email,
        subject: "¡Gracias por tu compra en La Marquessa! 🐚",
        html,
      });
    } catch (e) {
      console.error("Gmail SMTP falló:", e);
    }
  },
});
