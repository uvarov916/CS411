module.exports = {
    sendTextsToEverybody: function(db, redis) {

        var ContentHandler = require('./routes/content');
        var content = new ContentHandler(db, redis);
        var CacheDAO = require('./cache').CacheDAO;

        var accountSid = 'AC741c25b02127a7f89bfd89398cbb7b39';
        var authToken = 'ec0331d000609e234d0f045d8d16c1a5';
        var twilioClient = require('twilio')(accountSid, authToken);

        var userQuery = {
            "cell_phone": { 
                "$exists": true, 
                "$nin": [""]
            },
            "saved_locations": {
                "$exists": true,
                "$not": {
                    "$size": 0
                }
            }
        }

        var userCursor = db.collection("users").find(userQuery);

        console.log("BEFORE RUNNING CURSOR");


        userCursor.each(function(err, user) {

            if (user == null) {
                return;
            }

            if (err) {
                console.log("There was an error in cursor: " + err);
            }

            var phoneNumber = "+" + user["cell_phone"];
            var savedLocation = user["saved_locations"][0]["name"];
            console.log("SENDING TEXT TO: " + phoneNumber);

            var cache = new CacheDAO(redis)

            content.getWeatherData(user["saved_locations"][0]["latitude"], user["saved_locations"][0]["longtitude"], cache, function(weather) {

                var message = savedLocation + ": " + weather.currently.summary;

                twilioClient.sendMessage({
                    to: phoneNumber, // Any number Twilio can deliver to
                    from: '+18455354126', // A number you bought from Twilio and can use for outbound communication
                    body: message // body of the SMS message
                }, function(err, responseData) { //this function is executed when a response is received from Twilio
                    if (!err) { // "err" is an error received during the request, if any
                    console.log(responseData.from);
                    console.log(responseData.to);
                    console.log(responseData.body);
                    }
                });
            });

        });
    }
}