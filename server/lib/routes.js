var fs   = require('fs'),
    path = require('path');

var routes = exports.createRoutes = function (server) {
    var models = server.get('models'),
        middleware = server.get('middleware');

    server.get('/login', middleware, function (request, response) {
        response.send(request.user);
    });

    server.get('/activities', middleware, function (request, response) {
        models.activity.find({}, { sort: { created: -1 } }, request.user, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    server.get('/comments', function (request, response) {
        models.activity.find({ type: 'Comment' }, {}, request.user, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    server.get('/comments/:id', middleware, function (request, response) {
        models.activity.load(request.params.id, request.user, function (err, doc) {
            if (err) { throw err; }
            else if (!doc) { response.send(404); }
            else { response.send(doc); }
        });
    });

    /*
     * Get replies for a comment
     */
    server.get('/comments/:id/replies', function (request, response) {
        var query = { type: 'Comment', about: request.params.id };
        models.activity.find(query, request.user, function (err, doc) {
            if (err) { throw err; }
            else if (!doc) { response.send(404); }
            else { response.send(doc); }
        });
    });

    /*
     * Replies to a comment
     */
    server.post('/comments/:id/replies', function (request, response) {
    });

    /*
     * Get user with id
     */
    server.get('/users/:id', middleware, function (request, response) {
        models.user.load(request.params.id, request.user, function (err, doc) {
            if (!doc) { response.send(404); }
            else { response.send(doc); }
        });
    });

    /*
     * Get comments a user made
     */
    server.get('/users/:id/authored', middleware, function (request, response) {
        var query = { type: 'Comment', creator: request.params.id };
        models.activity.find(query, {}, request.user, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    /*
     * Get comments sent to a user
     */
    server.get('/users/:id/comments', middleware, function (request, response) {
        var query = { type: 'Comment', about: request.params.id };
        models.activity.find(query, {}, request.user, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    /*
     * What a user follows
     */
    server.get('/users/:id/following', middleware, function (request, response) {
        var query = { type: 'Follow', creator: request.params.id };
        models.activity.find(query, {}, request.user, function (err, res) {
            if (err) {
                return response.send(404);
            }
            response.send(res);
        });
    });

    /*
     * A user's followers
     */
    server.get('/users/:id/followers', middleware, function (request, response) {
        var query = { type: 'Follow', about: request.params.id };
        models.activity.find(query, {}, request.user, function (err, res) {
            if (err) { return response.send(404); }
            response.send(res);
        });
    });

    /*
     * Send a message to a user
     */
    server.post('/users/:id/comments', function (request, response) {
    });

    /*
     * Get questions
     */
    server.get('/questions', middleware, function (request, response) {
        models.question.find({}, {}, request.user, function (err, res) {
            if (err) { console.error(err); throw err; }
            response.send(res);
        });
    });

    /*
     * Get question with id
     */
    server.get('/questions/:id', middleware, function (request, response) {
        models.question.load(request.params.id, request.user, function (err, doc) {
            if (err) { throw err; }
            if (!doc) { return response.send(404); }
            response.send(doc);
        });
    });

    /*
     * Get commments for question with id
     */
    server.get('/questions/:id/comments', function (request, response) {
        var query = { type: 'Comment', about: request.params.id };
        models.activity.find(query, {}, request.user, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    /*
     * A question's followers
     */
    server.get('/questions/:id/followers', function (request, response) {
        var query = { type: 'Follow', about: request.params.id };
        models.activity.find(query, {}, request.user, function (err, res) {
            if (err) {
                return response.send(404);
            }
            response.send(res);
        });
    });

    /*
     * Post a comment on a question
     */
    server.post('/questions/:id/comments', function (request, response) {
    });

    /*
     * Place a vote for question with id
     */
    server.post('/questions/:id/votes', middleware, function (request, response) {
        models.activity.vote(request.params.id, request.user.id, request.param('dir'), function (err) {
            if (err) { throw err; }
            models.activity.rank(request.params.id, function (err, rank) {
                if (err) { throw err; }
                response.send({ rank: rank });
            });
        });
    });
};
