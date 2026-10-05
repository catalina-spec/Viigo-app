import type { MetadataRoute } from 'next';

// Permite instalar la app en la pantalla de inicio del celular.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mi Ruta VIIGO',
    short_name: 'VIIGO',
    description: 'Tu ruta inmobiliaria con el Método VIIGO de Viel.cl',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D1B3E',
    theme_color: '#0D1B3E',
    lang: 'es-CL',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
