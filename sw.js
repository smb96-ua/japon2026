const CACHE_NAME = 'japon2026-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './images/tokyo.jpg',
  './images/kamakura.jpg',
  './images/hiroshima.jpg',
  './images/osaka.jpg',
  './images/kyoto.jpg',
  './images/nara.jpg',
  './images/icon-192.png',
  './images/icon-512.png'
];

// Instalar el Service Worker y cachear recursos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando todos los recursos');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar el Service Worker y limpiar cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar peticiones y responder desde la caché (Cache First)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Opcional: Podríamos cachear dinámicamente nuevos recursos aquí
        return networkResponse;
      });
    }).catch(() => {
      // Si falla todo (offline y no está en caché)
      console.log('[Service Worker] Recurso no encontrado y sin conexión');
    })
  );
});
