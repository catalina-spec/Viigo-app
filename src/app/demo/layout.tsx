import type { Metadata } from 'next';
import { StoreProvider } from '@/lib/store';

export const metadata: Metadata = { title: 'Mi Ruta VIIGO · Demo', robots: { index: false } };

// Vista demo: sin login, con datos de ejemplo y sin guardar nada. Para presentar la app.
export default function DemoLayout({ children }: LayoutProps<'/demo'>) {
  return <StoreProvider demo me={{ id: 'demo', email: 'demo@viigo', rol: 'asesor' }}>{children}</StoreProvider>;
}
