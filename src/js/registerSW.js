

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

    upgradeDB.createObjectStore('favorites', {
        keyPath: 'id'
    })
    upgradeDB.createObjectStore('reviews', {
        keyPath: 'id'
    })
})
uniqueID = () => {
    return Date.now()
}
date = () => {
    let d = new Date();
    let month = d.getMonth()+1;
    let day = d.getDate();

    let hour = d.getHours();
    let minute = d.getMinutes();

    let output =  + 
    (('' + month).length<2 ? '0' : '') + month + '-' +
    (('' + day).length<2 ? '0' : '') + day + '-' + d.getFullYear() + ' | ' + hour + ':' + minute;
    return output
}
handleFavorites = async (restaurant, fav) => {
    const url = 'http://localhost:1337/restaurants/' + restaurant.id + '/?is_favorite=true';
    const urlTwo = 'http://localhost:1337/restaurants/' + restaurant.id + '/?is_favorite=false';
    const config = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurant)
    }
    let favy;
    if (fav.checked) {
        fetch(url, config)
            .then((response => response.json()))
            .then((json) => {
                favy = json;
                dbPromise.then((db) => {
                    const tx = db.transaction('favorites', 'readwrite');
                    const keyValStore = tx.objectStore('favorites');
                    return keyValStore.put(favy)
                })
            })
            
    } else {
        fetch(urlTwo, config)
            .then((response) => response.json())
            .then((json) => {
                favy = json;
                dbPromise.then((db) => {
                    const tx = db.transaction('favorites', 'readwrite');
                    const keyValStore = tx.objectStore('favorites');
                    return keyValStore.delete(favy.id)
                })
            })
    }
}
storeFavorites = () => {
    //store favorites to IDB
    fetch('http://localhost:1337/restaurants/?is_favorite=true')
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            dbPromise.then((db) => {
                data.forEach((items) => {
                    const tx = db.transaction('favorites', 'readwrite');
                    const keyValStore = tx.objectStore('favorites');
                    keyValStore.put(items)
                })
            })
        })
}

storeFavorites();