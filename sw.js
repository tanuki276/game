const CACHE_NAME = 'marubatsu-cache-v1.0.0';  // バージョン管理
const FILES_TO_CACHE = [
  '/',               // ルート
  '/index.html',     // HTML
  '/favicon-16x16.png',  // アイコン
  // きゃっしゅするふぁいる
];

self.addEventListener('install', event => {
  console.log(`[Service Worker] Installing cache: ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log(`[Service Worker] Activating and cleaning old caches`);
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              console.log(`[Service Worker] Removing old cache: ${key}`);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // ネットワーク優先。オフライン時はキャッシュ返す
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});