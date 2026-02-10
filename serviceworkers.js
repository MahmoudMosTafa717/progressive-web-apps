const CACHE_NAME = "pwa-cache-v1";
const NOT_FOUND_URL = "./404.html";
const OFFLINE_URL = "./offline.html";

const CACHED_PAGES = [
  "./",
  "./index.html",
  "./cached.html",
  "./offline.html",
  "./404.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHED_PAGES);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 404) {
          return caches.match(NOT_FOUND_URL);
        }

        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
        });
      }),
  );
});
