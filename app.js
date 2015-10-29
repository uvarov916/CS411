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
	var latitude  = mylocdata.results[0].geometry.location.lat
	var longitude = mylocdata.results[0].geometry.location.lng
	var fullAddr  = mylocdata.results[0].formatted_address
	//console.log(latitude);
    //console.log(longitude);
	
	getWeatherData(latitude, longitude, function(weather) {
	  var currentTemp    = weather.currently.temperature
	  var currentSummary = weather.currently.summary 
	  var html = 'Searched Location: '   + fullAddr + '<br>' +
				 'Weather Summary: '     + currentSummary + '<br>' +
				 'Current Temperature: ' + currentTemp + '<br>' +
				 '<a href="/">Search again.</a>';
	  res.send(html)
	  //console.log(weather.currently.temperature);
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


// -----------------------------------------
// GET
// -----------------------------------------

