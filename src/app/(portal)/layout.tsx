import { redirect } from 'next/navigation';
import { StoreProvider } from '@/lib/store';
import { getMe } from '@/lib/supabase/server';

// Portales de cliente y asesor: exigen sesión y cargan los datos de quien entró.
export default async function PortalLayout({ children }: LayoutProps<'/'>) {
  const me = await getMe();
  if (!me) redirect('/login');
  return <StoreProvider me={me}>{children}</StoreProvider>;
}
