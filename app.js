// ------------------------------------------
// DEPENDENCIES
// ------------------------------------------

var express = require("express"),
    app = express(),
    cons = require("consolidate"),
    MongoClient = require("mongodb").MongoClient,
    routes = require("./routes"),
    request = require("request"),
    swig = require('swig'),
    path = require('path');

MongoClient.connect('mongodb://heroku_l34smxcf:fr4frfsg@ds027335.mongolab.com:27335/heroku_l34smxcf', function(err, db) {
    "use strict";
    
    // Error connecting to the database
    if (err) throw err;

    // ------------------------------------------
    // APP SETTINGS
    // ------------------------------------------

    // Setting up view engine
    app.engine("html", swig.renderFile);
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");

    // REMOVE FOR PRODUCTION
    app.set('view cache', false);
    swig.setDefaults({ cache: false });

    // Middleware
    app.use(express.cookieParser()); // to get cookies
    app.use(express.bodyParser()); // to get POST variables

    app.use(express.static(path.join(__dirname, 'public')));

    // App routes
    routes(app, db);

    // ------------------------------------------
    // LAUNCH APP
    // ------------------------------------------

    app.listen(8082);
    console.log("Express listening on port 8082");
});