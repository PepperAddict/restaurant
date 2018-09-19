// registering Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('../../sw.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

//creating IDB
let dbPromise = idb.open('Restaurant-Database', 1, (upgradeDB) => {
    const keyValStore = upgradeDB.createObjectStore('details', {
        keyPath: 'id'
    });
    keyValStore.createIndex('by-name', 'name');
    keyValStore.createIndex('favorited', 'favorited');
})

