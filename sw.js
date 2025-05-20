const CACHE_NAME = 'marubatsu-cache-v1.0.0';  // バージョン管理
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon-16x16.png',
  '/manifest.json',
  '/android-icon-192x192.png',
];

self.addEventListener('install', event => {
  console.log(`[Service Worker] Installing cache: ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log(`[Service Worker] Activating and cleaning old caches`);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log(`[Service Worker] Removing old cache: ${key}`);
            return caches.delete(key);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ネットワークレスポンスをキャッシュに保存
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});