const CACHE_NAME = 'dtp-service-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Установка воркера и кеширование
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

// Перехват запросов (работа без интернета)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Возвращаем из кеша, если есть, иначе идем в сеть
            return response || fetch(event.request);
        })
    );
});
