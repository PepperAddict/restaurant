let CACHE_NAME = 'RRC-v1.1';
let staticCacheName;
let toCache = [
    '/',
    'offline.html',
    'restaurant.html',
    'data',
    'build/css/style.min.css',
    'build/images/',
    'js/dbhelper.js',
    'js/main.js',
    'js/restaurant_info.js'
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
                return response || fetch(fetchRequest);
            })
            .then(response => {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                .then( (cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
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
