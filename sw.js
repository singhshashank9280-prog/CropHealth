/* ==========================================================
   CROPHEALTH - SERVICE WORKER
   Caches the app shell so the site loads offline.
   Bump CACHE_VERSION whenever you change cached files so
   returning visitors pick up the new version.
   ========================================================== */

const CACHE_VERSION = "crophealth-v1";

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/script.js",
  "./pages/disease.html",
  "./pages/camera.html",
  "./pages/voice.html",
  "./pages/language.html",
  "./pages/history.html",
  "./pages/about.html",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
  /* Model files are intentionally NOT pre-cached here because they
     can be large. They're cached on first use instead (see fetch
     handler below), so the very first disease detection needs a
     network connection but every one after that works offline. */
];

/* ----------------------------------------------------------
   INSTALL - pre-cache the app shell
---------------------------------------------------------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

/* ----------------------------------------------------------
   ACTIVATE - clear out old cache versions
---------------------------------------------------------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ----------------------------------------------------------
   FETCH - cache-first for the app shell, network-first
   (falling back to cache) for everything else, including
   the teachable-machine model files and weather API calls.
---------------------------------------------------------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never try to cache/intercept cross-origin API calls that must
  // always be fresh (weather, geocoding) - let those hit the network
  // directly and simply fail gracefully offline (handled in script.js).
  const url = new URL(request.url);
  const isWeatherOrGeoAPI =
    url.hostname.includes("open-meteo.com") ||
    url.hostname.includes("bigdatacloud.net");

  if (isWeatherOrGeoAPI) {
    return; // let the browser handle it normally
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Refresh cache in the background for next time (stale-while-revalidate)
        fetch(request)
          .then((fresh) => {
            if (fresh && fresh.ok) {
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, fresh));
            }
          })
          .catch(() => {/* offline - fine, we already returned the cached copy */ });
        return cached;
      }

      return fetch(request)
        .then((fresh) => {
          if (fresh && fresh.ok && request.method === "GET") {
            const copy = fresh.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return fresh;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});