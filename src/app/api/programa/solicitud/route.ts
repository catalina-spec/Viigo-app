import { NextResponse, type NextRequest } from 'next/server';
import { createClient, getMe } from '@/lib/supabase/server';
import { correoConfigurado, enviarCorreo } from '@/lib/correo';

// El cliente toca "Quiero el Programa VIIGO": avisamos a su asesor por correo
// y dejamos el mensaje en el portal (así también le aparece el aviso rojo en la app).
export async function POST(request: NextRequest) {
  const me = await getMe();
  if (!me || me.rol !== 'cliente') return NextResponse.json({ error: 'Solo un cliente puede pedir el programa.' }, { status: 403 });

  const sb = await createClient();
  const { data: p } = await sb.from('perfiles').select('nombre,apellido,email,celular,asesor_id,plan').eq('id', me.id).single();
  if (p?.plan === 'programa') return NextResponse.json({ ok: true, yaActivo: true });

  // Mensaje en el portal (no se repite si ya lo pidió en las últimas 24 horas).
  const texto = 'Hola, quiero contratar el Programa VIIGO.';
  const desde = new Date(Date.now() - 864e5).toISOString();
  const { data: previo } = await sb.from('mensajes').select('id').eq('cliente_id', me.id).eq('autor_id', me.id).eq('texto', texto).gte('creado_en', desde).limit(1);
  const repetido = !!previo?.length;
  if (!repetido) await sb.from('mensajes').insert({ cliente_id: me.id, texto });

  // Correo al asesor (o a Catalina si el cliente aún no tiene asesor).
  let correo = false;
  if (!repetido && correoConfigurado()) {
    try {
      let para = 'catalina@viel.cl';
      if (p?.asesor_id) {
        const { data: a } = await sb.from('perfiles').select('email').eq('id', p.asesor_id).maybeSingle();
        if (a?.email) para = a.email;
      }
      const nombre = `${p?.nombre ?? ''} ${p?.apellido ?? ''}`.trim() || me.email;
      await enviarCorreo({
        para,
        asunto: `${nombre} quiere el Programa VIIGO`,
        responderA: me.email,
        texto: [
          `${nombre} tocó "Quiero el Programa VIIGO" en Mi Ruta VIIGO.`,
          '',
          `Correo: ${me.email}`,
          p?.celular ? `Celular: ${p.celular}` : '',
          '',
          'Cuando confirme el pago, entra a su ficha y toca "Desbloquear Programa VIIGO".',
          `${request.nextUrl.origin}/asesor`,
          '',
          'Puedes responder este correo para escribirle directamente.',
        ].filter((l, i, a) => l || a[i - 1]).join('\n'),
      });
      correo = true;
    } catch (e) {
      console.error('Correo programa', e);
    }
  }
  return NextResponse.json({ ok: true, repetido, correo });
}
