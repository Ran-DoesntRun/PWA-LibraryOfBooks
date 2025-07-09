// Menyimpan nama cache kedalam variabel
const CACHE_NAME = "lob-cache-1";
const cache_genre_2 = "genre-cache-v1";
// Menyimpan data / file yang akan dicache kedalam variabel
const CACHE_ASSETS = [
  "/",
  "index.html",
  "genre.html",
  "search.html",
  "sc_jq.js",
  "jquery-script.js",
  "src/output.css",
  "img/bruh.png",
  "genre.html?genre=romance",
  "genre.html?genre=programming",
  "genre.html?genre=humor",
  "genre.html?genre=horror",
  "genre.html?genre=fiction",
  "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css",
  "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",
];


// Install Service Worker - Cache important assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Service Worker - Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cache) => cache !== CACHE_NAME && cache !== cache_genre_2)
                    .map((cache) => caches.delete(cache))
            );
        })
    );
    self.clients.claim();
});


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`[SW] Serving from ${CACHE_NAME}: ${event.request.url}`);
          return cachedResponse;
        } else {
          console.log(`[SW] Not in ${CACHE_NAME}, fetching: ${event.request.url}`);
          return fetch(event.request).then((networkResponse) => {
            // Optionally: cache new responses in lob-cache-1
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
              console.log(`[SW] Cached in ${CACHE_NAME}: ${event.request.url}`);
            }
            return networkResponse;
          });
        }
      });
    }).catch((err) => {
      console.error(`[SW] Error in ${CACHE_NAME} fetch:`, err);
      return new Response('Offline and resource not cached in lob-cache-1.', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});