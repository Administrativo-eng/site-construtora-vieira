// sw.js — PWA com rotas mapeadas e cache otimizado
const VERSION = "vieira-v1.0.0";
const PRECACHE = `precache-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;

// Mapa de rotas amigáveis -> arquivos HTML reais
const ROUTE_MAP = {
  "/": "/index.html",
  "/contato": "/paginas/contato.html",
  "/empreendimentos": "/paginas/empreendimentos.html",
  "/noticias": "/paginas/noticias.html",
  "/obras": "/paginas/obras.html",
  "/servicos": "/paginas/servicos.html",
  "/simulacao": "/paginas/simulacao.html",
  "/sobrenos": "/paginas/sobrenos.html",
  "/sustentabilidade": "/paginas/sustentabilidade.html",
  "/trabalheconosco": "/paginas/trabalheconosco.html",

  // equivalências/atalhos
  "/construcaoresidencial": "/paginas/construcao-residencial.html",
  "/construcao-residencial": "/paginas/construcao-residencial.html",
  "/estrutura": "/paginas/estruturas-metalicas.html",
  "/estruturas-metalicas": "/paginas/estruturas-metalicas.html",
  "/obrapublica": "/paginas/obras-publicas.html",
  "/obras-publicas": "/paginas/obras-publicas.html",
  "/modernize": "/paginas/reformas.html",
  "/reformas": "/paginas/reformas.html"
};

// Arquivos a pré-cachear
const PRECACHE_URLS = [
  "/index.html",
  "/404.html",

  // páginas internas
  "/paginas/contato.html",
  "/paginas/empreendimentos.html",
  "/paginas/noticias.html",
  "/paginas/obras.html",
  "/paginas/servicos.html",
  "/paginas/simulacao.html",
  "/paginas/sobrenos.html",
  "/paginas/sustentabilidade.html",
  "/paginas/trabalheconosco.html",
  "/paginas/construcao-residencial.html",
  "/paginas/construcao-comercial.html",
  "/paginas/estruturas-metalicas.html",
  "/paginas/obras-publicas.html",
  "/paginas/reformas.html",

  // assets essenciais (somente os existentes)
  "/includes/style.css",
  "/includes/script.js",
  "/icones/favicon.ico",
  "/icones/icon-192.webp",
  "/icones/icon-512.webp",
  "/img_site/logocerta.png",
  "/img_site/previsual.png"
];

// —— INSTALL: precache
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

// —— ACTIVATE: limpar versões antigas e habilitar navigation preload
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => ![PRECACHE, RUNTIME].includes(k)).map(k => caches.delete(k)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

// —— FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ignorar SW e analytics
  if (url.pathname === "/sw.js" ||
      url.hostname.endsWith("googletagmanager.com") ||
      url.hostname.endsWith("google-analytics.com")) {
    return;
  }

  // NAVEGAÇÕES (document): network-first -> rota mapeada -> index -> 404
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;

        const fresh = await fetch(req);
        const runtime = await caches.open(RUNTIME);
        runtime.put(req, fresh.clone());
        return fresh;
      } catch {
        const path = url.pathname.replace(/\/+$/,"") || "/";
        const mapped = ROUTE_MAP[path] || ROUTE_MAP["/"];
        const cachedMapped = await caches.match(mapped);
        if (cachedMapped) return cachedMapped;

        return (await caches.match("/index.html")) ||
               (await caches.match("/404.html")) ||
               new Response("Você está offline.", { headers: { "Content-Type": "text/plain; charset=UTF-8" }});
      }
    })());
    return;
  }

  // ASSETS (script/style/image/font): Stale-While-Revalidate
  if (["script","style","image","font"].includes(req.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME);
      const cached = await cache.match(req);
      const networkPromise = fetch(req).then((res) => {
        cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      return cached || networkPromise || new Response("", { status: 504 });
    })());
    return;
  }

  // Demais requests: network com fallback ao cache
  event.respondWith((async () => {
    try {
      return await fetch(req);
    } catch {
      const cached = await caches.match(req);
      return cached || new Response("", { status: 504 });
    }
  })());
});
