
// Service Worker for Tubarão Empréstimos PWA

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Handle Push Notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received');
  
  let data = { title: 'Tubarão Empréstimos', body: 'Nova atualização disponível!', icon: '/icon-192x192.png' };
  
  if (event.data) {
    try {
        data = JSON.parse(event.data.text());
    } catch(e) {
        data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
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
    clients.openWindow('/client/dashboard')
  );
});

// Simulating a background sync for "Check installments"
self.addEventListener('sync', (event) => {
    if (event.tag === 'check-installments') {
        event.waitUntil(
            // logic to check local db and trigger notification
            self.registration.showNotification('Lembrete de Pagamento', {
                body: 'Sua parcela vence amanhã. Evite juros!',
                icon: '/icon-192x192.png'
            })
        );
    }
});
