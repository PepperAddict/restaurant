window.onload = () => {
    serviceWorkerLoad()
    letsIDBitUp()
}

serviceWorkerLoad = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').then(function (registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function (err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
}

gatherInfo = () => {
    
}

letsIDBitUp = () => {

    let dbPromise = idb.open('Restaurant-Database', 1, (upgradeDB) => {
        const keyValStore = upgradeDB.createObjectStore('details', {
            keyPath: 'id'
        });
        keyValStore.createIndex('by-date', 'time');
    })

    dbPromise.then((db) => {
        let entries;
        const tx = db.transaction('details', 'readwrite');
        const keyValStore = tx.objectStore('details');
        fetch(DBHelper.DATABASE_URL)
            .then((response) => {
                return response.json();
            }).then((data) => {
                entries = data
                entries.forEach((message) => {
                    console.log(message)
                    return keyValStore.put(message)
                })
            })
            .catch((err) => console.log(err))
            
    })

}