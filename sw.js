let CACHE_NAME = 'RRC-v1.3'
let staticCacheName
let toCache = [
    'offline.html',
    './restaurant.html',
    './build/css/style.min.css',
    './build/images/',
    './src/js/dbhelper.js',
    './src/js/index.js',
    './src/js/restaurant_info.js',
    './src/js/registerSW.js',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(toCache)
        })
        .catch(err => {
            console.log('no worky' + err)
        })
    )
    if (navigator.onLine) {
        self.skipWaiting();
    }
    

})

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            let fetchRequest = event.request.clone()
            return (response || fetch(fetchRequest)
                .then(networkResponse => {
                    let network = networkResponse.clone()
                    let eventCall = event.request

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            return (eventCall.method == 'POST') ? false : cache.put(eventCall, network)
                        })
                    return networkResponse
                })
                .catch(error => {
                    console.log("also no worky" + error)
                })
            )
        })
    )
})


self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            if (cacheNames.length > 0) {
                cacheNames.forEach((name) => {
                    if (name !== CACHE_NAME) {
                        caches.delete(name)
                    }
                })
            }
        })
    )
})
