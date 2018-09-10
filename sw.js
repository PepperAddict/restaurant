let CACHE_NAME = 'RRC-v1.4'
let staticCacheName
let toCache = [
    'offline.html',
    './restaurant.html',
    './build/css/style.min.css',
    './src/js/dbhelper.js',
    './src/js/index.js',
    './src/js/restaurant_info.js',
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
})

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            let fetchRequest = event.request.clone()
            return (response || fetch(fetchRequest)
                .then(networkResponse => {
                    if (networkResponse.status > 200) {
                        return caches.match('offline.html')
                    }
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
            for (let name of cacheNames)
                caches.delete(name)
        })
    )
})