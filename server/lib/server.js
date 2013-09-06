var path    = require('path'),
    mongodb = require('mongodb'),
    express = require('express');

// models
var User     = require('./user').User,
    Question = require('./question').Question,
    Message  = require('./message').Message,
    Activity = require('./activity').Activity,
    Login    = require('./login').Login;

var Auth = require('./auth').Auth;

const kAuthCookieKey = '_auth';

exports.createServer = function (port, database, cb) {
    var server = express();

    var appPath = path.normalize(path.join(__dirname, '..', '..', 'app'));
    server.use(express.static(appPath))
          .use(express.bodyParser())
          .use(express.cookieParser())
          .use(function(err, req, res, next) {
              console.error(err.stack);
              res.send(500, 'Something broke!');
          });

    var question = new Question(database),
        user = new User(database);
    server.set('models', {
        user:     user,
        message:  new Message(database),
        activity: new Activity(database, question),
        question: question
    });

    var auth = new Auth(user, new Login(database));

    // authentication middleware
    server.set('authenticate', function (request, response, next) {
        var authCookie = request.cookies[kAuthCookieKey];
        if (!authCookie) { return response.send(401); }
        auth.validateToken(authCookie, function (err, result) {
            if (err || !result.success) { return response.send(401); }
            console.log('user ' + result.user.id + ' authenticated via token');
            request.user = result.user;
            next();
        });
    });

    // login route
    server.post('/login', function (request, response) {
        var username = request.body.id,
            password = request.body.password;
        console.log(username);
        console.log(password);
        auth.validateCredentials(username, password, function (err, result) {
            if (err || !result.success) { return response.send(401); }
            console.log('user ' + result.user.id + ' authenticated login');
            response.cookie(kAuthCookieKey, result.token);
            response.send(result.user);
        });
    });

    // logout route
    server.get('/logout', function (request, response) {
        var authCookie = request.cookies[kAuthCookieKey];
        if (!authCookie) { return response.send(204); }
        auth.invalidateToken(authCookie, function (err) {
            response.clearCookie(kAuthCookieKey);
            response.send(204);
        });
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
