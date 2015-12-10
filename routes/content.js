var UsersDAO = require('../users').UsersDAO;
var CacheDAO = require('../cache').CacheDAO;
var request = require("request");
    
function ContentHandler(db, redisClient) {
    "use strict";

    var users = new UsersDAO(db);
    var cache = new CacheDAO(redisClient);
    
    // Twilio Config
    var accountSid = 'AC741c25b02127a7f89bfd89398cbb7b39';
    var authToken = 'ec0331d000609e234d0f045d8d16c1a5';
    var client = require('twilio')(accountSid, authToken);

    this.sendTexts = function(req, res, next) {
        var helpFunctions = require('../help_functions');
        helpFunctions.sendTextsToEverybody(db, redisClient);

        return res.redirect("/");
    };

    // Returns weather object from Forecast.io for given latitude and longtitude
    this.getWeatherData = function(latitude, longtitude, cache, callback) {

        var location = {
            "latitude": latitude,
            "longtitude": longtitude
        }

        cache.getWeatherForLocation(location, function(err, res) {

        if (err || res == null) {
            console.log("INSIDE ELSE STATEMENT");
            console.log(res);
            console.log(err);

            var forecastApiKey = "97b429b5400c7110f209ae571437be6b";
            var baseUrl = "https://api.forecast.io/forecast/";
            var forecastUrl = baseUrl + forecastApiKey + "/" + latitude + "," + longtitude;
            
            request(forecastUrl, function(error, response, body) {
                if (!error && response.statusCode == 200) {

                    var weatherData = JSON.parse(body);

                    cache.saveWeatherInLocation(location, weatherData);
                    if (callback) callback(weatherData);
                }
            });
        }
        else {
            console.log("INSIDE ELSE STATEMENT");
            console.log(res);
            if (callback) callback(res);
        }

        });
    }

    this.displayHomePage = function(req, res, next) {
        "use strict";

        if (req.logged_in == true) {
            return res.render("home");
        }
        else {
            return res.render("promo");
        }
    }


    this.displaySettingsPage = function(req, res, next) {
        "use strict";

        if (req.logged_in == true) {
            users.getPhoneNumber(req.email, function(err, phoneNumber) {
                return res.render("settings", {
                    "phoneNumber": phoneNumber
                });
            });
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
                        getWeatherData(locations[idx].latitude, locations[idx].longtitude, cache, function(weatherData) {
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

                    if (locations.length == 0) {
                        return res.render("my_locations");
                    }
                }
                else {
                    console.log("Couldn't retrieve locations for the user.")
                    return res.render("my_locations", {
                        "locations": []
                    });
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
                return res.redirect("/settings");
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
        // process.on('uncaughtException', function (err) {
        //   console.error(err);
        //   console.log("Bad search...");
        //   return res.redirect("/");
        // });

        var userLocation = req.query.location_search_term;
        console.log(userLocation);

        getLocationData(userLocation, function(err, mylocdata) {
            if (err || typeof mylocdata.results[0] === "undefined") {
                return res.redirect("/");
            }

            var loc = {}
            loc["name"] = mylocdata.results[0].formatted_address;
            loc["longtitude"] = mylocdata.results[0].geometry.location.lng;
            loc["latitude"] = mylocdata.results[0].geometry.location.lat;       
            
            getWeatherData(loc.latitude, loc.longtitude, cache, function(weather) {
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

    
        getWeatherData(loc.latitude, loc.longtitude, cache, function(weather) {
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

            /*  If user has a cell-phone linked with their account, send a text
             *  at specified time (see CronJob) everyday with weather info for this saved location
             *
             *  NOTE: NEED TO SKIP CRONJOB CREATION IF USER HAS NO PHONE NUMBER
            */
            users.getPhoneNumber(req.email, function(err, phoneNumber) {

                getWeatherData(location_longtitude, location_latitude, cache, function(weatherData) {
                    var locationWeather = {
                        "name": location_name,
                        "summary": weatherData.currently.summary,
                        "temperature": Math.round(weatherData.currently.temperature)
                        //"apparentTemperature": Math.round(weatherData.currently.apparentTemperature)
                    }

                    // We now have the user's phone number and weather info
                    // console.log(phoneNumber);

                    // CronJob Dependency
                    var CronJob = require('cron').CronJob;
                    /* Create a cron job then run it */
                    var job = new CronJob({
                        // Schedule job using military time
                        // Ex:  '00 45 18 * * 1-5' 
                        //       --> Perform task at 6:45:00 PM, Mon(1) through Fri(5)  
                        cronTime: '00 02 19 * * 0-6',
                        onTick: function() {
                            // Send text with current weather info to user
                            client.sendMessage({
                                to: '+' + phoneNumber, // Any number Twilio can deliver to
                                from: '+18455354126', // A number you bought from Twilio and can use for outbound communication
                                body: 'Weather in ' + locationWeather.name + ":\n" 
                                                    + locationWeather.summary + "\n"
                                                    + locationWeather.temperature + " degrees \n"
                                                    + "--rainOrShine--"// body of the SMS message
                            }, function(err, responseData) { //this function is executed when a response is received from Twilio
                                if (!err) { // "err" is an error received during the request, if any
                                console.log(responseData.from);
                                console.log(responseData.to);
                                console.log(responseData.body);
                                }
                            });
                        },
                        start: false
                    });
                    job.start();

                });

            });

            users.addNewLocation(req.email, loc, function(err, result) {

                return res.redirect("/my_locations");
            });
        }
        // Redirect to home page if not logged in
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
        // Redirect to home page if not logged in
        else {
            return res.redirect("/");
        }
    }
}



// ------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------


function getWeatherData(latitude, longtitude, cache, callback) {

    var location = {
        "latitude": latitude,
        "longtitude": longtitude
    }

    cache.getWeatherForLocation(location, function(err, res) {

    if (err || res == null) {
        console.log("INSIDE ELSE STATEMENT");
        console.log(res);
        console.log(err);

        var forecastApiKey = "97b429b5400c7110f209ae571437be6b";
        var baseUrl = "https://api.forecast.io/forecast/";
        var forecastUrl = baseUrl + forecastApiKey + "/" + latitude + "," + longtitude;
        
        request(forecastUrl, function(error, response, body) {
            if (!error && response.statusCode == 200) {

                var weatherData = JSON.parse(body);

                cache.saveWeatherInLocation(location, weatherData);
                if (callback) callback(weatherData);
            }
        });
    }
    else {
        console.log("INSIDE ELSE STATEMENT");
        console.log(res);
        if (callback) callback(res);
    }

    });
}


// NEED TO CHECK FOR INCORRECT LOCATION INPUT
function getLocationData(inputAddress, callback) {
    var geocodingApiKey = "AIzaSyAEokMIw4n0LyczRhF3Qrmo-_HZCnHFdKM";
    var baseUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
    var geocodingUrl = baseUrl + inputAddress + "&key=" + geocodingApiKey;
    
    request(geocodingUrl, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            return callback(null, JSON.parse(body));
        }
        else {
            return callback(error, null)
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


// Returns proper icon class based on icon name received from Forecast.io
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