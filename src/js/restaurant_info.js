let restaurant;
var restMap;
let apikey = 'pk.eyJ1IjoicGVwcGVyYWRkaWN0IiwiYSI6ImNqa3Y4YmtwdTBvazAza3BhZ20zYnE2aXoifQ.QIBC0lqNjFdfDDL4Qq_neA';

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
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
        id: 'mapbox.light',

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
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('rest-name');
  name.innerHTML = restaurant.name;

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
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');


  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.className = 'revName';
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.className = 'revDate';
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.className = 'revRate';
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.className = 'revComment';
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}


/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const serverport = `https://${DBHelper.ADDRESS}/`;
  DBHelper.fetchRestaurants((error, restaurants) => {
    if (error) 
        console.log(error)
    else {
      const names = Object.entries(restaurants).forEach(
        ([key, value]) => {

          const li = document.createElement('li');
          const a = document.createElement('a');
          a.innerHTML = `${value.name}`;
          a.href = serverport + 'restaurant.html?id=' + value.id;
          a.target ="_self";
          li.appendChild(a);
          breadcrumb.appendChild(li);

        });
        var uri = `${serverport}restaurant.html?id=${restaurant.id}`;
        var query = document.querySelectorAll('#navi-links a[href="'+uri+'"]');
        for (let i of query) {
          if (i == uri) {
            i.className = 'currentLink';
          }
          else console.log(uri + '   ' + i)
        }
    }
});



}

mapFallback = () => {
  const mapF = document.getElementById("map")
  mapF.innerHTML = "Sorry, the map application could not be loaded";
  mapF.className = 'mapFallback'
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
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('rest-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('rest-address');
  address.innerHTML = `Address: ${restaurant.address}`;


  const image = document.getElementById('rest-img');
  const webpimg = document.createElement('source');
  const img = document.createElement('img');
  const imgt = document.createElement('source');

  img.alt = `Image of ${restaurant.name} in ${restaurant.neighborhood}`;
  img.src = DBHelper.imageUrlForRestaurant(restaurant);
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
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');


  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.className = 'revName';
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.className = 'revDate';
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.className = 'revRate';
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.className = 'revComment';
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}


/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const serverport = `http://${DBHelper.ADDRESS}/`;
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) 
          console.log(error)
      else {
        const names = Object.entries(restaurants).forEach(
          ([key, value]) => {

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.innerHTML = `${value.name}`;
            a.href = serverport + 'restaurant.html?id=' + value.id;
            a.target ="_self";
            li.appendChild(a);
            breadcrumb.appendChild(li);

          });
          var uri = `${serverport}restaurant.html?id=${restaurant.id}`;
          var query = document.querySelectorAll('#navi-links a[href="'+uri+'"]');
          for (let i of query) {
            if (i == uri) {
              i.className = 'currentLink';
            }
            else console.log(uri + '   ' + i)
          }
      }
  });
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