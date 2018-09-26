let restaurant;
var restMap;
let apikey = 'pk.eyJ1IjoicGVwcGVyYWRkaWN0IiwiYSI6ImNqa3Y4YmtwdTBvazAza3BhZ20zYnE2aXoifQ.QIBC0lqNjFdfDDL4Qq_neA';
const serverport = window.location.origin;
/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  showFavorites();
  reviewForm();
  dropDownNavi();
});
dropDownNavi = (e) => {
  const toggle = document.getElementById('toggle')
  const drop = document.getElementById('navi-links')
  toggle.addEventListener('click', () => {
    drop.classList.toggle('hide')
  })
  drop.addEventListener('click', () => {
    drop.classList.remove('hide')
  })
}



/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
      mapFallback();
    } else {
      self.restMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 12,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: apikey,
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.dark',

      }).addTo(restMap);

      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.restMap);
    }
  });
}
mapFallback = () => {
  const mapF = document.getElementById("map")
  mapF.innerHTML = "Sorry, this map application could not be loaded";
  mapF.className = 'mapFallback'
}


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  document.title = restaurant.name + '\'s information';
  const name = document.getElementById('rest-name');
  name.innerHTML = restaurant.name;

  const div = document.getElementById('rest-head');
  div.className = 'rest-head';
  const fav = document.createElement('INPUT');
  fav.type = 'checkbox'
  fav.className = 'favorite'
  fav.addEventListener('click', () => {
    handleFavorites(restaurant, fav);
  })
  if (restaurant.is_favorite == 'true') {
    fav.checked = true
  } else {
    fav.checked = false;
  }
  div.append(fav)

  const address = document.getElementById('rest-address');
  address.innerHTML = `Address: ${restaurant.address}`;

  const image = document.getElementById('rest-img');
  const webpimg = document.createElement('source');
  const img = document.createElement('img');
  const imgt = document.createElement('source');
  webpimg.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '.webp';
  webpimg.type = 'image/webp';
  imgt.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '.jpg';
  imgt.type = 'image/jpeg'

  img.alt = `Image of ${restaurant.name} in ${restaurant.neighborhood}`;
  img.src = DBHelper.imageUrlForRestaurant(restaurant) + '.jpg';
  image.appendChild(webpimg);
  image.appendChild(imgt)
  image.appendChild(img)



  const cuisine = document.getElementById('rest-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('rest-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}


/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');

  DBHelper.fetchRestaurants((error, restaurants) => {
    if (error)
      console.log(error)
    else {
      const names = Object.entries(restaurants).forEach(
        ([key, value]) => {

          const li = document.createElement('li');
          const a = document.createElement('a');
          a.innerHTML = `${value.name}`;
          a.href = serverport + '/restaurant.html?id=' + value.id;
          a.target = "_self";
          li.appendChild(a);
          breadcrumb.appendChild(li);
        });
      var uri = `${serverport}/restaurant.html?id=${restaurant.id}`;
      console.log(serverport)
      var query = document.querySelectorAll('#navi-links a[href="' + uri + '"]');
      for (let i of query) {
        if (i == uri) {
          i.className = 'currentLink';
        } else console.log(uri + '   ' + i)
      }
    }
  });
}

createFavorites = (data) => {

  const yul = document.getElementById('navi-links')
  const label = document.createElement('h3')
  label.innerHTML = 'Your favorited restaurants'
  yul.append(label)

  const ul = document.createElement('ul')

  ul.id = 'breadcrumb'
  data.forEach((individual) => {

    const li = document.createElement('li')
    const a = document.createElement('a')
    a.href = serverport + '/restaurant.html?id=' + individual.id
    a.innerHTML = individual.name
    li.append(a)
    ul.append(li)
  })
  yul.append(ul)


  var uri = `${serverport}/restaurant.html?id=${data.id}`;
  var query = document.querySelectorAll('#navi-links a[href="' + uri + '"]');
  for (let i of query) {
    if (i == uri) {
      i.className = 'currentLink';
    } else console.log(uri + '   ' + i)
  }
}

showFavorites = () => {

  if (navigator.onLine) {
    fetch('http://localhost:1337/restaurants/?is_favorite=true')
      .then((response) => {
        return response.json()
      })
      .then((datas) => {
        createFavorites(datas);
      })
  } else {
    dbPromise.then((db) => {
        const tx = db.transaction('favorites');
        const keyValStore = tx.objectStore('favorites')
        return keyValStore.getAll();
      })
      .then((stuff) => {
        createFavorites(stuff)
      })
  }
}


/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {

  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);

  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)

    });
  }
}
/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (restaurant = self.restaurant) => {
  let reviews;

  //online or offline
  if (navigator.onLine) {
    fetch('http://localhost:1337/reviews/?restaurant_id=' + restaurant.id)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        reviews = data;
        let online = new Array;
        let offline = new Array;
        reviews.forEach((review) => {
          online.push(review)
          //send it to IDB
          if (IDBObjectStore) {
            dbPromise.then((db) => {
              const tx = db.transaction('reviews', 'readwrite');
              const keyValStore = tx.objectStore('reviews');
              return keyValStore.put(review)
            })
          }
        })

        if (IDBObjectStore) {
          dbPromise.then((db) => {
              const tx = db.transaction('reviews', 'readwrite')
              const keyValStore = tx.objectStore('reviews')
              return keyValStore.getAll();
            })
            .then((all) => {
              //now to figure out which one to show
              all.forEach((alloffline) => {
                if (alloffline.restaurant_id === restaurant.id) {
                  offline.push(alloffline)
                }
              })
              if (online >= offline) {
                console.log('retrieved reviews from the server')
                let result = online.filter(o1 => !offline.some(o2 => o1.id === o2.id));
                result.forEach((ok) => {
                  dbPromise.then((db) => {
                    const tx = db.transaction('reviews', 'readwrite')
                    const keyValStore = tx.objectStore('reviews')
                    return keyValStore.put(ok)
                  })
                })
                online.forEach((all) => {
                  createReviewHTML(all)
                })
              } else if (offline > online) {
                console.log('retrieved reviews from IDB')
                //sync IDB with Server
                let result = offline.filter(o1 => !online.some(o2 => o1.id === o2.id));
                result.forEach((ok) => {
                  fetch('http://localhost:1337/reviews/?restaurant_id=' + self.restaurant.id, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json; charset=utf-8"
                    },
                    body: JSON.stringify(ok)
                  })
                  
                })
                offline.forEach((all) => {
                  createReviewHTML(all)
                })
              }
            })
            
        } else {
          online.forEach((all) => {
            createReviewHTML(all)
          })
        }

      })
  } else {
    dbPromise.then((db) => {
        console.log('fetched reviews from idb')
        const tx = db.transaction('reviews', 'readwrite');
        const keyValStore = tx.objectStore('reviews');
        return keyValStore.getAll()
      })
      .then((datas) => {
        datas.forEach((data) => {
          if (data.restaurant_id === restaurant.id) {
            offline.push(data)
            createReviewHTML(data)
          }
        })
      })
  }

}

deleteData = (url = '', data = {}) => {
  return fetch(url, {
      method: "delete"
    })
    .then((response) => response.json())
}
postData = (url = '', data = {}) => {
  return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(data),
    })
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      dbPromise.then((db) => {
        const tx = db.transaction('reviews', 'readwrite')
        const keyValStore = tx.objectStore('reviews')
        return keyValStore.put(data)
      })
      console.log(data)
    })
}

individualReview = (review, li) => {
  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');
  li = document.createElement('li');
  const name = document.createElement('p');
  name.className = 'revName';
  name.innerHTML = review.name;
  li.appendChild(name);

  const rating = document.createElement('p');
  rating.className = 'revRate';
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);


  const editReview = document.createElement('button')
  editReview.className = 'edit'

  editReview.innerHTML = '✎'


  editReview.addEventListener('click', () => {
    const deletes = document.getElementById('delete-review')
    deletes.addEventListener('click', () => {
      if (navigator.onLine) {
        deleteData('http://localhost:1337/reviews/' + review.id, review.id)
          .then((response) => {
            dbPromise.then((db) => {
                const tx = db.transaction('reviews', 'readwrite')
                const keyValStore = tx.objectStore('reviews')
                return keyValStore.delete(response.id)
              })
              .then(() => {
                location.reload();
              })
          })
      } else {
        console.log('you are offline. You cannot delete')
      }
    })
    const edit = document.getElementById('edit')
    edit.classList.toggle('hide')
    const close = document.getElementById('close')
    close.addEventListener('click', () => {
      edit.classList.remove('hide')
    })
    edit.append(close)

    const ename = document.getElementById('ename');
    ename.value = review.name;
    const erating = document.getElementById('erating');
    erating.value = review.rating;
    const ereview = document.getElementById('eyour-review');
    ereview.value = review.comments
    const esub = document.getElementById('edit-submit')
    esub.type = 'submit'
    esub.addEventListener('click', () => {
      const restaurant = self.restaurant
      const formSubmit = {
        "id": review.id,
        "restaurant_id": restaurant.id,
        "name": ename.value,
        "createdAt": review.createdAt,
        "updatedAt": date(),
        "rating": erating.value,
        "comments": ereview.value
      }
      if (navigator.onLine) {
        //delete first
        deleteData('http://localhost:1337/reviews/' + review.id, review.id)
          .then((response) => {
            dbPromise.then((db) => {
              const tx = db.transaction('reviews', 'readwrite')
              const keyValStore = tx.objectStore('reviews')
              return keyValStore.delete(response.id)
            })
          })
        //create new review in its place
        postData('http://localhost:1337/reviews/', formSubmit)
          .then((data) => console.log(
            JSON.stringify(data)))
          .then((e) => {
            location.reload();
          })
          .catch(error => console.error(error))
      } else {
        console.log('you are offline')
      }

    })

  })
  li.appendChild(editReview)
  const comments = document.createElement('p');
  comments.className = 'revComment';
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  ul.appendChild(li)
  container.appendChild(ul)

}
/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const container = document.getElementById('reviews-container');
  if (!review) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  let li;
  individualReview(review, li);
  return container;
}

reviewForm = () => {

  const submit = document.getElementById('review-submit');
  const name = document.getElementById('name');
  const rating = document.getElementById('rating')
  const review = document.getElementById('your-review')
  submit.type = 'submit'

  submit.addEventListener('click', () => {
    const restaurant = self.restaurant
    const formSubmit = {
      "id": uniqueID(),
      "restaurant_id": restaurant.id,
      "name": name.value,
      "createdAt": date(),
      "updatedAt": date(),
      "rating": rating.value,
      "comments": review.value
    }

    if (navigator.onLine) {
      //sending it to server
      postData('http://localhost:1337/reviews/', formSubmit)
        .then((data) => console.log(
          JSON.stringify(data)))
        .then((data) => {
          //make sure you send it to IDB too
          dbPromise.then((db) => {
            const tx = db.transaction('reviews', 'readwrite')
            const keyValStore = tx.objectStore('reviews')
            keyValStore.put(formSubmit)
          })
          individualReview(formSubmit)
        })

        .catch(error => console.error(error))
    } else {
      //only sending it to IDB
      console.log('Submitted Review to IDB')
      dbPromise.then((db) => {
        const tx = db.transaction('reviews', 'readwrite')
        const keyValStore = tx.objectStore('reviews')
        keyValStore.put(formSubmit)
        individualReview(formSubmit)
      })
    }
  })

}


/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
