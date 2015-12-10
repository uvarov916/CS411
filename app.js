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
    redis = require('redis');

var helpFunctions = require('./help_functions');

// process.on('uncaughtException', function (err) {
//   console.error(err);
//   console.log("Some fucking exception...");
// });


// Connects to Heroku Redis for production,
// or to local version of Redis
if (process.env.REDIS_URL) {
    var redisClient = require('redis').createClient(process.env.REDIS_URL);
}
else {
    var redisClient = require('redis').createClient();
}

redisClient.on('connect', function() {
    console.log("CONNTECTED TO REDIS");
});

MongoClient.connect('mongodb://mainuser:fr4frfsg@ds027335.mongolab.com:27335/heroku_l34smxcf', function(err, db) {
    "use strict";
    
    console.log("CONNTECTED TO MONGO");

    // Error connecting to the database
    if (err) throw err;

    helpFunctions.sendTextsToEverybody(db, redisClient);



    // ------------------------------------------
    // APP SETTINGS
    // ------------------------------------------

    // Setting up view engine
    app.engine("html", swig.renderFile);
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");

    // Turn off caching (for development only)
    // app.set('view cache', false);
    // swig.setDefaults({ cache: false });

    // Middleware
    app.use(express.cookieParser()); // to get cookies
    app.use(express.bodyParser()); // to get POST variables

    // Use default Heroku port
    app.set('port', (process.env.PORT || 5000));

    app.use(express.static(path.join(__dirname, 'public')));

    // App routes
    routes(app, db, redisClient);


    // ------------------------------------------
    // LAUNCH APP
    // ------------------------------------------

    app.listen(app.get('port'), function() {
      console.log('Node app is running on port', app.get('port'));
    });
});