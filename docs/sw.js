/* Offline reading.

   Strategy is deliberately split:
     - HTML pages  -> network first, fall back to cache. A page you have read
                      before stays readable with no signal, but when there IS
                      signal you always get the current version. This is the
                      important half: cache-first on HTML is how a site starts
                      serving stale pages that users cannot clear.
     - static assets (css/js/fonts/images) -> cache first. They are versioned or
                      stable, so serving them from cache is safe and fast.

   CACHE_VERSION must change whenever the shipped assets change; activate()
   deletes every cache that does not match, which is the update path. */

var CACHE_VERSION = "reading-v1";
var OFFLINE_URL = "offline/";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll([OFFLINE_URL]).catch(function () {
        /* offline.html is a nicety; never block install on it */
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_VERSION; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isStatic(url) {
  return /\.(css|js|woff2?|ttf|otf|png|jpe?g|svg|gif|webp|ico)$/i.test(url.pathname);
}

self.addEventListener("fetch", function (event) {
  var req = event.request;

  // Only handle same-origin GETs. Anything else (analytics, POSTs) passes through.
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  if (isStatic(url)) {
    event.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
          }
          return res;
        });
      })
    );
    return;
  }

  // Navigations and everything else: network first, cache as backup.
  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        if (req.mode === "navigate") {
          return caches.match(OFFLINE_URL).then(function (off) {
            return off || new Response(
              "<h1>Offline</h1><p>This page has not been visited before, so there is no cached copy.</p>",
              { headers: { "Content-Type": "text/html" } }
            );
          });
        }
        return new Response("", { status: 504, statusText: "Offline" });
      });
    })
  );
});
