const CACHE_NAME = "filtro-pre-jogo-cache-v3";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./1762641416087.jpg",
  "./1762641459534.jpg"
];

// Instala o service worker e faz o cache inicial
self.addEventListener("install", (event) => {
  console.log("📦 Instalando Service Worker e salvando arquivos no cache...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Ativa o novo cache e remove versões antigas
self.addEventListener("activate", (event) => {
  console.log("✅ Ativando novo Service Worker...");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Removendo cache antigo:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições e serve do cache quando offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
          .then((liveResponse) => {
            // Armazena respostas novas no cache
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, liveResponse.clone());
              return liveResponse;
            });
          })
          .catch(() => caches.match("./index.html"));
      })
  );
});
