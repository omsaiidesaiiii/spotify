const CACHE_NAME = 'soundwave-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/home',
  '/search',
  '/library',
  '/downloads',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached asset if found, otherwise fetch from network
      return cachedResponse || fetch(event.request).catch(() => {
        // Fallback for navigation requests when totally offline
        if (event.request.mode === 'navigate') {
          return caches.match('/home');
        }
      });
    })
  );
});
