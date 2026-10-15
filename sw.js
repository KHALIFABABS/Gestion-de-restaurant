/* Service Worker — Mon Restaurant v1.1 */
const CACHE_NAME = 'restaurant-v1.3';
const CORE_ASSETS = [
  './',
  './gestionnaire-restaurant.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* Installation : mettre en cache les fichiers essentiels */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
});

/* Activation : supprimer les anciens caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch : stratégie "cache first, network fallback" */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./gestionnaire-restaurant.html'));
    })
  );
});

/* Message pour forcer la mise à jour */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
