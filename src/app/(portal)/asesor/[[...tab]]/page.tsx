import { notFound, redirect } from 'next/navigation';
import { TABS } from '@/lib/tabs';
import { getMe } from '@/lib/supabase/server';
import { AsesorApp } from '@/components/views/Asesor';

export default async function AsesorPage({ params }: PageProps<'/asesor/[[...tab]]'>) {
  const me = await getMe();
  if (me?.rol !== 'asesor') redirect('/cliente');
  const { tab } = await params;
  const id = tab?.[0] ?? 'inicio';
  if ((tab && tab.length > 1) || !TABS.asesor.some((t) => t.id === id)) notFound();
  return <AsesorApp tab={id} />;
}
