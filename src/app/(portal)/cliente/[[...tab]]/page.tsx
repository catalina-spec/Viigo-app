import { notFound, redirect } from 'next/navigation';
import { TABS } from '@/lib/tabs';
import { getMe } from '@/lib/supabase/server';
import { ClienteApp } from '@/components/views/Cliente';

export default async function ClientePage({ params }: PageProps<'/cliente/[[...tab]]'>) {
  const me = await getMe();
  if (me?.rol === 'asesor') redirect('/asesor');
  const { tab } = await params;
  const id = tab?.[0] ?? 'inicio';
  if ((tab && tab.length > 1) || !TABS.cliente.some((t) => t.id === id)) notFound();
  return <ClienteApp tab={id} />;
}
