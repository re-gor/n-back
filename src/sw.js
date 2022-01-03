
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './images/icons/icon-192.png',
    './images/icons/favicon.ico',

    './utils/constants.js',
    './utils/loadHtml.js',
    './utils/serviceWorker.js',
    './utils/mustache.min.mjs',
    './utils/storage.js',
    
    './elements/n-game/styles.css',
    './elements/n-game/index.js',
    './elements/n-game/score.html',
    './elements/n-game/template.html',
    './elements/n-statistics/styles.css',
    './elements/n-statistics/index.js',
    './elements/n-statistics/template.html',
    './elements/n-statistics/tableRow.html',
    './elements/n-screen-switcher/styles.css',
    './elements/n-screen-switcher/button.html',
    './elements/n-screen-switcher/index.js',
    './elements/n-screen-switcher/template.html',
    './elements/n-settings/styles.css',
    './elements/n-settings/index.js',
    './elements/n-settings/template.html',
    './elements/n-menu/styles.css',
    './elements/n-menu/index.js',
    './elements/n-menu/template.html',
    './elements/n-game-settings/index.js',
    './elements/n-game-settings/template.html',
    './elements/n-game-settings/styles.css',
];

const IGNORE_ASSETS = [
    '/sw.js'
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open('v1')
            .then(addAssetsInChunks)
    );
});

self.addEventListener("message", async (event) => {
    const {
        action
    } = event.data;

    if (action === 'reloadAssets') {
        const cache = await caches.open('v1');
        const keys = await cache.keys();
        console.log({keys});

        await Promise.all(keys.map(k => cache.delete(k)));
        await addAssetsInChunks(cache);
    }
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches
        .match(event.request)
        .then(response => {
            if (response) {
                return response;
            } 

            const path = new URL(event.request.url).pathname;
            if (IGNORE_ASSETS.find(a => path.includes(a))) {
                return fetch(event.request);
            }

            return fetchWithCache(event.request);
        })
    );
});

const fetchWithCache = async (request) => {
    const response = await fetch(request);

    const cache = await caches.open('v1')
    cache.put(request, response.clone());

    return response;
}

const addAssetsInChunks = async (cache) => {
    // GitHub tends to randomly cancel massive loadings
    // Will load assets by chunks
    let acc = [];

    for (let idx = 0; idx < ASSETS.length; ++idx) {
        acc.push(ASSETS[idx]);

        if (acc.length === 5 || idx === ASSETS.length - 1) {
            await cache.addAll(acc);
            acc = [];
        }
    }
}
