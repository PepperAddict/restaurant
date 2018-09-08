let CACHE_NAME = 'RRC-v2';
let staticCacheName;
let toCache = [
    'offline.html',
    'restaurant.html',
    'build/css/style.min.css',
    'build/images/',
    'src/js/dbhelper.js',
    'src/js/main.js',
    'src/js/restaurant_info.js'
]
let errorHandle = [
    'offline.html'
]


self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then( (cache) => {
                return cache.addAll(toCache);
                
            })
            .catch(err => console.log('no worky' + err))
    )
})



self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then( (response) => {
                const fetchRequest = event.request.clone();
                return response || fetch(fetchRequest)
            })
            .then(request => {
                caches.open(CACHE_NAME)
                .then((cache) => {
                    return fetch(request)
                    .then((networkResponse) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    })
                })
            })          
            .catch( error => console.log('also no worky' + error))
        );
})


self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            for (let name of cacheNames) 
            caches.delete(name);
        })
    )
})

// Error Handling
