var request = require('request');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

function getWeatherData(latitude, longtitude, callback) {
	var forecastApiKey = "97b429b5400c7110f209ae571437be6b";
	var baseUrl = "https://api.forecast.io/forecast/";
	var forecastUrl = baseUrl + forecastApiKey + "/" + latitude + "," + longtitude;

	request(forecastUrl, function(error, response, body) {
	  if (!error && response.statusCode == 200) {

	    if (callback) callback(JSON.parse(body));
	  }
	});
}

getWeatherData(37.4220352, -122.0841244, function(weather) {
	console.log(weather.latitude);
});