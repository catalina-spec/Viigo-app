import { notFound } from 'next/navigation';
import { TABS } from '@/lib/tabs';
import { AsesorApp } from '@/components/views/Asesor';

export default async function DemoAsesor({ params }: PageProps<'/demo/asesor/[[...tab]]'>) {
  const { tab } = await params;
  const id = tab?.[0] ?? 'inicio';
  if ((tab && tab.length > 1) || !TABS.asesor.some((t) => t.id === id)) notFound();
  return <AsesorApp tab={id} />;
}
