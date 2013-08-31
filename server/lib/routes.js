var fs   = require('fs'),
    path = require('path');

var routes = exports.createRoutes = function (server) {
    var models = server.get('models'),
        middleware = server.get('middleware');

    server.get('/login', middleware, function (request, response) {
        response.send(request.user);
    });

    server.get('/activities', middleware, function (request, response) {
        models.activity.find({}, { sort: { created: -1 } }, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    server.get('/comments', function (request, response) {
        models.activity.find({ type: 'Comment' }, {}, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    server.get('/comments/:id', middleware, function (request, response) {
        models.activity.load(request.params.id, function (err, doc) {
            if (err) { throw err; }
            else if (!doc) { response.send(404); }
            else { response.send(doc); }
        });
    });

    /*
     * Get replies for a comment
     */
    server.get('/comments/:id/replies', function (request, response) {
        var query = { type: 'Comment', reply_to: request.params.id };
        models.activity.find(query, { sort: { created: -1 } }, function (err, doc) {
            if (err) { throw err; }
            else if (!doc) { response.send(404); }
            else { response.send(doc); }
        });
    });

    /*
     * Reply to a comment
     */
    server.post('/comments/:id/replies', function (request, response) {
        models.activity.load(request.params.id, function (err, comment) {
            if (err) { return response.send(404); }
            models.activity.reply(comment.about,
                                  request.user.id,
                                  request.params('content'),
                                  request.params.id,
                                  function (err, id) {
                if (err) { return response.send(400); }
                response.send(201);
            });
        });
    });

    /*
     * Get user with id
     */
    server.get('/users/:id', middleware, function (request, response) {
        models.user.load(request.params.id, function (err, doc) {
            if (!doc) { response.send(404); }
            else { response.send(doc); }
        });
    });

    /*
     * Get a user's activity
     */
    server.get('/users/:id/activities', middleware, function (request, response) {
        var query = { creator: request.params.id };
        models.activity.find(query, { sort: { created: -1 } }, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    /*
     * Get comments a user made
     */
    server.get('/users/:id/comments', middleware, function (request, response) {
        var query = { type: 'Comment', creator: request.params.id };
        models.activity.find(query, {}, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    /*
     * What a user follows
     */
    server.get('/users/:id/following', middleware, function (request, response) {
        var query = { type: 'Follow', creator: request.params.id };
        models.activity.find(query, {}, function (err, res) {
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
        models.activity.find(query, {}, function (err, res) {
            if (err) { return response.send(404); }
            response.send(res);
        });
    });

    /*
     * Follow a user
     */
    server.post('/users/:id/followers', middleware, function (request, response) {
        models.activity.follow(request.params.id, 'User', request.user.id, function (err) {
            if (err) { return response.send(400); }
            response.send(201);
        });
    });

    /*
     * Unfollow a question
     */
    server.delete('/users/:uid/followers/:fid', middleware, function (request, response) {
        if (request.params.fid !== request.user.id) {
            return response.send(403);
        }
        models.activity.unfollow(request.params.uid, request.params.fid, function (err) {
            if (err) { return response.send(404); }
            response.send(204);
        });
    });

    /*
     * Get all messages for a user
     */
    server.get('/messages', middleware, function (request, response) {
        models.message.all(request.user.id, function (err, res) {
            if (err) { return response.send(400); }
            response.send(res);
        });
    });

    /*
     * Get all received messages for a user
     */
    server.get('/messages/in', middleware, function (request, response) {
        models.message.find({ to: request.user.id }, { sort: { created: -1 } }, function (err, res) {
            if (err) { return response.send(400); }
            response.send(res);
        });
    });

    /*
     * Get all messages sent by a user
     */
    server.get('/messages/out', middleware, function (request, response) {
        models.message.find({ creator: request.user.id }, { sort: { created: -1 } }, function (err, res) {
            if (err) { return response.send(400); }
            response.send(res);
        });
    });

    /*
     * Get messages to and from a user
     */
    server.get('/messages/user/:id', middleware, function (request, response) {
        models.message.find(request.user.id, request.params.id, function (err, res) {
            if (err) { return response.send(400); }
            response.send(res);
        });
    });

    /*
     * Send a message to a user
     */
    server.post('/messages', middleware, function (request, response) {
        if (request.user.id != request.body.creator) {
            return response.send(400);
        }
        models.message.create(request.body, function (err) {
            if (err) { return response.send(500); }
            response.send(204);
        });
    });

    /*
     * Get questions
     */
    server.get('/questions', middleware, function (request, response) {
        models.question.find({}, { sort: { created: -1 } }, function (err, res) {
            if (err) { console.error(err); throw err; }
            response.send(res);
        });
    });

    /*
     * Get question with id
     */
    server.get('/questions/:id', middleware, function (request, response) {
        models.question.load(request.params.id, function (err, doc) {
            if (err) { throw err; }
            if (!doc) { return response.send(404); }
            response.send(doc);
        });
    });

    /*
     * Get commments for question with id
     */
    server.get('/questions/:id/comments', function (request, response) {
        var query = { type: 'Comment', about: request.params.id, reply_to: null };
        models.activity.find(query, { sort: { created: -1 } }, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    /*
     * A question's followers
     */
    server.get('/questions/:id/followers', function (request, response) {
        var query = { type: 'Follow', about: request.params.id };
        models.activity.find(query, {}, function (err, res) {
            if (err) {
                return response.send(404);
            }
            response.send(res);
        });
    });

    /*
     * Follow a question
     */
    server.post('/questions/:id/followers', middleware, function (request, response) {
        models.activity.follow(request.params.id, 'Question', request.user.id, function (err) {
            if (err) { return response.send(400); }
            response.send(201);
        });
    });

    /*
     * Unfollow a question
     */
    server.delete('/questions/:qid/followers/:fid', middleware, function (request, response) {
        if (request.params.fid !== request.user.id) {
            return response.send(403);
        }
        models.activity.unfollow(request.params.qid, request.params.fid, function (err) {
            if (err) { return response.send(404); }
            response.send(204);
        });
    });

    /*
     * Post a comment on a question
     */
    server.post('/questions/:id/comments', middleware, function (request, response) {
        models.activity.comment(request.params.id, request.user.id, request.params('content'), function (err) {
            if (err) { return response.send(400); }
            response.send(201);
        });
    });

    /*
     * Place a vote for question with id
     */
    server.post('/questions/:id/votes', middleware, function (request, response) {
        models.activity.vote(request.params.id, request.user.id, request.body.dir, function (err) {
            if (err) { throw err; }
            models.activity.rank(request.params.id, function (err, rank) {
                if (err) { throw err; }
                response.send({ rank: rank });
            });
        });
    });
};
