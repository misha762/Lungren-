const CACHE_NAME = 'plan-lungrena-v3';
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';

const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/export.js',
  '/sw.js'
];

// Стратегія кешування: Network First для динамічного контенту
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Для API запитів використовуємо Network First
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Клонуємо response для кешування
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // Якщо мережа недоступна, беремо з кешу
          return caches.match(request);
        })
    );
  }
});

// Встановлення та кешування статичних ресурсів
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE)
        .then(cache => {
          return cache.addAll(urlsToCache);
        }),
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          return cache.addAll(urlsToCache);
        })
    ])
  );
  // Активація нового service worker одразу
  self.skipWaiting();
});

// Активація та очищення старих кешів
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Очищення старих кешів
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Встановлення контролю над усіма клієнтами
      self.clients.claim()
    ])
  );
});

// Обробка push повідомлень
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Час для тренування!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Почати тренування',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Закрити',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('План Лунгрена', options)
  );
});

// Обробка кліків по сповіщеннях
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Синхронізація в фоновому режимі
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Тут можна додати синхронізацію даних
      console.log('Background sync triggered')
    );
  }
});
