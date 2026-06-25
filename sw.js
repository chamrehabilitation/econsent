const CACHE_NAME = 'econsent-v20260625-3';
const APP_SHELL = [
  '/econsent/',
  '/econsent/index.html',
  '/econsent/manifest.json',
  '/econsent/icon-192.png',
  '/econsent/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
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
  const req = event.request;

  // GET 요청만 처리
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(networkRes => {
        // 같은 출처만 캐시
        const url = new URL(req.url);
        if (url.origin === location.origin) {
          const cloned = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, cloned));
        }
        return networkRes;
      }).catch(() => {
        // 오프라인 시 메인으로 fallback
        if (req.mode === 'navigate') {
          return caches.match('/econsent/index.html');
        }
      });
    })
  );
});
