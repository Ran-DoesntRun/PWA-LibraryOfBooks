// Menyimpan nama cache kedalam variabel
const CACHE_NAME = "lob-cache-1";
const cache_genre_2 = "genre-cache-v1";
// Menyimpan data / file static yang akan dicache kedalam variabel
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


// Script untuk menginstall service worker, dan ketika terinstall, file - file yang sudah di taruh dalam variabel CACHE_ASSETS disimpan pada cache bernama lob-cache-v1
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Script untuk mengaktifkan servis worker dan ketika telah diaktifkan, akan menghapus semua cache kecuali cache yang bernama genre-cache-v1 dan lob-cache-1
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

// Script untuk melakukan fetch data dari cache jika ada 
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => { // Cache lob-cache-1 dibuka
      return cache.match(event.request).then((cachedResponse) => { //Mengambil data dari cache lob-cache-1 dengan request yang sesuai
        if (cachedResponse) {
          return cachedResponse; //Mengembalikan data dari cache jika ada
        } else {
          //Mengambil data dari internet jika tidak ada pada cache
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone()); //Menyimpan data yang diambil dari internet ke dalam cache lob-cache-1
            }
            return networkResponse;
          });
        }
      });
    })
  );
});