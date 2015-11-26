/*  PACKAGES  */
/* ---------- */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var path = require('path');
// config file
var config = require('./config')



/*  APP CONFIGURATION  */
/* ------------------- */
// to grab info from POST requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// to handle CORS requests
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,\Authorization');
    next();
});
// log all requests to the console
app.use(morgan('dev'));
// db connection
mongoose.connect(config.database);
// set static files location
app.use(express.static(__dirname + '/public'));



/*  ROUTES  */
/* ------------ */
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);
// MAIN CATCHALL ROUTE
// send users to frontend (NOTE: It is important to put this route after the API routes since we only
// want it to catch routes not handled by Node)
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});


/*  START SERVER  */
/* -------------- */
app.listen(config.port);
console.log('Magic happens on port ' + config.port);
