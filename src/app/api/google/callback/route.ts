import { NextResponse, type NextRequest } from 'next/server';
import { getMe } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { emailFromIdToken, exchangeCode } from '@/lib/google';

// Google vuelve aquí después de que el asesor da permiso; guardamos la conexión.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  // r = resultado; detalle = motivo del error para mostrarlo al asesor (nunca incluye claves).
  const back = (r: string, detalle = '') => {
    const q = new URLSearchParams({ google: r, ...(detalle ? { detalle: detalle.slice(0, 200) } : {}) });
    const res = NextResponse.redirect(`${origin}/asesor/agenda?${q}`);
    res.cookies.delete('g_state');
    return res;
  };
  const me = await getMe();
  if (me?.rol !== 'asesor') return NextResponse.redirect(`${origin}/login`);
  const denegado = searchParams.get('error');
  if (denegado) return back('error', `Google respondió: ${denegado}`);
  const code = searchParams.get('code');
  if (!code) return back('error', 'Google no envió el código de autorización.');
  if (searchParams.get('state') !== request.cookies.get('g_state')?.value) return back('error', 'La sesión de conexión expiró o se abrió en otro navegador. Vuelve a tocar Conectar desde la app.');

  try {
    const t = await exchangeCode(code, `${origin}/api/google/callback`);
    if (!t.refresh_token) return back('error', 'Google no entregó el permiso permanente (refresh token).');
    const { error } = await createAdminClient().from('google_conexiones').upsert({
      asesor_id: me.id, google_email: emailFromIdToken(t.id_token) || me.email, refresh_token: t.refresh_token, conectado_en: new Date().toISOString(),
    });
    if (error) throw error;
    return back('ok');
  } catch (e) {
    console.error('Google callback', e);
    return back('error', e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e));
  }
}
