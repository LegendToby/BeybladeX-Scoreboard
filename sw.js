const CACHE_NAME = 'beyx-scoreboard-v1';
const ASSETS_TO_CACHE = [ './', './index.html', './style.css', './parts.js', './app.js' ];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS_TO_CACHE))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.map((k) => { if (k !== CACHE_NAME) return caches.delete(k); })))); self.clients.claim(); });
self.addEventListener('fetch', (e) => { e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request))); });