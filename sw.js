const CACHE_NAME = 'pdf-secure-v1';
const ASSETS = [
    'index.html',
    'app.js',
    'manifest.json',
    'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'
];

// ਕੈਸ਼ ਸੇਵ ਕਰਨਾ (Offline ਵਰਤੋਂ ਲਈ)
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

// ਆਫਲਾਈਨ ਕੰਮ ਕਰਨ ਲਈ ਫੈਚ ਰਿਕਵੈਸਟ
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
