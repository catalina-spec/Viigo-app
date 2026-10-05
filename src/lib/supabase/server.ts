import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cliente de Supabase para el servidor (páginas y rutas), usando la sesión guardada en cookies.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // En componentes de servidor no se pueden escribir cookies; el proxy ya renueva la sesión.
        }
      },
    },
  });
}

export type Me = { id: string; email: string; rol: 'cliente' | 'asesor' };

/** Usuario conectado y su rol, o null si no hay sesión. */
export async function getMe(): Promise<Me | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', data.user.id).single();
  return { id: data.user.id, email: data.user.email ?? '', rol: perfil?.rol === 'asesor' ? 'asesor' : 'cliente' };
}
