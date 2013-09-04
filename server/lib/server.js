var path    = require('path'),
    mongodb = require('mongodb'),
    express = require('express');

var User     = require('./user').User,
    Question = require('./question').Question,
    Message  = require('./message').Message,
    Activity = require('./activity').Activity;

exports.createServer = function (port, models, middleware) {
    var server = express();

    var appPath = path.normalize(path.join(__dirname, '..', '..', 'app'));
    server.use(express.static(appPath))
          .use(express.bodyParser())
          .use(function(err, req, res, next) {
              console.error(err.stack);
              res.send(500, 'Something broke!');
          });

    server.set('models', models);
    server.set('middleware', middleware);

    require('./routes').createRoutes(server);

    server.listen(port);

    return server;
};

exports.start = function (options, cb) {
    var dbServer = new mongodb.Server(options.database.host, options.database.port, {}),
    dbConn = new mongodb.Db(options.database.name, dbServer, { safe: false });
    dbConn.open(function (err, database) {
        var questionModel = new Question(database);
        var models = {
            user:     new User(database),
            message:  new Message(database),
            activity: new Activity(database, questionModel),
            question: questionModel
        };

        /*
         * TODO: authentication
         */
        var loadUser = function (request, response, next) {
            models.user.load('u1', function (err, user) {
                request.user = user;
                next();
            });
        };

        if (err) { return cb(Error('Error connecting to database.')); }
        var server = exports.createServer(options.port, models, [ loadUser ]);
        cb(null, server);
    });
};
