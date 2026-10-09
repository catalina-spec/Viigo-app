import { NextResponse, type NextRequest } from 'next/server';
import { getMe } from '@/lib/supabase/server';
import { authUrl, problemaClaves } from '@/lib/google';

// El asesor hace clic en "Conectar Google Calendar" y lo mandamos a Google a dar permiso.
export async function GET(request: NextRequest) {
  const me = await getMe();
  const origin = request.nextUrl.origin;
  if (me?.rol !== 'asesor') return NextResponse.redirect(`${origin}/login`);
  const problema = problemaClaves();
  if (problema) {
    console.error('Google Calendar:', problema);
    return NextResponse.redirect(`${origin}/asesor/agenda?google=claves`);
  }
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(authUrl(`${origin}/api/google/callback`, state, me.email));
  res.cookies.set('g_state', state, { httpOnly: true, secure: origin.startsWith('https'), sameSite: 'lax', maxAge: 600, path: '/' });
  return res;
}
