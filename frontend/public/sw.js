const CACHE = 'farmiq-shell-v2';
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['/', '/icon.svg', '/manifest.webmanifest'])),
  );
  self.skipWaiting();
});
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('farmiq-shell-') && k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never persist private API responses, financial requests or third-party map tiles.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const publicData =
    url.pathname === '/api/machinery/nearby' ||
    /^\/api\/machinery\/[^/]+$/.test(url.pathname) ||
    url.pathname === '/api/tutorials';
  if (publicData) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then(
              (cached) =>
                cached ||
                Response.json(
                  { error: 'This catalogue has not been saved on this device yet.' },
                  { status: 503 },
                ),
            ),
        ),
    );
    return;
  }
  if (url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')));
    return;
  }
  if (url.pathname.startsWith('/assets/') || ['/icon.svg', '/manifest.webmanifest'].includes(url.pathname))
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(event.request, copy));
            }
            return response;
          }),
      ),
    );
});
