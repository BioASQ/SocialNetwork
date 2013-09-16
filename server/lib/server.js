var path    = require('path'),
    util    = require('util'),
    mongodb = require('mongodb'),
    express = require('express');

const kAuthCookieKey     = '_auth',
      kRefreshCookieKey  = '_ret',
      kMaxTokenAge       = 7200000, // 120 min
      kRefreshDifference =   10000; //  10 sec

// models
var User     = require('./user').User,
    Question = require('./question').Question,
    Message  = require('./message').Message,
    Activity = require('./activity').Activity,
    Login    = require('./login').Login;

var Auth = require('./auth').Auth;

exports.createServer = function (port, database, cb) {
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

    var auth = new Auth(user, kMaxTokenAge);

    user.setAuth(auth);

    // authentication middleware
    server.set('authentication', function (request, response, next) {
        var authCookie = request.cookies[kAuthCookieKey];
        if (!authCookie) { return response.send(401); }
        auth.validateToken(authCookie, function (err, result) {
            if (err || !result.success) { return response.send(401); }
            response.cookie('uid', String(result.user.id), { maxAge: kRefreshDifference });
            request.user = result.user;
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
        authCookieKey:     kAuthCookieKey,
        refreshCookieKey:  kRefreshCookieKey,
        maxTokenAge:       kMaxTokenAge,
        refreshDifference: kRefreshDifference
    });
    require('./routes').createRoutes(server);

    server.listen(port);

    cb(null, server);
};

exports.start = function (options, cb) {
    var dbServer = new mongodb.Server(options.database.host, options.database.port, {}),
    dbConn = new mongodb.Db(options.database.name, dbServer, { safe: false });
    dbConn.open(function (err, database) {
        if (err) { return cb(Error('Error connecting to database.')); }
        var server = exports.createServer(options.port, database, cb);
    });
};
