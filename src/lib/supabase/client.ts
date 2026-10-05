import { createBrowserClient } from '@supabase/ssr';

// Cliente de Supabase para el navegador. La seguridad la ponen las reglas RLS de la base de datos.
export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
