const CACHE_NOME = "ofertaflow-v2";
const ARQUIVOS_ESSENCIAIS = [
    "./",
    "./index.html",
    "./style.css",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png",
    "./js/config.js",
    "./js/utilitarios.js",
    "./js/produto.js",
    "./js/fila.js",
    "./js/publicacao.js",
    "./js/painel.js",
    "./js/armazenamento.js",
    "./js/interface.js",
    "./js/principal.js"
];

self.addEventListener("install", (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches.keys().then((nomes) =>
            Promise.all(
                nomes
                    .filter((nome) => nome !== CACHE_NOME)
                    .map((nome) => caches.delete(nome))
            )
        )
    );
    self.clients.claim();
});

// Estratégia: tenta a rede primeiro (pra pegar versões novas), cai pro cache se estiver offline
self.addEventListener("fetch", (evento) => {
    if (evento.request.method !== "GET") {
        return;
    }
    evento.respondWith(
        fetch(evento.request)
            .then((resposta) => {
                const copia = resposta.clone();
                caches.open(CACHE_NOME).then((cache) => cache.put(evento.request, copia));
                return resposta;
            })
            .catch(() => caches.match(evento.request))
    );
});
