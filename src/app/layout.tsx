import type { Metadata, Viewport } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { RegistrarSW } from '@/components/Pwa';
import './globals.css';

const sans = DM_Sans({ variable: '--font-sans', subsets: ['latin'] });
const serif = Playfair_Display({ variable: '--font-serif', subsets: ['latin'], weight: ['500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Mi Ruta VIIGO',
  description: 'Tu ruta inmobiliaria con el Método VIIGO de Viel.cl',
  applicationName: 'Mi Ruta VIIGO',
  appleWebApp: { capable: true, title: 'VIIGO', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0D1B3E',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable}`}>
      <body>
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
