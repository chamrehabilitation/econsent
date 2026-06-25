const CACHE_NAME = 'econsent-v20260625-final';
const APP_SHELL = [
  '/econsent/',
  '/econsent/index.html',
  '/econsent/manifest.json',
  '/econsent/icon-192.png',
  '/econsent/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(res => {
        const cloned = res.clone();
        const url = new URL(event.request.url);

        if (url.origin === location.origin) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return res;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/econsent/index.html');
        }
      });
    })
  );
});
