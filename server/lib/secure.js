var fs   = require('fs'),
    util = require('util'),
    path = require('path');

/*
 * Routes related to authentication and secure routes that require passord.
 */
var routes = exports.createSecureRoutes = function (server, auth, options) {
    var models       = server.get('models'),
        authenticate = server.get('authenticate');

    /*
     * logout route
     */
    server.get('/logout', function (request, response) {
        var authCookie = request.cookies[options.authCookieKey];
        if (!authCookie) { return response.send(204); }
        auth.invalidateToken(authCookie, function (err) {
            response.status(204)
                    .clearCookie(options.authCookieKey)
                    .send();
        });
    });

    /*
     * refresh auth token
     */
    server.get('/ping', authenticate, function (request, response) {
        response.send(204);
    });

    /*
     * change user preferences
     */
    server.post('/users/:id/preferences', authenticate, function (request, response) {
        if (request.params.id !== request.user.id) { return response.send(401); }
        var username = request.user.email,
            password = request.body.password;
        auth.validateCredentials(username, password, function (err, result) {
            if (!result.success) { return response.send(401); }
            models.user.update(request.user.id, request.body, function (err) {
                if (err) { return response.send(400, err.message); }
                response.send(204);
            });
        });
    });

    /*
     * register user
     */
    server.post('/register', function (request, response) {
        models.user.create(request.body, function (err, user) {
            if (err) { return response.send(400, err.message); }
            auth.validateCredentials(user.email, request.body.password1, function (err, result) {
                models.user.update(user.id, { last_login: new Date() } );
                response.status(201)
                        .cookie(options.authCookieKey,
                                result.token,
                                { maxAge: options.maxTokenAge, httpOnly: true })
                        .cookie(options.refreshCookieKey,
                                String(options.maxTokenAge - options.refreshDifference))
                        .location('/users/' + user.id)
                        .send();
            });
        });
    });

    /*
     * login route
     */
    server.post('/login', function (request, response) {
        var username = request.body.id,
            password = request.body.password;
        auth.validateCredentials(username, password, function (err, result) {
            if (err || !result.success) { return response.send(401); }
            util.log('auth: user ' + result.user.id + ' authenticated via login');
            models.user.update(result.user.id, { last_login: new Date() } );
            response.status(200)
                    .cookie(options.authCookieKey,
                            result.token,
                            { maxAge: options.maxTokenAge, httpOnly: true })
                    .cookie(options.refreshCookieKey,
                            String(options.maxTokenAge - options.refreshDifference))
                    .send(result.user);
        });
    });
};
