var fs   = require('fs'),
    url  = require('url'),
    path = require('path'),
    util = require('util'),
    Mail = require('./mail').Mail;

var routes = exports.createRoutes = function (server) {
    var models            = server.get('models'),
        authentication    = server.get('authentication'),
        requireSeniorUser = server.get('requireSeniorUser'),
        requireAdminUser  = server.get('requireAdminUser'),
        pagination        = server.get('pagination'),
        config            = server.get('config');

    var mail = new Mail(config.notifications);

    var makeBlackList = function (user) {
        var bl = user.black_list || [];
        return bl.map(function (id) {
            return models.question.makeID(id);
        });
    };

    /*
     * params: name, email
     */
    server.post('/invite', authentication, requireSeniorUser, function (request, response) {
        if (!request.body.name || !request.body.email) {
            return response.send(400, 'missing parameters');
        }
        models.user.find({ $or: [{email: request.body.email}, {invited: request.body.email}]}, {}, function (err, res) {
            if (res.length) {
                return response.send(400, 'user already registered or invited');
            }

            models.user.invite(request.body.name, request.body.email, function (err, inviteCode) {
                if (err) {
                    console.log(err);
                    return response.send(500);
                }

                var URL = url.format({
                    protocol: 'http',
                    host:     request.headers.host,
                    hash:     '!/register'
                });
                mail.sendInvitationNotification(request.body.name,
                                                request.body.email,
                                                URL,
                                                inviteCode,
                                                URL + '/' + inviteCode);
                return response.send(201);
            });
        });
    });

    server.get('/activities', [ authentication, pagination ], function (request, response) {
        models.activity.cursor({ about: { $nin: makeBlackList(request.user) } }, { sort: { created: -1 } }, function (err, cursor) {
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
                                    function (err, reply) {
                if (err) { return response.send(500); }
                response.send(201, reply);

                // notify original comment author
                models.user.load(comment.creator, function (err, receipient) {
                    if (receipient.notifications) {
                        var actionURL = url.format({
                            protocol: 'http',
                            host:     request.headers.host
                        });
                        mail.sendCommentReplyNotification(receipient, request.user, actionURL);
                    }
                });
            });
        });
    });

    /*
     * Gets all sorted users
     */
    server.get('/users', [ authentication, pagination ], function (request, response) {
        var sort        = request.param('sort') || 'last_name',
            sortOptions = {},
            search      = request.param('search') || '';
        sortOptions[sort] = 1;
        var regexp = new RegExp('\\b(' + search + ')', 'gi');
        var options = { fields: { id: 1, first_name: 1, last_name: 1, roles: 1, img: 1 }, sort: sortOptions };
        var query = { confirmation: true, last_name: regexp};
        models.user.cursor(query, options, function (err, cursor){
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
     * Get user with id
     */
    server.get('/users/:id', authentication, function (request, response) {
        models.user.load(request.params.id, function (err, doc) {
            if (!doc) { response.send(404); }
            else { response.send(doc); }
        });
    });

    server.post('/users/:id', authentication, requireAdminUser, function (request, response) {
        models.user.update(request.params.id, request.body, function (err, res) {
            if (err) { return response.send(500); }
            response.send(201);
        });
    });

    /*
     * Get a user's activity
     */
    server.get('/users/:id/activities', [ authentication, pagination ], function (request, response) {
        var query = { creator: request.params.id, about: { $nin: makeBlackList(request.user) } };
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
        var query = { type: 'Follow', creator: request.params.id, about: { $nin: makeBlackList(request.user) } };
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
     * All votes a user has cast
     */
    server.get('/users/:id/votes', [ authentication ], function (request, response) {
        var query = { type: 'Vote', creator: request.params.id };
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
        var query   = { type: 'Follow', creator: request.params.id, about: { $nin: makeBlackList(request.user) } },
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

            // convert ID strings to real ID type
            var userID = models.user.makeID(request.params.id);
            uniqueQuestionIDs = Object.keys(uniqueQuestionIDs).map(function (stringID) {
                return models.question.makeID(stringID);
            });
            uniqueUserIDs = Object.keys(uniqueUserIDs).map(function (stringID) {
                return models.activity.makeID(stringID);
            });

            /*
             * Activities obout questions the user follows but not created by her or
             * activities created by users she follows.
             */
            var query2 = { $or: [
                // about questions user follows but has not created
                { about: { $in: uniqueQuestionIDs, $nin: makeBlackList(request.user) }, creator: { $ne: userID } },
                // about the user
                { about: userID },
                // created by other users he follows
                { creator: { $in: uniqueUserIDs } }
            ] };
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
        models.question.cursor({ _id: {$nin: makeBlackList(request.user) } }, { sort: sortOptions, fields: { creator: false } }, function (err, cursor) {
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

    server.get('/questions/search/:query', [ authentication, pagination ], function (request, response) {
        models.question.search(
            request.params.query,
            { fields: { creator: false }, filter: { _id: { $nin: makeBlackList(request.user) } } },
            function (err, res) {
                if (err) { throw err; }
                response.send(res);
            }
        );
    });

    /*
     * Get question with id
     */
    server.get('/questions/:id', authentication, function (request, response) {
        var blackList = makeBlackList(request.user);
        if (blackList.some(function (id) { return (String(id) === request.params.id); })) {
            return response.send(404);
        }
        models.question.load(request.params.id, { fields: { creator: false } }, function (err, doc) {
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

            // notify question author
            models.question.load(request.params.id, { fields: { creator: true } }, function (err, doc) {
                if (err) { return; }
                models.user.find({ email: doc.creator }, {}, function (err, usr) {
                    if (err) { return; }
                    if (usr.length) {
                        var user = usr[0];
                        if (user.notifications) {
                            var actionURL = url.format({
                                protocol: 'http',
                                host:     request.headers.host,
                                hash: [ '!/questions', String(doc.id) ].join('/')
                            });
                            mail.sendCommentNotification(user, actionURL);
                        }
                    }
                });
            });
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

    /*
     * Delete a previous vote
     */
    server.delete('/questions/:id/votes', authentication, function (request, response) {
        models.activity.unvote(request.params.id, request.user.id, function (err) {
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
            models.question.import(request.body.id, request.body.data, function (err, inserted) {
                if (err) { return response.send(404); }
                var activity = {
                    type:       inserted ? 'Import' : 'Update',
                    about:      request.body.id,
                    about_type: 'Question',
                    created:    new Date()
                };
                models.activity.create(activity, function (err) {
                    if (err) { return response.send(500); }
                    if (inserted) {
                        util.log('questions: new question imported (' + request.body.id + ')');
                    } else {
                        util.log('questions: imported question update (' + request.body.id + ')');
                    }
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
                                    if (u.notifications) {
                                        mail.sendQuestionUpdateNotification(u, actionURL);
                                    }
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
