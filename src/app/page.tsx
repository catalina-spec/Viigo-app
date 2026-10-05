import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';

// Cada persona va a su portal según su rol; sin sesión, al login.
export default async function Home() {
  const me = await getMe();
  redirect(me ? `/${me.rol}` : '/login');
}
