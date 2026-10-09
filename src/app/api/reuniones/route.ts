import { NextResponse, type NextRequest } from 'next/server';
import { createClient, getMe } from '@/lib/supabase/server';
import { accessTokenFor, crearEvento } from '@/lib/google';
import { sesionTitulo } from '@/lib/demo-data';

// Agenda una asesoría: crea el evento con Meet en el calendario del asesor, invita al cliente
// y la guarda en la base de datos. Si el asesor no ha conectado Google, se guarda sin Meet.
export async function POST(request: NextRequest) {
  const me = await getMe();
  if (me?.rol !== 'asesor') return NextResponse.json({ error: 'Solo asesores' }, { status: 403 });
  const { clienteId, sesion, inicio } = await request.json();
  const minutos = sesion === 0 ? 30 : 60;
  const fecha = new Date(inicio);
  if (!clienteId || !(sesion >= 0 && sesion <= 4) || isNaN(fecha.getTime())) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });

  const sb = await createClient();
  const { data: cli } = await sb.from('perfiles').select('email,nombre,plan').eq('id', clienteId).single();
  if (!cli) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  if (sesion >= 1 && cli.plan !== 'programa') return NextResponse.json({ error: 'Las sesiones 1 a 4 son del Programa VIIGO. Desbloquéalo primero en la ficha del cliente.' }, { status: 403 });

  const titulo = sesion === 0 ? 'Diagnóstico VIIGO · 30 min' : `Asesoría VIIGO · Sesión ${sesion}: ${sesionTitulo(sesion)}`;
  let meetUrl: string | null = null, eventId: string | null = null, aviso: string | null = null;
  try {
    const access = await accessTokenFor(me.id);
    if (access) {
      ({ meetUrl, eventId } = await crearEvento(access, {
        titulo, minutos, inicio: fecha, invitado: cli.email,
        descripcion: `${sesion === 0 ? 'Sesión de diagnóstico gratuita del Método VIIGO (30 minutos).' : 'Sesión ' + sesion + ' del Programa Método VIIGO.'}\n\nEntra a tu portal para ver tu ruta, tus objetivos y el resumen de cada asesoría: ${request.nextUrl.origin}`,
      }));
    } else aviso = 'Conecta tu Google Calendar para crear el link de Meet e invitar al cliente automáticamente.';
  } catch (e) {
    console.error(e);
    aviso = 'La asesoría quedó guardada, pero Google Calendar no respondió. Revisa tu conexión con Google.';
  }

  const { data, error } = await sb.from('reuniones').insert({
    cliente_id: clienteId, asesor_id: me.id, sesion, titulo, inicio: fecha.toISOString(), duracion_min: minutos,
    meet_url: meetUrl, calendar_event_id: eventId,
  }).select('*').single();
  if (error) return NextResponse.json({ error: 'No se pudo guardar la asesoría' }, { status: 500 });
  return NextResponse.json({ reunion: data, aviso });
}
