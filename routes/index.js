var SessionHandler = require("./session");
var ContentHandler = require("./content");
var ErrorHandler = require("./error").errorHandler;

module.exports = exports = function(app, db) {

    var sessionHandler = new SessionHandler(db);
    var contentHandler = new ContentHandler(db);

    // ------------------------------------------
    // MIDDLEWARE
    // ------------------------------------------

    app.use(sessionHandler.isLoggedInMiddleware);



    // ------------------------------------------
    // ROUTES
    // ------------------------------------------

    app.get("/", contentHandler.displayHomePage);

    // Login form
    app.get('/login', sessionHandler.displayLoginPage);
    app.post('/login', sessionHandler.handleLoginRequest);

    // Logout page
    app.get('/logout', sessionHandler.displayLogoutPage);

    // Signup form
    app.get('/signup', sessionHandler.displaySignupPage);
    app.post('/signup', sessionHandler.handleSignup);

    // Settings form
    app.get('/settings', contentHandler.displaySettingsPage);
    app.post('/settings', contentHandler.handleSaveSettings);

    app.get('/my_locations', contentHandler.displayMyLocationsPage);

    app.post('/weather_in_location', contentHandler.displayWeatherInSearchedLocation);

    app.get('/save_location', contentHandler.saveLocation);
    app.get('/delete_location', contentHandler.deleteLocation);

    app.get('*', function(req, res, next) {
        res.redirect("/");
    });


    // ------------------------------------------
    // ERROR HANDLING 
    // ------------------------------------------
    app.use(ErrorHandler);
}