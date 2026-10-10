import { NextResponse, type NextRequest } from 'next/server';
import { problemaClaves } from '@/lib/google';
import { createAdminClient } from '@/lib/supabase/admin';

// Diagnóstico de la conexión con Google (sin datos secretos):
// muestra el ID de cliente (es público: va en la dirección de Google) y si el secreto tiene el formato esperado.
export async function GET(request: NextRequest) {
  const id = (process.env.GOOGLE_CLIENT_ID ?? '').trim();
  const secret = (process.env.GOOGLE_CLIENT_SECRET ?? '').trim();
  // Clave secreta de Supabase: tipo, largo y si Supabase la acepta (nunca se muestra su valor).
  const sk = (process.env.SUPABASE_SECRET_KEY ?? '').trim();
  const tipo = sk.startsWith('sb_secret_') ? 'sb_secret_ (correcta)' : sk.startsWith('sb_publishable_') ? 'sb_publishable_ (ES LA PÚBLICA, no la secreta)' : sk.startsWith('eyJ') ? 'JWT antigua (service_role o anon)' : sk ? 'formato desconocido' : 'falta';
  let supabaseAcepta: string = 'no probada';
  if (sk) {
    try {
      const { error } = await createAdminClient().from('google_conexiones').select('asesor_id', { head: true, count: 'exact' });
      supabaseAcepta = error ? `NO: ${error.message}` : 'sí';
    } catch (e) {
      supabaseAcepta = `NO: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  return NextResponse.json({
    problema: problemaClaves(),
    clientId: id,
    clientIdLargo: id.length,
    secretoPresente: !!secret,
    secretoFormatoGOCSPX: secret.startsWith('GOCSPX-'),
    secretoLargo: secret.length,
    redirectUri: `${request.nextUrl.origin}/api/google/callback`,
    claveSupabasePresente: !!sk,
    claveSupabaseTipo: tipo,
    claveSupabaseLargo: sk.length,
    claveSupabaseAcepta: supabaseAcepta,
    espaciosOComillas: (process.env.SUPABASE_SECRET_KEY ?? '') !== sk || /["'s]/.test(sk),
  });
}
