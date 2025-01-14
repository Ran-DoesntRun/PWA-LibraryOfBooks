const CACHE_NAME = 'lob-cache-v1';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/jquery.js',
    '/jquery-script.js',
    '/style.css',
    '/images/bruh.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cache) => cache !== CACHE_NAME)
                    .map((cache) => caches.delete(cache))
            );
        })
    );
    self.clients.claim();
});


self.addEventListener('fetch', (event) => {
    var request      = event.request

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request)
                .then((response) => {
                    return caches.open('buku-cache').then((cache) => {
                        cache.put(request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    if (request.url.includes('.json')) {
                        return new Response(
                            JSON.stringify({ error: 'Offline data not available.' }),
                            { headers: { 'Content-Type': 'application/json' } }
                        );
                    }
                    return caches.match('/fallback.html'); 
                });
        })
    )
});
