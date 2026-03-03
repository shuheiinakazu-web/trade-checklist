const CACHE_NAME = 'trade-precheck-cache-v2';
const OFFLINE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// HTMLは「ネット優先」、その他はキャッシュ優先
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // ナビゲーション（ページ本体）はネット優先
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match('./index.html')))
    );
    return;
  }

  // それ以外はキャッシュ優先
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

