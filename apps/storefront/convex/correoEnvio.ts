"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import nodemailer from "nodemailer";

// ⚠️ Reemplazar por el WhatsApp real de La Marquessa antes de activar los correos.
const WHATSAPP = "573000000000";
const WHATSAPP_VISIBLE = "300 000 0000";

// Correo "tu pedido va en camino", al marcar un pedido como enviado. Mismo
// transporte que la confirmación (SMTP de Google Workspace). Se auto-desactiva
// si faltan las credenciales.
export const enviarVaEnCamino = internalAction({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, { pedidoId }): Promise<void> => {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
      console.warn("Falta GMAIL_USER/GMAIL_APP_PASSWORD; no se envía 'va en camino'");
      return;
    }

    const data = await ctx.runQuery(internal.orders.detallePedido, { pedidoId });
    if (!data) return;
    const { pedido, cliente } = data;
    if (!cliente?.email) return; // el correo es opcional en el checkout

    const guia = pedido.guia
      ? `<p><strong>Número de guía:</strong> ${pedido.guia}</p>`
      : "";
    const transportadora = pedido.transportadora
      ? `<p><strong>Transportadora:</strong> ${pedido.transportadora}</p>`
      : "";
    const boton = pedido.urlRastreo
      ? `<p style="margin:18px 0">
           <a href="${pedido.urlRastreo}" target="_blank"
              style="display:inline-block;background:#B38561;color:#fff;font-weight:bold;text-decoration:none;border-radius:999px;padding:12px 22px">
             📦 Rastrear mi envío
           </a>
         </p>`
      : "";

    const html = `
      <div style="font-family:'Georgia',serif;color:#4A3A2C;line-height:1.6;max-width:520px">
        <h2 style="color:#B38561;font-weight:normal">Tu pedido va en camino 🌊</h2>
        <p>Hola ${cliente.nombre}, ya despachamos tu pedido. En poquitos días estará contigo.</p>
        ${transportadora}
        ${guia}
        ${boton}
        <div style="background:#F4E8D7;border-radius:12px;padding:14px 18px;margin-top:18px">
          <p style="margin:0">📱 <strong>¿Dudas con tu envío?</strong> Escríbenos por WhatsApp:<br/>
            <a href="https://wa.me/${WHATSAPP}" style="color:#B38561;font-weight:bold;text-decoration:none">+57 ${WHATSAPP_VISIBLE}</a>
          </p>
        </div>
        <p style="color:#8a7a68;font-size:13px;margin-top:18px">
          Este correo es <strong>solo informativo</strong>, por favor no respondas a este mensaje.
        </p>
        <p style="margin-top:16px;color:#8a7a68;font-style:italic">Life comes in waves.</p>
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
        subject: "Tu pedido de La Marquessa va en camino 🌊",
        html,
      });
    } catch (e) {
      console.error("Gmail SMTP falló (va en camino):", e);
    }
  },
});
