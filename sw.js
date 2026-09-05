/* ==========================================================================
   TASKLY SERVICE WORKER (OFFLINE PWA ENGINE)
   Stale-While-Revalidate caching for resilient offline performance
   ========================================================================== */

const CACHE_NAME = "taskly-v1.2";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icon.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    // Only handle GET requests
    if (event.request.method !== "GET") return;

    // Ignore non-http/https requests (e.g. chrome-extension://)
    if (!event.request.url.startsWith("http")) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // If offline and request fails, return cached response if available
                return cachedResponse;
            });

            return cachedResponse || fetchPromise;
        })
    );
});
