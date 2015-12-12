// ------------------------------------------
// DEPENDENCIES
// ------------------------------------------

var express = require("express"),
    app = express(),
    MongoClient = require("mongodb").MongoClient,
    routes = require("./routes"),
    request = require("request"),
    swig = require('swig'),
    path = require('path'),
    redis = require('redis'),
    helpFunctions = require('./help_functions'),
    sercretVariables = require('./secret_variables');


// ------------------------------------------
// SETTINGS
// ------------------------------------------

// Catch all exceptions so app doesn't crash
process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Oops. There was some error that we didn't expect.");
});

// Connects to Heroku Redis for production,
// or to local version of Redis
if (process.env.REDIS_URL) {
    var redisClient = require('redis').createClient(process.env.REDIS_URL);
}
else {
    var redisClient = require('redis').createClient();
}
redisClient.on('connect', function() {
    console.log("--> CONNTECTED TO REDIS <--");
});


// ------------------------------------------
// CONNECT TO MONGO AND LAUNCH THE APP
// ------------------------------------------

MongoClient.connect(sercretVariables.mongoConnectionUrl, function(err, db) {
    "use strict";
    
    // Error connecting to the database
    if (err) {
        console.log("Couldn't establish database connection.");
        throw err;
    }
    console.log("--> CONNTECTED TO MONGO <--");


    // View engine
    app.engine("html", swig.renderFile);
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");
    
    // Uncomment to turn off caching (for development only)
    // app.set('view cache', false);
    // swig.setDefaults({ cache: false });


    // Middleware
    app.use(express.cookieParser()); // to get cookies
    app.use(express.bodyParser()); // to get POST variables

    // Make static files publicly available
    app.use(express.static(path.join(__dirname, 'public')));

    // Use default Heroku port
    app.set('port', (process.env.PORT || 5000));

    // Set up app routes
    routes(app, db, redisClient);



    app.listen(app.get('port'), function() {
      console.log('The app is running on port ', app.get('port'));
    });
});