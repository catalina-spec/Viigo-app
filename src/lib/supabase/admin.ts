import { createClient } from '@supabase/supabase-js';

// Cliente con la clave SECRETA de Supabase. Solo se usa en el servidor (rutas /api),
// nunca en el navegador. Hoy solo lee y guarda la conexión de Google de cada asesor.
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!key) throw new Error('Falta SUPABASE_SECRET_KEY en las variables de entorno.');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
