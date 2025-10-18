// sw.js (простая offline стратегия: cache-first)
const CACHE_NAME = 'crm-pwa-v1';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  // перечислите тут ваши CSS/JS/иконки
];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', ev => {
  ev.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  // for navigation, fallback to index.html (SPA)
  if (req.mode === 'navigate') {
    ev.respondWith(
      fetch(req).catch(()=> caches.match('index.html'))
    );
    return;
  }
  ev.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});
