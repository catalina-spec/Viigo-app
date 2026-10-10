// Envío de correos desde el servidor (Gmail de soporte@viel.cl con contraseña de aplicación).
// Necesita SMTP_PASS en Vercel; SMTP_USER es opcional (por defecto soporte@viel.cl).

import nodemailer from 'nodemailer';

const usuario = () => (process.env.SMTP_USER || 'soporte@viel.cl').trim();

export const correoConfigurado = () => !!process.env.SMTP_PASS?.trim();

export async function enviarCorreo(o: { para: string; asunto: string; texto: string; responderA?: string }) {
  if (!correoConfigurado()) throw new Error('Falta SMTP_PASS en Vercel.');
  const t = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: usuario(), pass: process.env.SMTP_PASS!.replace(/\s/g, '') },
  });
  await t.sendMail({ from: `Mi Ruta VIIGO <${usuario()}>`, to: o.para, subject: o.asunto, text: o.texto, replyTo: o.responderA });
}
