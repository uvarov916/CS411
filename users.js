var bcrypt = require('bcrypt-nodejs');

function UsersDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof UsersDAO)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersDAO(db);
    }

    var users = db.collection("users");

    this.addUser = function(email, password, callback) {
        "use strict";

        // Generate password hash
        var salt = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password, salt);

        // Create user document
        var user = {'_id': email, 'password': password_hash};

        users.insert(user, function (err, result) {
            "use strict";

            if (!err) {
                console.log("Inserted new user");
                return callback(null, result[0]);
            }

            return callback(err, null);
        });
    }

    this.validateLogin = function(email, password, callback) {
        "use strict";

        // Callback to pass to MongoDB that validates a user document
        function validateUserDoc(err, user) {
            "use strict";

            if (err) return callback(err, null);

            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    callback(null, user);
                }
                else {
                    var invalid_password_error = new Error("Invalid password");
                    // Set an extra field so we can distinguish this from a db error
                    invalid_password_error.invalid_password = true;
                    callback(invalid_password_error, null);
                }
            }
            else {
                var no_such_user_error = new Error("User: " + user + " does not exist");
                // Set an extra field so we can distinguish this from a db error
                no_such_user_error.no_such_user = true;
                callback(no_such_user_error, null);
            }
        }

        users.findOne({ '_id' : email }, validateUserDoc);
    }

    // ------------------------------------------
    // !!! NOT IMPLEMENTED !!!
    // ------------------------------------------

    this.getSavedLocations = function(email, callback) {
        users.findOne({"_id": email}, function(err, result) {
            if (!err) {
                console.log("Location for the user retrieved.");
                return callback(null, result["saved_locations"]);
            }

            return callback(err, null);
        });
    } 

    this.addNewLocation = function(email, loc, callback) {
        
        //  loc should be a dictionary of the following format:
        //  {
        //      "name": "Boston",
        //      "longtitude": 123,
        //      "latitude": 123 
        //  }


        users.update({"_id": email}, {$push: {"saved_locations": loc}}, function(err, result) {
            if (!err) {
                console.log("Added new location to the user.");
                return callback(null, result[0]);
            }

            return callback(err, null);
        });
    } 

    this.deleteSavedLocation = function(email, loc, callback) {
        
        users.update({"_id": email}, {$pull: {"saved_locations": loc}}, function(err, result) {
            if (!err) {
                console.log("Deleted location from user.");
                return callback(null, result[0]);
            }

            return callback(err, null);
        });
    } 


    this.setCellPhone = function(email, cellPhone, callback) {
        //console.log(email, cellPhone);
        users.update( { "_id": email } , { $set : { "cell_phone": cellPhone }}, function(err, result) {
            "use strict";
            if (!err) {
                console.log("Changed cell phone");
                return callback(null, result[0]);
            }

            return callback(err, null);         
        });

    }
}

module.exports.UsersDAO = UsersDAO;