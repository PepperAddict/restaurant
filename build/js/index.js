'use strict';

var restaurants = void 0,
    neighborhoods = void 0,
    cuisines = void 0;
var newMap;
var markers = [];
var apikey = 'pk.eyJ1IjoicGVwcGVyYWRkaWN0IiwiYSI6ImNqa3Y4YmtwdTBvazAza3BhZ20zYnE2aXoifQ.QIBC0lqNjFdfDDL4Qq_neA';

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', function (event) {
  initMap();
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = function fetchNeighborhoods() {
  DBHelper.fetchNeighborhoods(function (error, neighborhoods) {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = function fillNeighborhoodsHTML() {
  var neighborhoods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.neighborhoods;

  var select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(function (neighborhood) {
    var option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = function fetchCuisines() {
  DBHelper.fetchCuisines(function (error, cuisines) {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = function fillCuisinesHTML() {
  var cuisines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.cuisines;

  var select = document.getElementById('cuisines-select');

  cuisines.forEach(function (cuisine) {
    var option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = function initMap() {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: apikey,
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.light'

  }).addTo(newMap);

  updateRestaurants();
};
mapFallback = function mapFallback() {
  var mapF = document.getElementById("map");
  mapF.innerHTML = "Sorry, this map application could not be loaded";
  mapF.className = 'mapFallback';
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = function updateRestaurants() {
  var cSelect = document.getElementById('cuisines-select');
  var nSelect = document.getElementById('neighborhoods-select');

  var cIndex = cSelect.selectedIndex;
  var nIndex = nSelect.selectedIndex;

  var cuisine = cSelect[cIndex].value;
  var neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, function (error, restaurants) {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  var ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(function (marker) {
      return marker.remove();
    });
  }
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = function fillRestaurantsHTML() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  var ul = document.getElementById('restaurants-list');
  if (restaurants.length == 0) {
    var li = document.createElement('li');
    li.className = 'noshow';
    li.innerHTML = 'Sorry! There\'s nothing here. Try a different option.';

    ul.append(li);
  }
  restaurants.forEach(function (restaurant) {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = function createRestaurantHTML(restaurant) {

  var li = document.createElement('li');

  var name = document.createElement('h3');
  name.className = 'fp-r-name';
  name.innerHTML = restaurant.name;
  li.append(name);

  var text = document.createElement('a');
  var picture = document.createElement('picture');

  var webpimg = document.createElement('source');
  webpimg.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '.webp';
  webpimg.type = 'image/webp';
  var imgt = document.createElement('source');
  imgt.srcset = DBHelper.imageUrlForRestaurant(restaurant) + '.jpg';
  imgt.type = 'image/jpeg';
  var img = document.createElement('img');

  img.alt = 'Image of ' + restaurant.name + ' in ' + restaurant.neighborhood;

  img.src = DBHelper.imageUrlForRestaurant(restaurant) + '.jpg';

  picture.appendChild(webpimg);
  picture.appendChild(imgt);
  picture.appendChild(img);

  picture.className = 'restaurant-img';

  text.href = DBHelper.urlForRestaurant(restaurant);
  text.appendChild(picture);
  li.append(text);

  var neighborhood = document.createElement('p');
  neighborhood.className = 'fp-neighborhood';
  neighborhood.innerHTML = ' ' + restaurant.neighborhood;
  li.append(neighborhood);

  var address = document.createElement('p');
  address.className = 'fp-address';
  address.innerHTML = 'Address: ' + restaurant.address;
  li.append(address);

  var link = document.createElement('p');
  link.className = 'link';
  var more = document.createElement('a');
  more.innerHTML = restaurant.name + '\'s full details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  link.appendChild(more);
  li.append(link);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = function addMarkersToMap() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  restaurants.forEach(function (restaurant) {
    // Add marker to the map
    var marker = DBHelper.mapMarkerForMain(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
};

//reset filter
fullrestaurants = function fullrestaurants() {
  var all = document.getElementsByTagName('select');
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = all[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var i = _step.value;

      i.selectedIndex = 0;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var cSelect = document.getElementById('cuisines-select');
  var nSelect = document.getElementById('neighborhoods-select');

  var cuisine = cSelect.value;
  var neighborhood = nSelect.value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, function (error, restaurants) {
    if (error) {
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};
//# sourceMappingURL=index.js.map
