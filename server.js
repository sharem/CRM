// call the packages
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');

// schemas
var User       = require('./app/models/user');

// set app port
var port       = process.env.PORT || 8080;

// db connection
mongoose.connect('mongodb://node:node@ds047514.mongolab.com:47514/crm');


/*  APP CONFIGURATION  */
/* ------------------- */
// to grab info from POST requests
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// to handle CORS requests
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,\Authorization');
    next();
});

// log all requests to the console
app.use(morgan('dev'));


/*  API ROUTES  */
/* ------------ */

// home page
app.get('/', function(req, res) {
    res.send('Welcome to the home page!');
});

// API
var apiRouter = express.Router();
// middleware to use for all requests
apiRouter.use(function(req, res, next) {
    // do logging
    console.log('Somebody just came to our app!');
    next();
});
apiRouter.get('/', function(req, res) {
   res.json({ message: 'welcome to our API!' }); 
});

// /users
apiRouter.route('/users')
    // create a user (accessed at POST http://localhost:8080/api/users)
    .post(function(req, res) {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user and check for errors
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000) {
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                } else {
                    return res.send(err);
                }
            }
            res.json({ message: 'User created!' });
        });
    })
    // get all the users (accessed at GET http://localhost:8080/api/users)
    .get(function(req, res) {
        User.find(function(err, users) {
            if (err) 
                res.send(err);
            res.json(users);
        });
    });

app.use('/api', apiRouter);

/*  START SERVER  */
/* -------------- */
app.listen(port);
console.log('Magic happens on port ' + port);