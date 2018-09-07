
let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []
let apikey = 'pk.eyJ1IjoicGVwcGVyYWRkaWN0IiwiYSI6ImNqa3Y4YmtwdTBvazAza3BhZ20zYnE2aXoifQ.QIBC0lqNjFdfDDL4Qq_neA';

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
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

  }).addTo(newMap);

  updateRestaurants();
}
mapFallback = () => {
  const mapF = document.getElementById("map")
  mapF.innerHTML = "Sorry, this map application could not be loaded";
  mapF.className = 'mapFallback'
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  if (restaurants.length == 0 ) {
    console.log('empty')
    const hi = document.createElement('li');
    hi.innerHTML = 'Sorry! There are no restaurants to display. Try a different option.'

    ul.append(hi)
  }
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {

  const li = document.createElement('li');

  const name = document.createElement('h3');
  name.className = 'fp-r-name';
  name.innerHTML = restaurant.name;
  li.append(name);
  
  const text = document.createElement('a');
  const picture = document.createElement('picture');

  const webpimg = document.createElement('source');  
  webpimg.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '.webp';
  webpimg.type = 'image/webp';
  const imgt = document.createElement('source');
  imgt.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '.jpg';
  imgt.type = 'image/jpeg';
  const img = document.createElement('img');
  


  img.alt = `Image of ${restaurant.name} in ${restaurant.neighborhood}`;

  img.src = DBHelper.imageUrlForRestaurant(restaurant) + '.jpg';

  

  picture.appendChild(webpimg);
  picture.appendChild(imgt)
  picture.appendChild(img)

  picture.className = 'restaurant-img';

  text.href = DBHelper.urlForRestaurant(restaurant);
  text.appendChild(picture);
  li.append(text);

  const neighborhood = document.createElement('p');
  neighborhood.className = 'fp-neighborhood';
  neighborhood.innerHTML = ` ${restaurant.neighborhood}`;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.className = 'fp-address';
  address.innerHTML = `Address: ${restaurant.address}`;
  li.append(address);

  const link = document.createElement('p');
  link.className = 'link';
  const more = document.createElement('a');
  more.innerHTML =  restaurant.name + '\'s full details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  link.appendChild(more);
  li.append(link)



  return li
}


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForMain(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

} 

//reset filter
fullrestaurants = () => {
  const all = document.getElementsByTagName('select');
  for (let i of all) {
    i.selectedIndex = 0; 
  }
    
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cuisine = cSelect.value;
  const neighborhood = nSelect.value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) {
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
  
}