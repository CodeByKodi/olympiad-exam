/**
 * Service worker for Olympiad Mock Exam - caches app and starter packs for offline use.
 */
const CACHE_NAME = 'olympiad-exam-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const base = self.location.pathname.replace(/sw\.js$/, '');
      return cache.addAll([
        base || './',
        base ? `${base}index.html` : './index.html',
        base ? `${base}favicon.svg` : './favicon.svg',
        base ? `${base}icons.svg` : './icons.svg',
      ]);
    }).then(() => self.skipWaiting()).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && /\.(html|js|css|json|svg)$/.test(url.pathname)) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => {
        const base = self.location.pathname.replace(/sw\.js$/, '') || '/';
        const indexUrl = new URL('index.html', self.location.origin + base).href;
        return caches.match(request).then((cached) =>
          cached || (request.mode === 'navigate' ? caches.match(indexUrl) : null)
        );
      })
  );
});
