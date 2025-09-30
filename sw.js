// sw.js — cache-first avec retombée offline
const CACHE_NAME = "mieuxjour-v3"; // bump pour forcer la mise à jour;
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  // ajoute ici des images/icônes si tu veux: "./icons/icon-192.png", "./icons/icon-512.png"
];

// installation: pré-cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// activation: nettoyage anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// fetch: cache d'abord, sinon réseau, sinon offline
self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // ne cache que les GET “basiques”
          if (req.method === "GET" && res && res.status === 200 && res.type === "basic") {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => {
          // fallback très simple: renvoyer index.html si on demande une page
          if (req.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});


