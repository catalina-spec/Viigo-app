import { NextResponse, type NextRequest } from 'next/server';
import { createClient, getMe } from '@/lib/supabase/server';
import { accessTokenFor, borrarEvento, moverEvento } from '@/lib/google';

async function cargar(id: string) {
  const me = await getMe();
  if (me?.rol !== 'asesor') return { error: NextResponse.json({ error: 'Solo asesores' }, { status: 403 }) };
  const sb = await createClient();
  const { data: r } = await sb.from('reuniones').select('*').eq('id', id).single();
  if (!r) return { error: NextResponse.json({ error: 'No existe' }, { status: 404 }) };
  // El evento vive en el calendario de quien lo creó.
  const access = r.calendar_event_id && r.asesor_id ? await accessTokenFor(r.asesor_id).catch(() => null) : null;
  return { sb, r, access };
}

// Reprogramar: mueve el evento en Google Calendar (el cliente recibe la actualización) y la fecha en la app.
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/reuniones/[id]'>) {
  const { id } = await ctx.params;
  const c = await cargar(id);
  if (c.error) return c.error;
  const inicio = new Date((await request.json()).inicio);
  if (isNaN(inicio.getTime())) return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 });
  if (c.access) await moverEvento(c.access, c.r.calendar_event_id, inicio, c.r.duracion_min ?? 60);
  const { data, error } = await c.sb.from('reuniones').update({ inicio: inicio.toISOString() }).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ error: 'No se pudo reprogramar' }, { status: 500 });
  return NextResponse.json({ reunion: data });
}

// Cancelar: borra el evento (el cliente recibe el aviso) y marca la asesoría como cancelada.
export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/reuniones/[id]'>) {
  const { id } = await ctx.params;
  const c = await cargar(id);
  if (c.error) return c.error;
  if (c.access) await borrarEvento(c.access, c.r.calendar_event_id);
  const { error } = await c.sb.from('reuniones').update({ estado: 'cancelada' }).eq('id', id);
  if (error) return NextResponse.json({ error: 'No se pudo cancelar' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
