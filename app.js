// ------------------------------------------
// DEPENDENCIES
// ------------------------------------------

var express = require("express"),
    app = express(),
    cons = require("consolidate"),
    MongoClient = require("mongodb").MongoClient,
    routes = require("./routes");

MongoClient.connect('mongodb://admin:pwd@apollo.modulusmongo.net:27017/daxU7vob', function(err, db) {
    "use strict";
    
    // Error connecting to the database
    if (err) throw err;

    // ------------------------------------------
    // APP SETTINGS
    // ------------------------------------------

    // Setting up view engine
    app.engine("html", cons.swig);
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");

    // Middleware
    app.use(express.cookieParser()); // to get cookies
    app.use(express.bodyParser()); // to get POST variables

    // App routes
    routes(app, db);

    // ------------------------------------------
    // LAUNCH APP
    // ------------------------------------------

    app.listen(8082);
    console.log("Express listening on port 8082");
});