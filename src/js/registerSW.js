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
})

handleFavorites = async (restaurant, fav) => {
    const url = 'http://localhost:1337/restaurants/' + restaurant.id +'/?is_favorite=true';
    const urlTwo = 'http://localhost:1337/restaurants/' + restaurant.id +'/?is_favorite=false';
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
    const response = await fetch(url, config)
        .then((response => response.json()))
        .then((json) => {
            console.log(fav.checked)
            favy = json;
            return fav.checked = true
        })
    }
    else {
        const response = await fetch(urlTwo, config)
        .then((response) => response.json())
        .then((json) => {
            console.log(fav.checked)
            favy = json;
            return fav.checked = false
        })
    }
    console.log(favy)

    dbPromise.then((db) => {
        const tx = db.transaction('details', 'readwrite');
        const keyValStore = tx.objectStore('details');
        return keyValStore.put(favy)
    })
}

storeFavorites = () => {
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
          }
      )})
    })
}
storeFavorites();

