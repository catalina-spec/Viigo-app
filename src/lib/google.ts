// Google Calendar + Meet (solo servidor).
// Cada asesor conecta su cuenta @viel.cl una vez; con ese permiso creamos los eventos
// en SU calendario, con link de Meet, y Google le envía la invitación al cliente.

import { createAdminClient } from './supabase/admin';

const SCOPES = ['openid', 'email', 'https://www.googleapis.com/auth/calendar.events'];
const CAL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
export const TZ = 'America/Santiago';

const env = () => {
  const id = process.env.GOOGLE_CLIENT_ID, secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en las variables de entorno.');
  return { id, secret };
};

export function authUrl(redirectUri: string, state: string, email: string) {
  const p = new URLSearchParams({
    client_id: env().id, redirect_uri: redirectUri, response_type: 'code', scope: SCOPES.join(' '),
    access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', login_hint: email, state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

async function token(body: Record<string, string>) {
  const { id, secret } = env();
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: secret, ...body }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Google token: ${json.error_description ?? json.error ?? res.status}`);
  return json as { access_token: string; refresh_token?: string; id_token?: string };
}

export const exchangeCode = (code: string, redirectUri: string) => token({ code, redirect_uri: redirectUri, grant_type: 'authorization_code' });

/** Correo de la cuenta de Google que autorizó (viene dentro del id_token). */
export function emailFromIdToken(idToken?: string) {
  if (!idToken) return '';
  try {
    return JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString()).email ?? '';
  } catch {
    return '';
  }
}

/** Token de acceso vigente para el asesor, o null si no ha conectado su Google. */
export async function accessTokenFor(asesorId: string): Promise<string | null> {
  const { data } = await createAdminClient().from('google_conexiones').select('refresh_token').eq('asesor_id', asesorId).maybeSingle();
  if (!data) return null;
  return (await token({ refresh_token: data.refresh_token, grant_type: 'refresh_token' })).access_token;
}

async function cal(access: string, url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (method === 'DELETE' && (res.status === 204 || res.status === 410)) return null;
  const json = await res.json();
  if (!res.ok) throw new Error(`Google Calendar: ${json.error?.message ?? res.status}`);
  return json;
}

export type EventoInput = { titulo: string; descripcion: string; inicio: Date; minutos: number; invitado: string };

/** Crea el evento con su link de Meet y envía la invitación al cliente. */
export async function crearEvento(access: string, e: EventoInput) {
  const fin = new Date(e.inicio.getTime() + e.minutos * 60e3);
  const ev = await cal(access, `${CAL}?conferenceDataVersion=1&sendUpdates=all`, 'POST', {
    summary: e.titulo,
    description: e.descripcion,
    start: { dateTime: e.inicio.toISOString(), timeZone: TZ },
    end: { dateTime: fin.toISOString(), timeZone: TZ },
    attendees: [{ email: e.invitado }],
    conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 24 * 60 }, { method: 'popup', minutes: 30 }] },
  });
  return { eventId: ev.id as string, meetUrl: (ev.hangoutLink as string | undefined) ?? null };
}

export async function moverEvento(access: string, eventId: string, inicio: Date, minutos: number) {
  const fin = new Date(inicio.getTime() + minutos * 60e3);
  await cal(access, `${CAL}/${encodeURIComponent(eventId)}?sendUpdates=all`, 'PATCH', {
    start: { dateTime: inicio.toISOString(), timeZone: TZ },
    end: { dateTime: fin.toISOString(), timeZone: TZ },
  });
}

export async function borrarEvento(access: string, eventId: string) {
  await cal(access, `${CAL}/${encodeURIComponent(eventId)}?sendUpdates=all`, 'DELETE');
}
