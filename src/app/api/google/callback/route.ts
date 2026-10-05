import { NextResponse, type NextRequest } from 'next/server';
import { getMe } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { emailFromIdToken, exchangeCode } from '@/lib/google';

// Google vuelve aquí después de que el asesor da permiso; guardamos la conexión.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const back = (r: string) => {
    const res = NextResponse.redirect(`${origin}/asesor/agenda?google=${r}`);
    res.cookies.delete('g_state');
    return res;
  };
  const me = await getMe();
  if (me?.rol !== 'asesor') return NextResponse.redirect(`${origin}/login`);
  const code = searchParams.get('code');
  if (!code || searchParams.get('state') !== request.cookies.get('g_state')?.value) return back('error');

  try {
    const t = await exchangeCode(code, `${origin}/api/google/callback`);
    if (!t.refresh_token) return back('error');
    const { error } = await createAdminClient().from('google_conexiones').upsert({
      asesor_id: me.id, google_email: emailFromIdToken(t.id_token) || me.email, refresh_token: t.refresh_token, conectado_en: new Date().toISOString(),
    });
    if (error) throw error;
    return back('ok');
  } catch (e) {
    console.error('Google callback', e);
    return back('error');
  }
}
