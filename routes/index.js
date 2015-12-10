var SessionHandler = require("./session");
var ContentHandler = require("./content");
var ErrorHandler = require("./error").errorHandler;

module.exports = exports = function(app, db, redisClient) {

    var sessionHandler = new SessionHandler(db);
    var contentHandler = new ContentHandler(db, redisClient);

    // ------------------------------------------
    // MIDDLEWARE
    // ------------------------------------------

    app.use(sessionHandler.isLoggedInMiddleware);
    

    // ------------------------------------------
    // ROUTES
    // ------------------------------------------

    app.get("/", contentHandler.displayHomePage);

    // Login Form
    app.get('/login', sessionHandler.displayLoginPage);
    app.post('/login', sessionHandler.handleLoginRequest);

    // Logout Page
    app.get('/logout', sessionHandler.displayLogoutPage);

    // Signup Form
    app.get('/signup', sessionHandler.displaySignupPage);
    app.post('/signup', sessionHandler.handleSignup);

    // Settings Form
    app.get('/settings', contentHandler.displaySettingsPage);
    app.post('/settings', contentHandler.handleSaveSettings);

    // My Location
    app.get('/my_locations', contentHandler.displayMyLocationsPage);

    // Weather in Location
    app.get('/weather_in_location', contentHandler.displayWeatherInSearchedLocation);
    app.get('/weather_in_saved_location', contentHandler.displayWeatherInSavedLocation);

    // Saving/Deleting Locations
    app.get('/save_location', contentHandler.saveLocation);
    app.get('/delete_location', contentHandler.deleteLocation);

    app.get('/send_texts', contentHandler.sendTexts);

    // For all other pages
    app.get('*', function(req, res, next) {
        res.redirect("/");
    });


    // ------------------------------------------
    // ERROR HANDLING 
    // ------------------------------------------
    app.use(ErrorHandler);
}