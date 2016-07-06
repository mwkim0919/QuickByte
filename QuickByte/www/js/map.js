var mainMap = null;
var markers = [];
var directionsService;
var directionsDisplay;

function initMap(mapContainerId) {
  var map = null;
  var mapDiv = document.getElementById(mapContainerId);

  if (mapDiv != null)
  {
    var latLng = getLatLng();

    map = new google.maps.Map(mapDiv, {
    center: {lat:latLng.lat, lng: latLng.lon},
    zoom: 14
    });

  }




  if (mapContainerId == "map"){
    mainMap = map;

    var marker = new google.maps.Marker({
      position: {lat:lat, lng: lon},
      map: map
    });
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red.png');
  }
  else {
    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService;
    // Create a renderer for directions and bind it to the map.
    directionsDisplay = new google.maps.DirectionsRenderer({map: map});

    originLat = lat;
    originLon = lon;

  }

  return map;
}

//google.maps.event.addDomListener(window, 'load', initMap);

function refreshMap() {
  if (mainMap != null){
    removeMarkers();
    addMarkers(mainMap);
  }
}

function addMarkers(map){
  var restaurantList;
  var i = 0;

  restaurantList = getRestaurants();
  while (restaurantList[i] != null)
  {
    console.log(restaurantList[i]);
    addMarker(map,
              restaurantList[i].location.coordinate.latitude,
              restaurantList[i].location.coordinate.longitude,
              restaurantList[i].id);
    i++;
  }
}


function addMarker(map, lat, lon, restaurantId){
  var marker = new google.maps.Marker({
    position: {lat:lat, lng: lon},
    map: map,
    animation: google.maps.Animation.DROP,
    id: restaurantId,
    clickable: true
  });

  marker.info = new google.maps.InfoWindow({
    content: restaurantId
  });

  google.maps.event.addListener(marker, 'click', function() {
  //marker.info.open(map, marker);
  console.log(marker.id);
  window.location.href = '#/tab/restaurants/' + marker.id;
  });

  marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue.png');
  marker.setMap(map);
  markers.push(marker);

}


function removeMarkers(){

  for (var i=0; i < markers.length ; i++){
    markers[i].setMap(null);
  }

  markers = [];

}



function calculateAndDisplayRoute(map, dLat, dLon) {

  var selectedMode = document.getElementById('mode').value;
  var latLng = getLatLng();

  document.getElementById('mode').addEventListener('change', function() {
      calculateAndDisplayRoute(map, dLat, dLon);
    });

    // Retrieve the start and end locations and create a DirectionsRequest using
    // WALKING directions.
    directionsService.route({
                            origin: {lat:latLng.lat, lng: latLng.lon},
                            //origin: {lat: originLat, lng: originLon},
                            destination: {lat: dLat, lng: dLon},
                            travelMode: google.maps.TravelMode[selectedMode]
                            }, function(response, status) {


                            // Route the directions and pass the response to a function to create
                            // markers for each step.
                            if (status === google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(response);
                            } else {
                            window.alert('Directions request failed due to ' + status);
                            }
                            });

}
