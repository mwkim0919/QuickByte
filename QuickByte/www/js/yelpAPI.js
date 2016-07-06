/* Initializing variables for latitude, longitude, json data,
* geoOptions for requesting current location.
*/
var lat;
var lon;
var data;
var geoOptions = {
  maximumAge: 0,
  timeout: 5000,
  // enableHighAccuracy: false,
};

var DEFAULT_SORT = "distance";
var DEFAULT_DISTANCE = 200;
var DEFAULT_FILTER = 'none';
var distance;
var rSort;
var filter;
var african = 'african,ethiopian';
var asian = 'asianfusion,bangladeshi,burmese,cambodian,chinese,filipino,' +
              'himalayan,indonesian,japanese,korean,' +
              'laotian,malaysian,mongolian,singaporean,sushi,' +
              'taiwanese,thai,uzbek,vietnamese';
var european = 'austrian,basque,belgian,' +
                'british,czech,' +
                'french,german,' +
                'greek,hungarian,iberian,irish,italian,' +
                'mediterranean,modern_european,moroccan,pizza,polish,' +
                'portuguese,russian,scandinavian,scottish,' +
                'slovakian,spanish,' +
                'tapas,tapasmallplates,' +
                'ukrainian';
var mideast = 'afghani,arabian,mideastern,pakistani,persian,syrian,turkish';
var namerican = 'newamerican,tradamerican,armenian,cuban,fishnchips,' +
                  'hawaiian,hotdog,mexican,poutineries,sandwiches,' +
                  'southern,steak,tex-mex';
var oceanian = 'australian';
var samerican = 'argentine,brazilian,caribbean,latin,peruvian';

var restaurants = [];

function getRestaurants(){
  return restaurants;
}

function getLatLng(){

  var latLng = {lat:lat, lon:lon};
  return latLng;
}

function getLocation() {
  $loader.show();
  $scroll.scrollTop();
  var d = $('#distance').find(":selected").val();
  distance = d ? d : DEFAULT_DISTANCE;
  rSort =  $('input[name="sort-radio"]:checked').attr("sort-property");
  rSort = rSort ? rSort : DEFAULT_SORT;
  var f = $('#cuisine').find(":selected").val();
  filter = f ? f : DEFAULT_FILTER;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getQB, noQB, geoOptions);
  } else {
    alert("Geolocation is not supported");
  }
}

function noQB(error) {
  console.log("Error: " + error.message + " " + error.code);
  if (error.code == 1) {
    alert("Turn on your location service on your device.");
  } else if (error.code == 2) {
    alert("Unable to locate your position.");
  } else if (error.code == 3) {
    alert("Request timed out.\nMake sure that your device's GPS service is on.");
  } else {
    displayRestaurantsError("No restaurants were found in your area");
  }
  $loader.hide();
}


function getQB(position) {
  // Setting lat & lon of current location
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  // alert("Lat: " + lat + "  lon: " + lon);

  // Keys for Yelp API
  var auth = {
    consumerKey : "0gDWrhZ68wqypvSM4fyVOg",
    consumerSecret : "2YT4NES1q4Bgx1xjdbUNXNq3XJk",
    accessToken : "i6ykvohXFOzBoFfd6SgH7urwiZ-Uh7Xw",
    // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
    // You wouldn't actually want to expose your access token secret like this in a real application.
    accessTokenSecret : "kiodWPNfmTbkZlgPMaScaVQ-O5M",
    serviceProvider : {
      signatureMethod : "HMAC-SHA1"
    }
  };

  // Yelp Search Variables
  var terms = 'food';
  var ll = lat + "," + lon;

  // Yelp api only shows first 20 results only if offset has not been set.
  // If you want to look at the results after 20 results then set the offset to 20.
  // var offset = '0';

  var accessor = {
    consumerSecret : auth.consumerSecret,
    tokenSecret : auth.accessTokenSecret
  };

  parameters = [];
  parameters.push(['term', terms]);
  parameters.push(['ll', ll]);
  if (filter != 'none') {
    if (filter == 'african') {
      parameters.push(['category_filter', african]);
    } else if (filter == 'asian') {
      parameters.push(['category_filter', asian]);
    } else if (filter == 'european') {
      parameters.push(['category_filter', european]);
    } else if (filter == 'mideast') {
      parameters.push(['category_filter', mideast]);
    } else if (filter == 'namerican') {
      parameters.push(['category_filter', namerican]);
    } else if (filter == 'oceanian') {
      parameters.push(['category_filter', oceanian]);
    } else if (filter == 'samerican') {
      parameters.push(['category_filter', samerican]);
    }
  }

  // parameters.push(['offset', offset]);
  parameters.push(['callback', 'cb']);
  parameters.push(['oauth_consumer_key', auth.consumerKey]);
  parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
  parameters.push(['oauth_token', auth.accessToken]);
  parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

  var message = {
    'action' : 'http://api.yelp.com/v2/search',
    'method' : 'GET',
    'parameters' : parameters
  };

  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  var parameterMap = OAuth.getParameterMap(message.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)

  // console.log(parameterMap);

  var data;
  $.ajax({
    'url' : message.action,
    'data' : parameterMap,
    'cache' : true,
    'dataType' : 'jsonp',
    'jsonpCallback' : 'cb',
    'success' : function(data, textStats, XMLHttpRequest) {
      // data = $.parseJSON(data);
      // sort the restaurants using our custom sorting
      data.businesses.sort(sortRestaurants(rSort));
      showData(data);
      console.log(data);
      refreshMap();
      $loader.hide();
    },
    'error' : function(xhr, status, error) {
      displayRestaurantsError(error);
      $loader.hide();
    }
  });
}

// Custom sorting method based on restaurant property value passsed
function sortRestaurants(property) {
  var sortOrder = 1;
  if(property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a,b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}

/*
* Function that gets JSON object, parses the object, and prints out to HTML.
* Puts the result in "results" div
*/
function showData(data) {
  restaurants = [];
  if (data == null) {
    displayRestaurantsError('An error occured when retrieving the data');
  } else {
    var content = "";
    $.each(data.businesses, function(i, business) {
      if (business.distance <= distance) {
        if (business.distance > 1000) {
          business.distance = Math.round(business.distance/1000) + ' km';
        } else {
          business.distance = Math.round(business.distance) + ' m';
        }

        var status_html = business.is_closed ? '<font color="red"><b>Closed</b></font>' : '<font color="green"><b>Open</b></font>';
        content +=  '<div class="card" style="margin-top: 5px; margin-bottom: 4px">' +
        '<a class="item item-avatar" href="#/tab/restaurants/' + business.id + '" id=' + business.id + '>' +
        '<img src="' + business.image_url + '">' +
        '<h2>' + business.name + '</h2>' +
        // '<p>' + 'Address: ' + business.location.display_address[0] + ' '
        //       + business.location.display_address[1] + ' '
        //       + business.location.display_address[2] + ' '
        //       + business.location.display_address[3] + ' ' + '</p>' +
        '<p>' + 'Distance: ' + '<b>' + business.distance + '</b></p>' +
        '<p>' + 'Rating: ' + '<b>' + business.rating + '</b></p>' +
        '<p>' + 'Status: ' + status_html + '</p>' +
        '</a>' +
        '</div>';

        restaurants.push(business);
      }
    });

    $("#results").html(content);
  }
  checkResults();
}

/*
* Function that gets a restaurant object based on id
*/
function getRestaurant(id) {
  var restaurant = $.grep(restaurants, function(e){ return e.id == id; })[0];
  console.log(restaurant);
  return restaurant;
}

/*
* Function that checks if div="results" is empty or not.
* If results div is empty, then let a user know that there is no search result.
*/
function checkResults() {
  if( $('#results').is(':empty') ) {
    displayRestaurantsError("No restaurants were found in your area");
  }
}

/*
* Function to display all error messages related to getting the
* list of restaurants from Yelp
*/
function displayRestaurantsError(message) {
  var content = '<div class="card restaurant-results-error" style="margin-top: 5px; margin-bottom: 4px">' +
                '<p>' + message + '</p>' + 
                '<i class="ion-sad-outline"></i>' +
                '</div>'; 
  $('#results').html(content);
}
