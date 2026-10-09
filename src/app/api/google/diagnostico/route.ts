import { NextResponse, type NextRequest } from 'next/server';
import { problemaClaves } from '@/lib/google';

// Diagnóstico de la conexión con Google (sin datos secretos):
// muestra el ID de cliente (es público: va en la dirección de Google) y si el secreto tiene el formato esperado.
export async function GET(request: NextRequest) {
  const id = (process.env.GOOGLE_CLIENT_ID ?? '').trim();
  const secret = (process.env.GOOGLE_CLIENT_SECRET ?? '').trim();
  return NextResponse.json({
    problema: problemaClaves(),
    clientId: id,
    clientIdLargo: id.length,
    secretoPresente: !!secret,
    secretoFormatoGOCSPX: secret.startsWith('GOCSPX-'),
    secretoLargo: secret.length,
    redirectUri: `${request.nextUrl.origin}/api/google/callback`,
    claveSupabasePresente: !!process.env.SUPABASE_SECRET_KEY,
  });
}
