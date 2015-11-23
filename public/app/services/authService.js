angular.module('authService', [])
// auth factory to login and get information
    .factory('Auth', function($http, $q, AuthToken) {
    // create auth factory object
    var authFactory = {};
    // log a user in
    authFactory.login = function(username, password) {
        return $http.post('/api/authenticate', {
            username: username,
            password: password
        })
            .success(function(data) {
            AuthToken.setToken(data.token);
            return data;
        });
    };
    authFactory.logout = function() {
        // clear the token
        AuthToken.setToken();
    };
    authFactory.isLoggedIn = function() {
        if (AuthToken.getToken()) {
            return true;
        } else {
            return false;
        }
    };
    authFactory.getUser = function() {
        if (AuthToken.getToken()) {
            return $http.get('/api/me');
        } else {
            return $q.reject({ message: 'User has no token.' });
        }
    };
    return authFactory;
})
// factory for handling tokens
    .factory('AuthToken', function($window) {
    // create authToken factory object
    var authTokenFactory = {};
    // get the token out of local storage
    authTokenFactory.getToken = function() {
        return $window.localStorage.getItem('token');
    };
    // function to set token or clear token
    authTokenFactory.setToken = function(token) {
        if (token) {
            // if a token is passed, set the token
            $window.localStorage.setItem('token', token);
        } else {
            // if there is no token, clear it from local storage
            $window.localStorage.removeItem('token');
        }
    };
    return authTokenFactory;
})
// application configuration to integrate token into requests
    .factory('AuthInterceptor', function($q, AuthToken) {
    var interceptorFactory = {};
    // this will happen on all HTTP requests
    interceptorFactory.request = function(config) {
        // grab the token
        var token = AuthToken.getToken();
        if (token) {
            // if the token exists, add it to the header as x-access-token
            config.headers['x-access-token'] = token;
        }
        return config;
    };
    // happens on response errors
    interceptorFactory.responseError = function(response) {
        // if our server returns a 403 forbidden response
        if (response.status == 403) {
            AuthToken.setToken();
            $location.path('/login');
        }
        // return the errors from the server as a promise
        return $q.reject(response);
    };
    return interceptorFactory;
});