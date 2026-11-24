const CACHE_NAME = "math-adventure-island-v20261124";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./favicon.svg",
  "./manifest.json",
  "./app.js",
  "./avatars.js",
  "./svg-icons.js",
  "./audio-fx.js",
  "./visual-explainer.js",
  "./mini-games.js",
  "./extras.js",
  "./deluxe-features.js",
  "./super-features.js",
  "./plus-features.js",
  "./data/grade3-math-bank.js",
  "./data/original-challenges.js",
  "./data/math-glossary.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 網路優先，離線時自動讀取快取（確保有網永遠是最新版，沒網也能照常練習 960 題）
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
  );
});
