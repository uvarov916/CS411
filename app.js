'use strict';

// Modules
var express = require("express"),
	hbs = require("hbs"),
	bodyParser = require('body-parser'),
	request = require('request'),
	app = express();
 
// Register hbs to render views 
app.set('view engine', 'html');
app.engine('html', hbs.__express);
// Serve static files
app.use(express.static('public'));
// instruct the app to use the `bodyParser()` middleware for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// -----------------------------------------
// GET
// -----------------------------------------

/*
app.get("/location", function(req, res) {
  	res.send('longtitude, ' + req.query.location);
}) */

app.get('/', function(req, res){
  	// The form's action is '/' and its method is 'GET',
  	// so the `app.post('/', ...` route will receive the
  	// result of our form
  	res.render('index', {
		"page-title": "Home"
	});
});

// This route receives the posted form.
// As explained above, usage of 'body-parser' means
// that `req.body` will be filled in with the form elements
app.post('/location-temperature', function(req, res){
  var userLocation = req.body.userLocation;
  
  getLocationData(userLocation, function(mylocdata) {
  	var latitude  = mylocdata.results[0].geometry.location.lat;
  	var longitude = mylocdata.results[0].geometry.location.lng;
  	var fullAddr  = mylocdata.results[0].formatted_address;
  	//console.log(latitude);
    //console.log(longitude);
  	
  	getWeatherData(latitude, longitude, function(weather) {
  	  var currentTemp    = weather.currently.temperature;
  	  var currentSummary = weather.currently.summary;
  	  var currentIcon = weather.currently.icon;
      var iconClassToRender = getIconClass(currentIcon);

      var dailyData = weather.daily.data;

      var days = [];
      for (var key in dailyData) {
        var temp = {}
        temp.iconClass = getIconClass(dailyData[key].icon);
        temp.summary = dailyData[key].summary;

        var d = new Date(dailyData[key].time * 1000);
        temp.date = getDayString(d.getDay());

        temp.minTemp = dailyData[key].temperatureMin;
        temp.maxTemp = dailyData[key].temperatureMax;

        days.push(temp);
      }

  	  res.render('search-results', {
        "search-term": userLocation,
  			"page-title": "Search Results",
        "weather-summary": currentSummary,
        "current-temp": currentTemp,
        "weather-icon": iconClassToRender,
        "days": days
  		});
  	
    });
  });
  
});

function getLocationData(inputAddress, callback) {
	var geocodingApiKey = "AIzaSyAEokMIw4n0LyczRhF3Qrmo-_HZCnHFdKM";
	var baseUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
	var geocodingUrl = baseUrl + inputAddress + "&key=" + geocodingApiKey;
	//console.log(geocodingUrl)
	
	request(geocodingUrl, function(error, response, body) {
	  if (!error && response.statusCode == 200) {

	    if (callback) callback(JSON.parse(body));
	  }
	});
}

function getWeatherData(latitude, longtitude, callback) {
	var forecastApiKey = "97b429b5400c7110f209ae571437be6b";
	var baseUrl = "https://api.forecast.io/forecast/";
	var forecastUrl = baseUrl + forecastApiKey + "/" + latitude + "," + longtitude;
	//console.log(forecastUrl)
	
	request(forecastUrl, function(error, response, body) {
	  if (!error && response.statusCode == 200) {

	    if (callback) callback(JSON.parse(body));
	  }
	});
}

/* getWeatherData(37.4220352, -122.0841244, function(weather) {
	console.log(weather.currently.temperature);
}); */

app.get("*", function(req, res) {
	res.render('404', {
		"title": "404: Not Found."
	});
});

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Server started on port', port);
});

function getIconClass(currentIcon) {
  var iconClassToRender = "";
  if (currentIcon == "clear-day") {
    iconClassToRender = "wi-day-sunny";
  } else if (currentIcon == "clear-night") {
    iconClassToRender = "wi-night-clear";
  } else if (currentIcon == "rain") {
    iconClassToRender = "wi-rain";
  } else if (currentIcon == "snow") {
    iconClassToRender = "wi-snow";
  } else if (currentIcon == "sleet") {
    iconClassToRender = "wi-sleet";
  } else if (currentIcon == "wind") {
    iconClassToRender = "wi-windy";
  } else if (currentIcon == "fog") {
    iconClassToRender = "wi-fog";
  } else if (currentIcon == "cloudy") {
    iconClassToRender = "wi-cloudy";
  } else if (currentIcon == "partly-cloudy-day") {
    iconClassToRender = "wi-day-cloudy";
  } else if (currentIcon == "partly-cloudy-night") {
    iconClassToRender = "wi-night-alt-cloudy";
  }

  return iconClassToRender;
}


function getDayString(dayNumber) {
  
  var dayString = "Undefined";

  switch(dayNumber) {
    case 0:
        var dayString = "Sunday";
        break;
    case 1:
        var dayString = "Monday";
        break;
    case 2:
        var dayString = "Tuesday";
        break;
    case 3:
        var dayString = "Wednesday";
        break;
    case 4:
        var dayString = "Thursday";
        break;
    case 5:
        var dayString = "Friday";
        break;
    case 6:
        var dayString = "Saturday";
        break;
    default:
        var dayString = "Number is out of range";
  }

  return dayString;
}

