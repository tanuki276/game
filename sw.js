const CACHE_NAME = 'marubatsu-cache-v1.1.0';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon-16x16.png',
  '/manifest.json',
  '/android-icon-192x192.png',
  '/icon-512x512.png',
  // 必要に応じてCSS/JSも追記
];

// インストール時にキャッシュ登録
self.addEventListener('install', event => {
  console.log(`[SW] Installing cache: ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', event => {
  console.log('[SW] Activating and cleaning old caches');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log(`[SW] Removing old cache: ${key}`);
          return caches.delete(key);
        }
      })
    )).then(() => self.clients.claim())
  );
});

// fetch時のキャッシュ戦略：キャッシュ優先、なければネット
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // オフライン時 fallback（必要ならここで /offline.html に誘導なども可）
      return caches.match('/index.html');
    })
  );
});

// 通知受信用のイベント（通知が必要な場合）
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || "通知タイトル";
  const options = {
    body: data.body || "通知内容",
    icon: "/android-icon-192x192.png",
    badge: "/icon-512x512.png"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});