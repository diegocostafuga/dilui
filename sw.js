// ============================================
// DILUÍ – Service Worker
//
// Estratégia:
// - Shell estático (HTML/CSS/JS/manifest/ícones) → cache-first.
// - Tudo o mais (incluindo URLs com ?m=...) → network-first com
//   fallback para cache quando offline.
// - Bump CACHE_NAME a cada release pra invalidar caches antigos.
// ============================================

const CACHE_NAME = 'dilui-v3';

const SHELL_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './storage.js',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png'
];

// Pré-cacheia o shell na instalação.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(SHELL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Limpa caches antigos quando uma nova versão ativa.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== location.origin) return; // não interceptamos cross-origin (Google Fonts)

    const isShell = SHELL_ASSETS.some(asset => {
        const assetPath = new URL(asset, location.href).pathname;
        return url.pathname === assetPath;
    });

    if (isShell) {
        // Cache-first
        event.respondWith(
            caches.match(req).then(hit => hit || fetch(req).then(resp => {
                const copy = resp.clone();
                caches.open(CACHE_NAME).then(c => c.put(req, copy));
                return resp;
            }))
        );
    } else {
        // Network-first com fallback de cache
        event.respondWith(
            fetch(req)
                .then(resp => {
                    const copy = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(req, copy));
                    return resp;
                })
                .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
        );
    }
});
