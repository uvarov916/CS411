var UsersDAO = require('../users').UsersDAO;

function ContentHandler(db) {
	"use strict";

	var users = new UsersDAO(db);

	this.displayHomePage = function(req, res, next) {
		"use strict";

		if (req.logged_in == true) {
			return res.render("home", {
				email: req.email
			});
		}
		else {
			return res.render("promo");
		}
	}

	this.displaySettingsPage = function(req, res, next) {
		"use strict";

		if (req.logged_in == true) {
			return res.render("settings");
		}
		else {
			return res.redirect("/");
		}
	}

	this.displayMyLocationsPage = function(req, res, next) {
		"use strict";

		if (req.logged_in == true) {
			return res.render("my_locations");
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
				return res.render("settings");
			});
		}
		else {
			return res.redirect("/");
		}
	} 
}

module.exports = ContentHandler;