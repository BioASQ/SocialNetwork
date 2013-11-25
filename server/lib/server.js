var path    = require('path'),
    util    = require('util'),
    crypto  = require('crypto'),
    mongodb = require('mongodb'),
    express = require('express');

const kAuthCookieKey       = '_auth',
      kUserIDCookieKey     = 'uid',
      kExpirationCookieKey = 'exp';

// models
var User     = require('./user').User,
    Question = require('./question').Question,
    Message  = require('./message').Message,
    Activity = require('./activity').Activity,
    Login    = require('./login').Login;

var Auth = require('./auth').Auth;

exports.createServer = function (config, database, cb) {
    var server = express();

    var appPath = path.normalize(path.join(__dirname, '..', '..', 'app'));
    server.use(express.static(appPath))
          .use(express.bodyParser())
          .use(express.cookieParser());
          /*
           * .use(function(err, req, res, next) {
           *     console.error(err.stack);
           *     res.send(500, 'Something broke!');
           * });
           */

    var user     = new User(database, { useRegistrationCode: true }),
        question = new Question(database);
    server.set('models', {
        user:     user,
        message:  new Message(database),
        activity: new Activity(database, question),
        question: question
    });
    server.set('config', config);

    var auth = new Auth(user, config.session.key, config.session.timeout * 60000); // in milliseconds
    util.log('auth: using session key ' + config.session.key);

    user.setAuth(auth);

    // authentication middleware
    server.set('authentication', function (request, response, next) {
        var authCookie = request.cookies[kAuthCookieKey];
        if (!authCookie) { return response.send(401); }
        auth.validateToken(authCookie, function (err, result) {
            if (err || !result.success) { return response.send(401); }
            request.user = result.user;
            // override express' auth getter definition
            request.__defineGetter__('auth', function () { return result; });
            next();
        });
    });

    server.set('pagination', function (request, response, next) {
        var limit  = parseInt(request.param('limit'), 10),
            offset = parseInt(request.param('offset'), 10);
        request.limit  = limit || 10;
        request.offset = offset || 0;
        next();
    });

    require('./secure').createSecureRoutes(server, auth, {
        authCookieKey:       kAuthCookieKey,
        userIDCookieKey:     kUserIDCookieKey,
        expirationCookieKey: kExpirationCookieKey,
        maxTokenAge:         config.session.timeout * 60000 // in milliseconds
    });
    require('./routes').createRoutes(server);

    server.listen(config.server.port);

    cb(null, server);
};

exports.start = function (config, cb) {
    var dbServer = new mongodb.Server(config.database.host, config.database.port, {}),
        dbConn   = new mongodb.Db(config.database.name, dbServer, { safe: false });

    dbConn.open(function (err, database) {
        if (err) { return cb(Error('Error connecting to database.')); }

        if (config.session.key) {
            exports.createServer(config, database, cb);
        } else {
            crypto.randomBytes(32, function (err, randomBytes) {
                config.session.key = randomBytes.toString('hex');
                exports.createServer(config, database, cb);
            });
        }
    });
};
