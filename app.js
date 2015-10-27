// Modules
var express = require("express"),
	hbs = require("hbs"),
	bodyParser = require('body-parser'),
	app = express();
 
// Register hbs to render views 
app.set('view engine', 'html');
app.engine('html', hbs.__express);
// Serve static files
app.use(express.static('public'));



// -----------------------------------------
// GET
// -----------------------------------------

app.get("/", function(req, res) {
	res.render('index', {
		"title": "Home",
		"test": "testing this shit"
	});
});

app.get("/get/:test", function(req, res) {
  	res.send(req.params.test)
})

app.get("*", function(req, res) {
	res.render('404', {
		"title": "404: Not Found."
	});
});



var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Server started on port', port);
});