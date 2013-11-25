var fs   = require('fs'),
    url  = require('url'),
    path = require('path'),
    util = require('util'),
    Mail = require('./mail').Mail;

var routes = exports.createRoutes = function (server) {
    var models         = server.get('models'),
        authentication = server.get('authentication'),
        pagination     = server.get('pagination'),
        config         = server.get('config');

    var mail = new Mail(config.notifications);

    server.get('/activities', [ authentication, pagination ], function (request, response) {
        models.activity.cursor({}, { sort: { created: -1 } }, function (err, cursor) {
            if (err) { throw err; }
            cursor.count(function (err, count) {
                if (err) { throw err; }
                response.set('X-Result-Size', count);
                cursor.limit(request.limit).skip(request.offset).toArray(function (err, res) {
                    if (err) { return cb(err); }
                    response.send(res);
                });
            });
        });
    });

    server.get('/comments', authentication, function (request, response) {
        models.activity.find({ type: 'Comment' }, {}, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    server.get('/comments/:id', authentication, function (request, response) {
        models.activity.load(request.params.id, function (err, doc) {
            if (err) { throw err; }
            else if (!doc) { response.send(404); }
            else { response.send(doc); }
        });
    });

    /*
     * Get replies for a comment
     */
    server.get('/comments/:id/replies', authentication, function (request, response) {
        var query = { type: 'Comment', reply_of: request.params.id };
        models.activity.find(query, { sort: { created: -1 } }, function (err, doc) {
            if (err) { throw err; }
            else if (!doc) { response.send(404); }
            else { response.send(doc); }
        });
    });

    /*
     * Reply to a comment
     */
    server.post('/comments/:id/replies', authentication, function (request, response) {
        models.activity.load(request.params.id, function (err, comment) {
            if (err) { return response.send(404); }
            models.activity.comment(comment.about,
                                    request.user.id,
                                    request.body.content,
                                    request.params.id,
                                    function (err, comment) {
                if (err) { return response.send(500); }
                response.send(201, comment);
            });
        });
    });

    server.get('/users', [ authentication, pagination ], function (request, response) {
        var options = { fields: { id: 1, first_name: 1, last_name: 1 }, sort: { created: -1  } };
        models.user.find({ confirmation: true }, options, function (err, users) {
            if (err) { throw err; }
            response.send(users);
        });
    });

    /*
     * Get user with id
     */
    server.get('/users/:id', authentication, function (request, response) {
        models.user.load(request.params.id, function (err, doc) {
            if (!doc) { response.send(404); }
            else { response.send(doc); }
        });
    });

    /*
     * Get a user's activity
     */
    server.get('/users/:id/activities', [ authentication, pagination ], function (request, response) {
        var query = { creator: request.params.id };
        models.activity.cursor(query, { sort: { created: -1 } }, function (err, cursor) {
            if (err) { throw err; }
            cursor.count(function (err, count) {
                if (err) { throw err; }
                response.set('X-Result-Size', count);
                cursor.limit(request.limit).skip(request.offset).toArray(function (err, res) {
                    if (err) { return cb(err); }
                    response.send(res);
                });
            });
        });
    });

    /*
     * Get comments a user made
     */
    server.get('/users/:id/comments', authentication, function (request, response) {
        var query = { type: 'Comment', creator: request.params.id };
        models.activity.find(query, {}, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    /*
     * What a user follows
     */
    server.get('/users/:id/following', [ authentication, pagination ], function (request, response) {
        var query = { type: 'Follow', creator: request.params.id };
        models.activity.cursor(query, { sort: { created: -1 } }, function (err, cursor) {
            if (err) { throw err; }
            cursor.count(function (err, count) {
                if (err) { throw err; }
                response.set('X-Result-Size', count);
                cursor.limit(request.limit).skip(request.offset).toArray(function (err, res) {
                    if (err) { return cb(err); }
                    response.send(res);
                });
            });
        });
    });

    /*
     * A user's followers
     */
    server.get('/users/:id/followers', [ authentication, pagination ], function (request, response) {
        var query = { type: 'Follow', about: request.params.id };
        models.activity.cursor(query, { sort: { created: -1 } }, function (err, cursor) {
            if (err) { throw err; }
            cursor.count(function (err, count) {
                if (err) { throw err; }
                response.set('X-Result-Size', count);
                cursor.limit(request.limit).skip(request.offset).toArray(function (err, res) {
                    if (err) { return cb(err); }
                    response.send(res);
                });
            });
        });
    });

    /*
     * Activities of things a user follows
     */
    server.get('/users/:id/home', [ authentication, pagination ], function (request, response) {
        var query   = { type: 'Follow', creator: request.params.id },
            options = { fields: [ 'about', 'about_type' ], sort: { created: -1 } };

        models.activity.find(query, options, function (err, res) {
            if (err) { throw err; }
            var uniqueUserIDs = {},
                uniqueQuestionIDs = {};
            res.forEach(function (follow) {
                if (follow.about_type === 'User') {
                    uniqueUserIDs[follow.about] = true;
                } else if (follow.about_type === 'Question') {
                    uniqueQuestionIDs[follow.about] = true;
                }
            });

            /*
             * Activities obout questions the user follows but not created by her or
             * activities created by users she follows.
             */
            var query2 = { $or: [ { about: { $in: Object.keys(uniqueQuestionIDs) },
                                    creator: { $ne: request.params.id } },
                                  { creator: { $in: Object.keys(uniqueUserIDs) } } ] };
            models.activity.cursor(query2, { sort: { created: -1 } }, function (err, cursor) {
                if (err) { throw err; }
                cursor.count(function (err, count) {
                    if (err) { throw err; }
                    response.set('X-Result-Size', count);
                    cursor.limit(request.limit).skip(request.offset).toArray(function (err, res) {
                        if (err) { return cb(err); }
                        response.send(res);
                    });
                });
            });
        });
    });

    /*
     * Follow a user
     */
    server.post('/users/:id/followers', authentication, function (request, response) {
        var followeeID = request.params.id;
        models.activity.follow(followeeID, 'User', request.user.id, function (err) {
            if (err) { return response.send(400); }
            models.user.load(followeeID, function (err, followee) {
                response.send(201);
                if (followee.notifications) {
                    var actionURL = url.format({
                        protocol: 'http',
                        host:     request.headers.host
                    });
                    mail.sendFollowerNotification(followee, request.user, actionURL);
                }
            });
        });
    });

    /*
     * Get a user's preferences
     */
    server.get('/users/:id/preferences', authentication, function (request, response) {
        if (request.params.id !== request.user.id) { return response.send(401); }
        models.user.details(request.user.id, function (err, user) {
            if (err || !user) { return response.send(404); }
            response.send(user);
        });
    });

    /*
     * Unfollow a question
     */
    server.delete('/users/:uid/followers/:fid', authentication, function (request, response) {
        if (request.params.fid !== request.user.id) {
            return response.send(403, 'Cannot follow yourself');
        }
        models.activity.unfollow(request.params.uid, request.params.fid, function (err) {
            if (err) { return response.send(404); }
            response.send(204);
        });
    });

    /*
     * Get all messages for a user
     */
    server.get('/messages', [ authentication, pagination ], function (request, response) {
        models.message.all(request.user.id, function (err, res) {
            if (err) { return response.send(400); }
            response.send(res);
        });
    });

    /*
     * Get all received messages for a user
     */
    server.get('/messages/in', [ authentication, pagination ], function (request, response) {
        models.message.cursor({ to: request.user.id }, { sort: { created: -1 } }, function (err, cursor) {
            if (err) { throw err; }
            cursor.count(function (err, count) {
                if (err) { throw err; }
                response.set('X-Result-Size', count);
                cursor.limit(request.limit).skip(request.offset).toArray(function (err, res) {
                    if (err) { return cb(err); }
                    response.send(res);
                });
            });
        });
    });

    /*
     * Get all messages sent by a user
     */
    server.get('/messages/out', [ authentication, pagination ], function (request, response) {
        models.message.cursor({ creator: request.user.id }, { sort: { created: -1 } }, function (err, cursor) {
            if (err) { throw err; }
            cursor.count(function (err, count) {
                if (err) { throw err; }
                response.set('X-Result-Size', count);
                cursor.limit(request.limit).skip(request.offset).toArray(function (err, res) {
                    if (err) { return cb(err); }
                    response.send(res);
                });
            });
        });
    });

    /*
     * Get messages to and from a user
     */
    server.get('/messages/user/:id', authentication, function (request, response) {
        models.message.find(request.user.id, request.params.id, function (err, res) {
            if (err) { return response.send(400); }
            response.send(res);
        });
    });

    /*
     * Send a message to a user
     */
    server.post('/messages', authentication, function (request, response) {
        if (request.user.id !== request.body.creator) {
            return response.send(400);
        }
        models.message.create(request.body, function (err) {
            if (err) { return response.send(400, err.message); }
            models.user.load(request.body.to, function (err, receipient) {
                response.send(201);
                if (receipient.notifications) {
                    var actionURL = url.format({
                        protocol: 'http',
                        host:     request.headers.host
                    });
                    mail.sendMessageNotification(receipient, request.user, actionURL);
                }
            });
        });
    });

    /*
     * Get questions
     */
    server.get('/questions', [ authentication, pagination ], function (request, response) {
        var sort = request.param('sort') || 'created',
            sortOptions = {};
        sortOptions[sort] = -1;
        models.question.cursor({}, { sort: sortOptions }, function (err, cursor) {
            if (err) { throw err; }
            cursor.count(function (err, count) {
                if (err) { throw err; }
                response.set('X-Result-Size', count);
                cursor.limit(request.limit).skip(request.offset).toArray(function (err, res) {
                    if (err) { return cb(err); }
                    response.send(res);
                });
            });
        });
    });

    /*
     * Get question with id
     */
    server.get('/questions/:id', authentication, function (request, response) {
        models.question.load(request.params.id, function (err, doc) {
            if (err) { throw err; }
            if (!doc) { return response.send(404); }
            response.send(doc);
        });
    });

    /*
     * Get commments for question with id
     */
    server.get('/questions/:id/comments', authentication, function (request, response) {
        var query = { type: 'Comment', about: request.params.id, reply_of: null };
        models.activity.find(query, { sort: { created: -1 } }, function (err, res) {
            if (err) { throw err; }
            response.send(res);
        });
    });

    /*
     * A question's followers
     */
    server.get('/questions/:id/followers', authentication, function (request, response) {
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
    server.post('/questions/:id/followers', authentication, function (request, response) {
        models.activity.follow(request.params.id, 'Question', request.user.id, function (err) {
            if (err) { return response.send(400); }
            response.send(201);
        });
    });

    /*
     * Unfollow a question
     */
    server.delete('/questions/:qid/followers/:fid', authentication, function (request, response) {
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
    server.post('/questions/:id/comments', authentication, function (request, response) {
        models.activity.comment(request.params.id, request.user.id, request.body.content, function (err, comment) {
            if (err) { return response.send(500); }
            response.send(201, comment);
        });
    });

    /*
     * Place a vote for question with id
     */
    server.post('/questions/:id/votes', authentication, function (request, response) {
        models.activity.vote(request.params.id, request.user.id, request.body.dir, function (err) {
            if (err) { throw err; }
            models.activity.rank(request.params.id, function (err, rank) {
                if (err) { throw err; }
                response.send({ rank: rank });
            });
        });
    });

    server.post('/updateQuestion', function (request, response) {
        if (!request.body || !request.body.secret || !request.body.id || !request.body.data) {
            util.log('rejecting question update (invalid request)');
            return response.send(400);
        }
        if (!config.sharing || !config.sharing.enabled) {
            util.log('questions: rejecting question update (sharing disabled)');
            return response.send(204);
        }

        if (config.sharing.secret && (config.sharing.secret === request.body.secret)) {
            models.question.import(request.body.id, request.body.data, function (err) {
                if (err) { return response.send(404); }
                var activity = {
                    type:       'Update',
                    about:      request.body.id,
                    about_type: 'Question',
                    created:    new Date()
                };
                models.activity.create(activity, function (err) {
                    if (err) { return response.send(500); }
                    util.log('questions: imported question update (' + request.body.id + ')');
                    response.send(204);
                    models.activity.followers(request.body.id, function (err, followers) {
                        models.user.find(
                            { id: { '$in': followers } },
                            { fields: { first_name: true, email: true } },
                            function (err, users) {
                                var actionURL = url.format({
                                    protocol: 'http',
                                    host:     request.headers.host
                                });
                                users.forEach(function (u) {
                                    mail.sendQuestionUpdateNotification(u, actionURL);
                                });
                            }
                        );
                    });
                });
            });
        } else {
            util.log('questions: rejecting question update (secret does not match)');
            response.send(401);
        }
    });
};
