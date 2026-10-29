import { NextResponse, type NextRequest } from 'next/server';
import { correoConfigurado, enviarCorreo } from '@/lib/correo';

// Registro de la landing /asesoria: cada persona que completa el formulario llega por correo.
// (Cuando las asesorías pasen a la Vero, cambia LEADS_PARA en Vercel por su correo.)
const PARA = () => (process.env.LEADS_PARA || 'catalina@viel.cl').trim();

const EDAD: Record<string, string> = { menos30: 'Menos de 30', '30-34': '30 a 34', '35-42': '35 a 42', '43-50': '43 a 50', mas50: 'Más de 50' };
const AHORRO: Record<string, string> = { menos500: 'Menos de UF 500', '500-1000': 'UF 500 a 1.000', '1000-2000': 'UF 1.000 a 2.000', mas2000: 'Más de UF 2.000' };
const TRABAJO: Record<string, string> = { indefinido: 'Contrato indefinido', independiente: 'Independiente, 2+ años', otra: 'Otra' };
const PROPIEDADES: Record<string, string> = { ninguna: 'Ninguna', vivienda: 'Solo su vivienda', una: '1 de inversión', varias: '2 o más de inversión' };

const txt = (x: unknown, max = 200) => (typeof x === 'string' ? x.trim().slice(0, max) : '');

export async function POST(request: NextRequest) {
  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
  }
  const nombre = txt(b.nombre, 120);
  const email = txt(b.email, 160);
  const whatsapp = txt(b.whatsapp, 40);
  if (!nombre || !/.+@.+\..+/.test(email)) return NextResponse.json({ error: 'Faltan nombre o email.' }, { status: 400 });

  const califica = b.califica === true;
  const busca = Array.isArray(b.busca) ? b.busca.map((x) => txt(x, 60)).filter(Boolean).join(', ') : '';
  const utm = b.utm && typeof b.utm === 'object' ? Object.entries(b.utm as Record<string, unknown>).map(([k, v]) => `${txt(k, 30)}: ${txt(v, 120)}`).join(' · ') : '';

  if (!correoConfigurado()) {
    console.error('Lead asesoría sin correo configurado', { nombre, email });
    return NextResponse.json({ ok: false, correo: false });
  }
  try {
    await enviarCorreo({
      para: PARA(),
      asunto: `${califica ? 'Nuevo lead CALIFICADO' : 'Nuevo lead (no califica)'}: ${nombre}`,
      responderA: email,
      texto: [
        `${nombre} completó el formulario de la landing del Diagnóstico VIIGO.`,
        califica ? 'Califica: ya puede ver el calendario para agendar.' : 'No califica: se le ofreció el ebook y la masterclass.',
        '',
        `Email: ${email}`,
        `WhatsApp: ${whatsapp}`,
        `Edad: ${EDAD[txt(b.edad)] ?? txt(b.edad)}`,
        `Ahorro: ${AHORRO[txt(b.ahorro)] ?? txt(b.ahorro)}`,
        `Situación laboral: ${TRABAJO[txt(b.trabajo)] ?? txt(b.trabajo)}`,
        `Propiedades hoy: ${PROPIEDADES[txt(b.propiedades)] ?? txt(b.propiedades)}`,
        busca ? `Qué busca: ${busca}` : '',
        '',
        utm ? `Origen: ${utm}` : 'Origen: sin UTM',
        '',
        'Puedes responder este correo para escribirle directamente.',
      ].filter((l, i, a) => l || a[i - 1]).join('\n'),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Correo lead asesoría', e);
    return NextResponse.json({ ok: false, correo: false });
  }
}
