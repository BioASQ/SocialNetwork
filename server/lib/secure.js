var fs     = require('fs'),
    util   = require('util'),
    path   = require('path'),
    url    = require('url'),
    crypto = require('crypto'),
    qstr   = require('querystring'),
    Mail   = require('./mail').Mail;

function setAuthCookies(response, token, userID, tokenDate, options) {
    var expiresDate = new Date (tokenDate.getTime() + options.maxTokenAge);
    response.cookie(options.authCookieKey,
                    token,
                    { expires: expiresDate, httpOnly: true })
            .cookie(options.userIDCookieKey,
                    String(userID),
                    { expires: expiresDate })
            .cookie(options.expirationCookieKey,
                    String(expiresDate - new Date()),
                    { expires: expiresDate });
}

/*
 * Routes related to authentication and
 * secure routes that require a passord or a code.
 */
var routes = exports.createSecureRoutes = function (server, auth, options) {
    var models         = server.get('models'),
        authentication = server.get('authentication'),
        config         = server.get('config');

    var mail = new Mail(config);

    /*
     * Log out
     */
    server.get('/logout', function (request, response) {
        var authCookie = request.cookies[options.authCookieKey];
        if (!authCookie) { return response.send(204); }
        auth.invalidateToken(authCookie, function (err) {
            response.status(204)
                    .clearCookie(options.authCookieKey)
                    .clearCookie(options.userIDCookieKey)
                    .clearCookie(options.expirationCookieKey)
                    .send();
        });
    });

    /*
     * Refresh auth token
     */
    server.get('/refresh', authentication, function (request, response) {
        util.log('auth: refreshing token for ' + request.user.id);
        setAuthCookies(response, request.auth.token, request.auth.user.id, request.auth.date, options);
        response.send(204);
    });

    server.get('/activate/:token', function (request, response) {
        if (!request.params.token) { return response.send(400); }
        var token = new Buffer(request.params.token, 'base64').toString(),
            parts = token.split(':'),
            email = parts.shift(),
            code  = parts.shift().trim();
        models.user.activate(email, code, function (err, user) {
            if (err) { response.send(400, err.message); }
            util.log('auth: account ' + user.id + ' activated');
            util.log('auth: user ' + user.id + ' authenticated via email secret');
            auth.generateToken(user.id, function (err, token, tokenDate) {
                models.user.update(user.id, { last_login: new Date() } );
                setAuthCookies(response, token, user.id, tokenDate, options);
                response.status(302)
                        .location('/')
                        .send();
            });
        });
    });

    /*
     * Change user preferences
     */
    server.post('/users/:id/preferences', authentication, function (request, response) {
        if (request.params.id !== request.user.id) { return response.send(401); }
        var username = request.user.email,
            password = request.body.password;
        if (!username || !password) { return response.send(401); }
        auth.validateCredentials(username, password, function (err, result) {
            if (!result.success) { return response.send(401); }
            models.user.update(request.user.id, request.body, function (err) {
                if (err) { return response.send(400, err.message); }
                response.send(204);
            });
        });
    });

    /*
     * Register user
     */
    server.post('/register', function (request, response) {
        models.user.create(request.body, function (err, user) {
            if (err) { return response.send(400, err.message); }
            var token = [ user.email, user.confirmation ].join(':');
            while ((token.length % 3) !== 0) { token += ' '; }
            var activationURL = url.format({
                protocol: 'http',
                host:     request.headers.host,
                pathname: [ 'activate', new Buffer(token).toString('base64') ].join('/')
            });
            mail.sendActivationMail(user, activationURL, function (err, status) {
                util.log('auth: account created for ' + user.id);
                if (err) {
                    console.error('Error sending activation mail.');
                    console.trace(err);
                    return response.send(500, err.message);
                }
                response.send(204);
            });
        });
    });

    /*
     * Reset password
     */
    server.post('/reset', function (request, response) {
        models.user.reset(request.body, function (err, user) {
            if (err) { return response.send(400, err.message); }
            response.status(302)
                    .location('/')
                    .send();
        });
    });

    /*
     * Request a password reset link
     */
    server.post('/request', function (request, response) {
        if (!request.body.email) { return response.send(400); }
        var email = request.body.email;
        models.user.find({ email: email }, {}, function (err, users) {
            if (err || !users.length) { return response.send(400, 'email address not found'); }
            var user = users.shift();
            crypto.randomBytes(8, function (err, bytes) {
                bytes = bytes.toString('hex');
                models.user.update(user.id, { code: bytes }, function (err) {
                    var resetURL = url.format({
                        protocol: 'http',
                        host:     request.headers.host,
                        hash:     [ '#!', 'reset', bytes ].join('/')
                    });
                    mail.sendResetMail(user, resetURL, function (err) {
                        response.send(204);
                    });
                });
            });
        });
    });

    /*
     * Log in
     */
    server.post('/login', function (request, response) {
        var username = request.body.id,
            password = request.body.password;
        if (!username || !password) { return response.send(401); }
        auth.validateCredentials(username, password, function (err, result) {
            if (err || !result.success) { return response.send(401, result.reason); }
            util.log('auth: user ' + result.user.id + ' authenticated via login');
            models.user.update(result.user.id, { last_login: new Date() } );
            setAuthCookies(response, result.token, result.user.id, result.date, options);
            response.send(200, result.user);
        });
    });
};
