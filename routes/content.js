var UsersDAO = require('../users').UsersDAO;
var request = require("request");
	
function ContentHandler(db) {
	"use strict";

	var users = new UsersDAO(db);

	this.displayHomePage = function(req, res, next) {
		"use strict";

		if (req.logged_in == true) {
			return res.render("home", {
				email: req.email
			});
		}
		else {
			return res.render("promo");
		}
	}

	this.displaySettingsPage = function(req, res, next) {
		"use strict";

		if (req.logged_in == true) {
			return res.render("settings");
		}
		else {
			return res.redirect("/");
		}
	}

	this.displayMyLocationsPage = function(req, res, next) {
		"use strict";

		if (req.logged_in == true) {

			users.getSavedLocations(req.email, function(err, locations) {
				
				if (!err) {
					// console.log("Rendering the following locations: ");
					// console.log(locations);

					var dataToRender = []

					locations.forEach(function(listItem, idx) {
						getWeatherData(locations[idx].latitude, locations[idx].longtitude, function(weatherData) {
							var locationWeather = {
								"name": locations[idx].name,
								"latitude": locations[idx].latitude,
								"longtitude": locations[idx].longtitude,
								"summary": weatherData.currently.summary,
								"temperature": Math.round(weatherData.currently.temperature),
								"apparentTemperature": Math.round(weatherData.currently.apparentTemperature)
							}
							//console.log(locationWeather);
							dataToRender.push(locationWeather);

							if (dataToRender.length == locations.length) {
								console.log("RENDERING PAGE");
								console.log(dataToRender);

								return res.render("my_locations", {
									locations: dataToRender
								});
							}
						});
					});
				}
				else {
					console.log("Couldn't retrieve locations for the user.")
					return res.render("my_locations");
				}
			})
		}
		else {
			return res.redirect("/");
		}
	}

	this.handleSaveSettings  = function(req, res, next) {
		"use strict";

		if (req.logged_in == true) {
			var cell_phone = req.body.cell_phone;
			//console.log(cell_phone);
			users.setCellPhone(req.email, cell_phone, function() {
				return res.render("settings");
			});
		}
		else {
			return res.redirect("/");
		}
	}

	this.displayWeatherInSearchedLocation = function(req, res, next) {
		"use strict";

		// Prevents app from crashing upon invalid search location, reloads page
		// TO DO: return an error message
		process.on('uncaughtException', function (err) {
		  console.error(err);
		  console.log("Bad search...");
		  return res.redirect("/");
		});

		var userLocation = req.query.location_search_term;
		console.log(userLocation);

		getLocationData(userLocation, function(mylocdata) {
			var loc = {}
			loc["name"] = mylocdata.results[0].formatted_address;
			loc["longtitude"] = mylocdata.results[0].geometry.location.lng;
			loc["latitude"] = mylocdata.results[0].geometry.location.lat;	    
		  	
		  	getWeatherData(loc.latitude, loc.longtitude, function(weather) {
		  		var currentWeather = {
		  			"summary": weather.currently.summary,
		  			"temperature": Math.round(weather.currently.temperature),
		  			"apparentTemperature": Math.round(weather.currently.apparentTemperature),
		  			"precipProbability": weather.currently.precipProbability,
		  			"windSpeed": weather.currently.windSpeed,
		  			"iconClass": getIconClass(weather.currently.icon)
		  		}

		  		var weatherThisWeek = [];
		  		var dailyData = weather.daily.data;

		  		for (var key in dailyData) {
			    	var temp = {}
			        temp.iconClass = getIconClass(dailyData[key].icon);
			        temp.summary = dailyData[key].summary;

			        var d = new Date(dailyData[key].time * 1000);
			        temp.date = getDayString(d.getDay());

			        temp.minTemp = dailyData[key].temperatureMin;
			        temp.maxTemp = dailyData[key].temperatureMax;

			        weatherThisWeek.push(temp);
			    }

		  		return res.render("weather_in_location", {
					"location": loc,
					"currentWeather": currentWeather,
					"weatherThisWeek": weatherThisWeek
				});
		  	
		    });
		});
	} 

	this.displayWeatherInSavedLocation = function(req, res, next) {
		"use strict";

		var loc = {}
		loc["name"] = req.query.location_name;
		loc["longtitude"] = req.query.location_longtitude;
		loc["latitude"] = req.query.location_latitude;

  	
	  	getWeatherData(loc.latitude, loc.longtitude, function(weather) {
	  		var currentWeather = {
	  			"summary": weather.currently.summary,
	  			"temperature": Math.round(weather.currently.temperature),
	  			"apparentTemperature": Math.round(weather.currently.apparentTemperature),
	  			"precipProbability": weather.currently.precipProbability,
	  			"windSpeed": weather.currently.windSpeed,
	  			"iconClass": getIconClass(weather.currently.icon)
	  		}

	  		var weatherThisWeek = [];
	  		var dailyData = weather.daily.data;

	  		for (var key in dailyData) {
		    	var temp = {}
		        temp.iconClass = getIconClass(dailyData[key].icon);
		        temp.summary = dailyData[key].summary;

		        var d = new Date(dailyData[key].time * 1000);
		        temp.date = getDayString(d.getDay());

		        temp.minTemp = dailyData[key].temperatureMin;
		        temp.maxTemp = dailyData[key].temperatureMax;

		        weatherThisWeek.push(temp);
		    }

	  		return res.render("weather_in_saved_location", {
				"location": loc,
				"currentWeather": currentWeather,
				"weatherThisWeek": weatherThisWeek
			});
	  	
	    });
	}

	this.saveLocation = function(req, res, next) {
		"use strict";

		// DOESN'T CHECK IF INSERT A DUPLICATE

		if (req.logged_in == true) {

			var location_name = req.query.location_name;
			var location_longtitude = req.query.location_longtitude;
			var location_latitude = req.query.location_latitude;

			var loc = {
				"name": location_name,
				"longtitude": location_longtitude,
				"latitude": location_latitude
			}
			users.addNewLocation(req.email, loc, function(err, result) {
				return res.redirect("/my_locations");
			});

		}
		else {
			return res.redirect("/");
		}
	}

	this.deleteLocation = function(req, res, next) {
		"use strict";

		if (req.logged_in == true) {

			var location_name = req.query.location_name;
			var location_longtitude = req.query.location_longtitude;
			var location_latitude = req.query.location_latitude;

			var loc = {
				"name": location_name,
				"longtitude": location_longtitude,
				"latitude": location_latitude
			}

			users.deleteSavedLocation(req.email, loc, function(err, result) {
				return res.redirect("/my_locations");
			});

		}
		else {
			return res.redirect("/");
		}
	}
}

// NEED TO CHECK FOR INCORRECT LOCATION INPUT
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

function getIconClass(currentIcon) {
  var iconClassToRender = "";
  if (currentIcon == "clear-day") {
    iconClassToRender = "icon-sun";
  } else if (currentIcon == "clear-night") {
    iconClassToRender = "icon-moon";
  } else if (currentIcon == "rain") {
    iconClassToRender = "icon-rainy";
  } else if (currentIcon == "snow") {
    iconClassToRender = "icon-snowy";
  } else if (currentIcon == "sleet") {
    iconClassToRender = "icon-sleet";
  } else if (currentIcon == "wind") {
    iconClassToRender = "icon-windy";
  } else if (currentIcon == "fog") {
    iconClassToRender = "icon-mist";
  } else if (currentIcon == "cloudy") {
    iconClassToRender = "icon-cloud";
  } else if (currentIcon == "partly-cloudy-day") {
    iconClassToRender = "icon-cloud";
  } else if (currentIcon == "partly-cloudy-night") {
    iconClassToRender = "icon-cloud";
  }

  return iconClassToRender;
}

module.exports = ContentHandler;