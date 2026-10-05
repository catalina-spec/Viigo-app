import { notFound } from 'next/navigation';
import { TABS } from '@/lib/tabs';
import { ClienteApp } from '@/components/views/Cliente';

export default async function ClientePage({ params }: PageProps<'/cliente/[[...tab]]'>) {
  const { tab } = await params;
  const id = tab?.[0] ?? 'inicio';
  if ((tab && tab.length > 1) || !TABS.cliente.some((t) => t.id === id)) notFound();
  return <ClienteApp tab={id} />;
}
