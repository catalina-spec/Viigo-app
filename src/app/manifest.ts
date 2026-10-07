import type { MetadataRoute } from 'next';

// Permite instalar la app en la pantalla de inicio del celular y del computador.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Mi Ruta VIIGO',
    short_name: 'VIIGO',
    description: 'Tu ruta inmobiliaria con el Método VIIGO de Viel.cl',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0D1B3E',
    theme_color: '#0D1B3E',
    lang: 'es-CL',
    dir: 'ltr',
    categories: ['finance', 'business', 'education'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    // Accesos directos al mantener presionado el ícono (Android) o clic derecho (computador).
    shortcuts: [
      { name: 'Mi ruta', short_name: 'Mi ruta', url: '/cliente/ruta', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
      { name: 'Mensajes', short_name: 'Mensajes', url: '/cliente/mensajes', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
      { name: 'Agenda (asesor)', short_name: 'Agenda', url: '/asesor/agenda', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
