import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Landing de la asesoría (archivo estático en public/asesoria): viigo.viel.cl/asesoria
  async rewrites() {
    return [{ source: '/asesoria', destination: '/asesoria/index.html' }];
  },
  // Encabezados de seguridad (guía PWA de Next.js) y reglas del service worker.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
