// call the packages
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var jwt        = require('jsonwebtoken');

// schemas
var User       = require('./app/models/user');

// set app port
var port       = process.env.PORT || 8080;

// secret
var secret     = 'supersecretword';

// db connection
mongoose.connect('mongodb://node:node@ds047514.mongolab.com:47514/crm');


/*  APP CONFIGURATION  */
/* ------------------- */
// to grab info from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
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
// route for authenticating users (POST http://localhost:8080/api/authenticate)
apiRouter.post('/authenticate', function(req, res){
    // find user
    User.findOne({ username: req.body.username }).select('name username password').exec(function(err, user) {
        if (err)
           throw err;
        // username not found
        if (!user) {
            res.json( {
                success: false,
                message: 'Authentication failed. User not found.'
            });
        // check if password match
        } else {
            var validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
                res.json({
                    success: false,
                    message: 'Authentication failed.'
                });
            // user found & passwords match
            } else {
                // create token
                var token = jwt.sign({ 
                    name: user.name,
                    username: user.username
                }, secret, {
                    expiresInMinutes: 1440 // 24h
                });
                // return both token and information
                res.json({
                    success: true,
                    message: 'Token sent',
                    token: token
                });
            }
        }
    });
});
// middleware to use for all requests
apiRouter.use(function(req, res, next) {
    // check header || URL params || POST params for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    // if there is no token return 403 (access forbidden) and error message
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

apiRouter.get('/', function(req, res) {
   res.json({ message: 'welcome to our API!' }); 
});

apiRouter.get('/me', function(req, res) {
    res.send(req.decoded);
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

// /users:user_id
apiRouter.route('/users/:user_id')
    // get the user (accessed at GET http://localhost:8080/api/users/:user_id)
    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    })
    // update the user with the id (accessed at PUT http://localhost:8080/api/users/:user_id)
    .put(function(req, res) {
         User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            // update info only if it's new
            if (req.body.name)
                user.name = req.body.name;
            if (req.body.username)
                user.username = req.body.username;
            if (req.body.password)
                user.password = req.body.password;
            user.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'User updated!' });
            })
        });
    })
    // delete the user with the id (accessed at DELETE http://localhost:8080/api/users/:user_id)
    .delete(function(req, res) {
        User.remove({
            _id: req.params.user_id    
        }, function(err, user) {
            if (err)
                return res.send(err);
            res.json({ message: 'User successfully deleted' });
        });
    });
app.use('/api', apiRouter);


/*  START SERVER  */
/* -------------- */
app.listen(port);
console.log('Magic happens on port ' + port);