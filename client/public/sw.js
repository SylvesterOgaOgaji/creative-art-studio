/* global caches, fetch, Response, self, URL */

const CACHE_NAME = "creative-art-studio-shell-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(
              key =>
                key.startsWith("creative-art-studio-shell-") &&
                key !== CACHE_NAME
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(response => {
          if (
            !response ||
            response.status !== 200 ||
            response.type === "opaque"
          ) {
            return response;
          }

          const responseCopy = response.clone();
          void caches
            .open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseCopy));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          return Response.error();
        });
    })
  );
});
