// Service worker de Mi Ruta VIIGO.
// - Guarda los archivos de la app (diseño, íconos, logos) para que abra rápido.
// - Las páginas se piden siempre a internet; sin conexión muestra /offline.html.
// - Nunca guarda datos personales: las llamadas a Supabase, /api y /auth pasan directo.

const VERSION = 'viigo-v1';
const STATIC = `${VERSION}-static`;
const PRECACHE = ['/offline.html', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/logos/viel.png', '/logos/vielpm.svg', '/logos/capitalq.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Solo nuestro propio sitio y las fuentes de Google; nada de Supabase ni otras APIs.
  const fuentes = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !fuentes) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  // Páginas: siempre desde internet (datos al día); sin conexión, la página de aviso.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    return;
  }

  // Archivos que no cambian (código de la app con versión en el nombre, íconos, logos, fuentes).
  const inmutable = url.pathname.startsWith('/_next/static/') || /\.(png|svg|jpg|jpeg|webp|woff2?)$/.test(url.pathname) || fuentes;
  if (inmutable) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copia = res.clone();
          caches.open(STATIC).then((c) => c.put(req, copia));
        }
        return res;
      })),
    );
  }
});
