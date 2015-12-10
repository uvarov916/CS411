var CACHE_EXPIRATION_TIME = 30 * 60;

function CacheDAO(redisClient) {
    "use strict";

    if (false === (this instanceof CacheDAO)) {
        console.log('Warning: CacheDAO constructor called without "new" operator');
        return new CacheDAO(redisClient);
    }
    
    this.getWeatherForLocation = function(location, callback) {

        var locationID = String(location.latitude) + String(location.longtitude);

        redisClient.get(locationID, function(err, reply) {
            callback(err, JSON.parse(reply));
        });
    }

    this.saveWeatherInLocation = function(location, weatherData, callback) {

        var locationID = String(location.latitude) + String(location.longtitude);
        var weatherDataString = JSON.stringify(weatherData);

        console.log("locationID: " + locationID);
        console.log("weatherDataString: " + weatherDataString);

        redisClient.set(locationID, weatherDataString);
        redisClient.expire(locationID, CACHE_EXPIRATION_TIME);
    }
}


module.exports.CacheDAO = CacheDAO;