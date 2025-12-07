
const CACHE_NAME = 'tubarao-cache-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// 2. Activate Service Worker (Clean old caches)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// 3. Fetch Strategy (Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
  // Ignora requisições de API/externas para cache, foca em assets
  if (event.request.url.startsWith('http') && !event.request.url.includes('api')) {
      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            // Cache hit - return response
            if (response) {
              return response;
            }
            return fetch(event.request).then(
              (response) => {
                // Check if we received a valid response
                if(!response || response.status !== 200 || response.type !== 'basic') {
                  return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });

                return response;
              }
            );
          })
      );
  }
});

// 4. Push Notifications Handler
self.addEventListener('push', (event) => {
  let data = { title: 'Tubarão Empréstimos', body: 'Nova atualização disponível!', icon: 'https://cdn.jsdelivr.net/npm/twemoji@11.3.0/2/72x72/1f988.png' };
  
  if (event.data) {
    try {
        data = JSON.parse(event.data.text());
    } catch(e) {
        data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.icon,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {action: 'explore', title: 'Ver Detalhes'}
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
