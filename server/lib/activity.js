var step = require('step'),
    Base = require('./base').Base;

var Activity = exports.Activity = function (database) {
    Base.call(this, database);
    this._collectionName = 'activity';
    this._entityName     = 'Activity';
};

Activity.prototype = Object.create(Base.prototype);

Activity.prototype.rank = function (questionID, cb) {
    Base.prototype.find.call(this, { type: 'Vote', about: questionID }, {}, function (err, votes) {
        if (err) { return cb(err); }
        cb(null, votes.reduce(function (rank, vote) {
            if (vote.dir === 'up') { return (rank + 1); }
            else if (vote.dir === 'down') { return (rank - 1); }
            else { return rank; }
        }, 0));
    });
};

Activity.prototype.find = function (query, options, cb) {
    var self = this;
    Base.prototype.find.call(this, query, options, function (err, res) {
        if (err) { return cb(err); }
        step(
            function () {
                var docGroup  = this.group();
                res.forEach(function (doc) {
                    var docCallback = docGroup();
                    if (doc.type === 'Comment') {
                        self.replyCount(doc.id, function (err, count) {
                            if (err) { return docCallback(err); }
                            doc.reply_count = count;
                            docCallback(null, doc);
                        });
                    } else {
                        docCallback(null, doc);
                    }
                });
            },
            function (err, docs) {
                if (err) { return cb(err); }
                cb(null, docs);
            }
        );
    });
};

Activity.prototype.commentCount = function (questionID, cb) {
    // top-level comments about questionID
    var query = { type: 'Comment', about: questionID, reply_to: null };
    this._collection(this._collectionName, function (err, coll) {
        if (err) { return cb(err); }
        coll.find(query).count(cb);
    });
};

Activity.prototype.replyCount = function (commentID, cb) {
    var query = { type: 'Comment', reply_to: commentID };
    this._collection(this._collectionName, function (err, coll) {
        if (err) { return cb(err); }
        coll.find(query).count(cb);
    });
};

Activity.prototype.vote = function (questionID, userID, direction, cb) {
    var self = this;
    this._collection(this._collectionName, function (err, coll) {
        coll.update({ type: 'Vote', about: questionID, creator: userID },
                    { $set: { type: 'Vote', about: questionID, creator: userID, dir: direction, created: new Date() } },
                    { upsert: true },
                    function (err) {
                        if (err) { return cb(err); }
                        self.rank(questionID, function (err, rank) {
                            if (err) { return cb(err); }
                            cb(null, rank);
                        });
                    });
    });
};

Activity.prototype.comment = function (aboutID, creatorID, content, replyTo, cb) {
    if (typeof cb === 'undefined') {
        cb      = replyTo;
        replyTo = null;
    }

    var comment = {
        creator:  creatorID,
        about:    aboutID,
        content:  content,
        reply_to: replyTo,
        created:  new Date()
    };
    Base.prototype.create.call(this, comment, function (err, id) {
        if (err) { return cb(err); }
        cb(null, id);
    });
};

Activity.prototype.follow = function (followeeID, followerID, cb) {
    this._collection(this._collectionName, function (err, coll) {
        coll.update({ type: 'Follow', about: followeeID, creator: followerID },
                    { $set: { type: 'Follow', about: followeeID, creator: followerID, created: new Date() } },
                    { upsert: true },
                    cb);
    });
};
