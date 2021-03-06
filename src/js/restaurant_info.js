let restaurant;
var restMap;
let apikey = 'pk.eyJ1IjoicGVwcGVyYWRkaWN0IiwiYSI6ImNqa3Y4YmtwdTBvazAza3BhZ20zYnE2aXoifQ.QIBC0lqNjFdfDDL4Qq_neA';
const serverport = window.location.origin;
/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  DBclean();
  initMap();
  showFavorites();
  reviewForm();
  dropDownNavi();
});

DBclean = () => {
  // cleaning the database!
  const toDelete = new Array;
  if (navigator.onLine) {
    fetch('http://localhost:1337/reviews/')
      .then((response) => {
        return response.json();
      })
      .then((data) => {

        data.forEach((empties) => {
          //let's first delete the empty names
          if (empties.name === undefined || empties.name === '') {
            fetch('http://localhost:1337/reviews/' + empties.id, {
              method: 'delete',
            })
          }

        })
        //let's do the same for IDB 
        dbPromise.then((db) => {
            const tx = db.transaction('reviews', 'readwrite')
            const keyValStore = tx.objectStore('reviews')
            return keyValStore.getAll();
          })
          .then((all) => {
            all.forEach((each) => {
              if (each.name === undefined || each.name === '') {
                dbPromise.then((db) => {
                  const tx = db.transaction('reviews', 'readwrite')
                  const keyValStore = tx.objectStore('reviews')
                  return keyValStore.delete(each.id)
                })

              }

            })
          })
      })
  }


}

dropDownNavi = (e) => {
  const toggle = document.getElementById('toggle')
  const drop = document.getElementById('navi-links')
  const arrow = document.getElementById('arrow')

  // if toggle is clicked: close
  toggle.addEventListener('click', () => {
    if (drop.classList.contains('hide')) {
      arrow.classList.remove('focus')
      drop.classList.remove('hide')
    } else {
      arrow.classList.add('focus')
      drop.classList.add('hide')
    }

  })
  // if the entire navigator is clicked: close
  drop.addEventListener('click', () => {
    if (drop.classList.contains('hide')) {
      arrow.classList.remove('focus')
      drop.classList.remove('hide')
    } else {
      arrow.classList.add('focus')
      drop.classList.add('hide')
    }
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
  fetch('http://localhost:1337/restaurants/?is_favorite=true')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    data.forEach((favs) => {
      if (favs.id === restaurant.id) {
        fav.checked = true;
      }
    })
  })

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
  let online;
  let offline;
  fetch('http://localhost:1337/restaurants/?is_favorite=true')
    .then((response) => response.json())
    .then((data) => online = data)

  dbPromise.then((db) => {
      const tx = db.transaction('favorites');
      const keyValStore = tx.objectStore('favorites')
      return keyValStore.getAll();
    })
    .then((stuff) => {
      offline = stuff;
    })

  setTimeout(() => {
    if (online.length > offline.length) {
      online.forEach((indi) => {
        dbPromise.then((db) => {
          const tx = db.transaction('favorites', 'readwrite');
          const keyValStore = tx.objectStore('favorites')
          return keyValStore.put(indi)
        })
      })
    }
    else {
      createFavorites(offline)
    }
  }, 400)
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
  let online = new Array;
  let offline = new Array;

  //online or offline
  if (navigator.onLine) {
    fetch('http://localhost:1337/reviews/')
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        reviews = data;
        reviews.forEach((review) => {
          if (review.restaurant_id === self.restaurant.id) {
            online.push(review)
            //send it to IDB
            if (IDBObjectStore) {
              dbPromise.then((db) => {
                const tx = db.transaction('reviews', 'readwrite');
                const keyValStore = tx.objectStore('reviews');
                return keyValStore.put(review)
              })
            }
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


  if (navigator.onLine) {
    setTimeout(() => {
      if (online.length > offline.length) {
        console.log('retrieved reviews from the server')
        //sync server with IDB
        let result = online.filter(o1 => !offline.some(o2 => o1.id === o2.id));
        if (result.length > 0) {
          result.forEach((ok) => {
            dbPromise.then((db) => {
              const tx = db.transaction('reviews', 'readwrite')
              const keyValStore = tx.objectStore('reviews')
              return keyValStore.put(ok)
            })
          })
        }
        online.forEach((all) => {
          createReviewHTML(all)
        })
      } else if (offline.length >= online.length) {
        console.log('retrieved reviews from IDB')

        //sync IDB with Server
        let result = offline.filter(o1 => !online.some(o2 => o1.id === o2.id));
        if (result.length > 0) {
          result.forEach((ok) => {
            //add the difference to server
            fetch('http://localhost:1337/reviews/', {
              method: "POST",
              headers: {
                "Content-Type": "application/json; charset=utf-8"
              },
              body: JSON.stringify(ok)
            })
            online.push(ok)
          })
        }
        offline.forEach((all) => {
          createReviewHTML(all)
        })

      }
    }, 500)
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


  const rating = document.createElement('div');
  rating.value = review.rating;
  const ratingstars1 = document.createElement('img')
  ratingstars1.src = '/build/images/star.svg'
  ratingstars1.className = 'stars 1'
  let ratingstars2 = ratingstars1.cloneNode(true)
  ratingstars2.className = 'stars 2'
  let ratingstars3 = ratingstars1.cloneNode(true)
  ratingstars3.className = 'stars 3'
  let ratingstars4 = ratingstars1.cloneNode(true)
  ratingstars4.className = 'stars 4'
  let ratingstars5 = ratingstars1.cloneNode(true)
  ratingstars5.className = 'stars 5'

  starsManip('onload', ratingstars1, ratingstars2, ratingstars3, ratingstars4, ratingstars5, rating, 'mini')

  rating.append(ratingstars1)
  rating.append(ratingstars2)
  rating.append(ratingstars3)
  rating.append(ratingstars4)
  rating.append(ratingstars5)
  rating.className = 'revRate';


  li.appendChild(rating);


  const editReview = document.createElement('button')
  editReview.className = 'edit'
  const image = document.createElement('img')
  image.src = '../build/images/logo.svg'
  image.alt = 'edit or remove review'
  editReview.append(image)

  editReview.addEventListener('click', () => {
    const deletes = document.getElementById('delete-review')
    deletes.addEventListener('click', () => {
      if (navigator.onLine) {
        deleteData('http://localhost:1337/reviews/' + review.id, review.id)
          .then((response) => {
            // delete from IDB
            dbPromise.then((db) => {
                const tx = db.transaction('reviews', 'readwrite')
                const keyValStore = tx.objectStore('reviews')
                return keyValStore.getAll();
              })
              .then((all) => {
                all.forEach((check) => {
                  if (check.id === review.id) {
                    dbPromise.then((db) => {
                        const tx = db.transaction('reviews', 'readwrite')
                        const keyValStore = tx.objectStore('reviews')
                        return keyValStore.delete(check.id)
                      })
                      .then(() => {
                        console.log('removed from IDB')
                        window.location.reload();
                      })
                  } else {
                    window.location.reload();
                  }
                })

              })
          })
      } else {
        alert('You have to be online to delete your review!')
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
    const estars1 = document.createElement('input')
    estars1.type = 'checkbox'
    estars1.className = 'stars 1';

    let estars2 = estars1.cloneNode(true)
    estars2.className = 'stars 2'
    let estars3 = estars1.cloneNode(true)
    estars3.className = 'stars 3'
    let estars4 = estars1.cloneNode(true)
    estars4.className = 'stars 4'
    let estars5 = estars1.cloneNode(true)
    estars5.className = 'stars 5'
    erating.value = review.rating;

    starsManip('click', estars1, estars2, estars3, estars4, estars5, erating, 'run');
    starsManip('onload', estars1, estars2, estars3, estars4, estars5, erating, 'show');

    erating.append(estars1)
    erating.append(estars2)
    erating.append(estars3)
    erating.append(estars4)
    erating.append(estars5)

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
        console.log(review.id)
        const url = 'http://localhost:1337/reviews/'
        if (review.id) {
          deleteData(url + review.id, review.id)
            .then((response) => {
              dbPromise.then((db) => {
                const tx = db.transaction('reviews', 'readwrite')
                const keyValStore = tx.objectStore('reviews')
                return keyValStore.delete(response.id)
              })
            })
            .then(() => {
              //create new review in its place
              setTimeout(() => {
                fetch(url, {
                    method: 'POST',
                    headers: {
                      "Content-Type": "application/json; charset=utf-8"
                    },
                    body: JSON.stringify(formSubmit)
                  })
                  .then(() => {
                    dbPromise.then((db) => {
                      const tx = db.transaction('reviews', 'readwrite')
                      const keyValStore = tx.objectStore('reviews')
                      return keyValStore.put(formSubmit)
                    })
                  })
                  .then(() => {
                    //okay now refresh once everything is finished 
                    window.location.reload();
                  })
              }, 1000)
            })
            .catch((error) => {
              console.log('uh oh ' + error)
            })
        }

      } else {
        alert('You have to be online to edit your review!')
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


starsManip = (x, one, two, three, four, five, rating, run) => {
  // OMG IS THERE A BETTER WAY???
  oney = () => {
    one.checked = true;
    two.checked = false;
    three.checked = false;
    four.checked = false;
    five.checked = false;
  }
  twoy = () => {
    one.checked = true;
    two.checked = true;
    three.checked = false;
    four.checked = false;
    five.checked = false;
  }
  threey = () => {
    one.checked = true;
    two.checked = true;
    three.checked = true;
    four.checked = false;
    five.checked = false;
  }
  foury = () => {
    one.checked = true;
    two.checked = true;
    three.checked = true;
    four.checked = true;
    five.checked = false;
  }
  fivey = () => {
    one.checked = true;
    two.checked = true;
    three.checked = true;
    four.checked = true;
    five.checked = true;
  }

  if (run === 'run') {
    one.addEventListener(x, () => {
      one.checked = true;
      two.checked = false;
      three.checked = false;
      four.checked = false;
      five.checked = false;
      rating.value = 1;
    })
    two.addEventListener(x, () => {
      one.checked = true;
      two.checked = true;
      three.checked = false;
      four.checked = false;
      five.checked = false;
      rating.value = 2;
    })
    three.addEventListener(x, () => {
      one.checked = true;
      two.checked = true;
      three.checked = true;
      four.checked = false;
      five.checked = false;
      rating.value = 3;
    })
    four.addEventListener(x, () => {
      one.checked = true;
      two.checked = true;
      three.checked = true;
      four.checked = true;
      five.checked = false;
      rating.value = 4;
    })
    five.addEventListener(x, () => {
      one.checked = true;
      two.checked = true;
      three.checked = true;
      four.checked = true;
      five.checked = true;
      rating.value = 5;
    })
  } else if (run === 'show') {
    if (rating.value === 1) {
      oney();
      one.className = 'stars active'
    } else if (rating.value === 2) {
      twoy();
      two.className = 'stars active'
    } else if (rating.value === 3) {
      threey();
      three.className = 'stars active'
    } else if (rating.value === 4) {
      foury();
      four.className = 'stars active'
    } else if (rating.value === 5) {
      fivey();
    }
  } else if (run === 'mini') {
    if (rating.value === 1) {
      one.className = 'stars active'
      two.className = 'stars'
      three.className = 'stars'
      four.className = 'stars'
    } else if (rating.value === 2) {
      one.className = 'stars active'
      two.className = 'stars active'
      three.className = 'stars'
      four.className = 'stars'
      five.className = 'stars'
    } else if (rating.value === 3) {
      one.className = 'stars active'
      two.className = 'stars active'
      three.className = 'stars active'
      four.className = 'stars'
      five.className = 'stars'
    } else if (rating.value === 4) {
      one.className = 'stars active'
      two.className = 'stars active'
      three.className = 'stars active'
      four.className = 'stars active'
      five.className = 'stars'
    } else if (rating.value === 5) {
      one.className = 'stars active'
      two.className = 'stars active'
      three.className = 'stars active'
      four.className = 'stars active'
      five.className = 'stars active'
    }
  }
}

reviewForm = () => {

  const submit = document.getElementById('review-submit');
  const name = document.getElementById('name');

  //STARS RATING
  const disrating = document.getElementById('rating')
  const stars1 = document.createElement('input')
  stars1.type = 'checkbox'
  stars1.className = `stars 1`;
  let stars2 = stars1.cloneNode(true)
  stars2.className = 'stars 2'
  let stars3 = stars1.cloneNode(true)
  stars3.className = 'stars 3'
  let stars4 = stars1.cloneNode(true)
  stars4.className = 'stars 4'
  let stars5 = stars1.cloneNode(true)
  stars5.className = 'stars 5'
  starsManip('click', stars1, stars2, stars3, stars4, stars5, disrating, 'run')

  disrating.append(stars1)
  disrating.append(stars2)
  disrating.append(stars3)
  disrating.append(stars4)
  disrating.append(stars5)


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
      setTimeout(() => {


        if (formSubmit.name !== "" || formSubmit.rating !== undefined) {
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
              window.location.reload();
            })
            .catch(error => console.error(error))
        } else {
          alert('Please fill in your name and rating')
        }
      }, 1000)
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