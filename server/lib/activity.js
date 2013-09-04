var step = require('step'),
    Base = require('./base').Base;

var Activity = exports.Activity = function (database, questionModel) {
    Base.call(this, database);
    this._collectionName = 'activity';
    this._entityName     = 'Activity';
    this._questionModel  = questionModel;
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

Activity.prototype.vote = function (questionID, userID, direction, cb) {
    var self = this;
    Base.prototype.findAndModify.call(
        this,
        { type: 'Vote', about: questionID, creator: userID },
        {},
        { $set: {
            type: 'Vote',
            about: questionID,
            creator: userID,
            dir: direction,
            created: new Date() } },
        { upsert: true },
        function (err, previousDocument) {
            if (err) { return cb(err); }
            var increment = (direction === 'up') ? 1 : -1;
            if (previousDocument.dir) {
                increment -= (previousDocument.dir === 'up') ? 1 : -1;
            }
            self._questionModel.findAndModify(
                { id: questionID },
                {},
                { $inc: { rank: increment } },
                { 'new': true },
                function (err, question) {
                    if (err) { return cb(err); }
                    cb(null, question.rank);
                }
            );
        }
    );
};

Activity.prototype.comment = function (aboutID, creatorID, content, replyTo, cb) {
    if (typeof cb === 'undefined') {
        cb      = replyTo;
        replyTo = null;
    }

    var comment = {
        type:        'Comment',
        creator:     creatorID,
        about:       aboutID,
        content:     content,
        reply_count: 0,
        created:     new Date()
    };
    if (replyTo) { comment.reply_to = replyTo; }

    var self = this;
    Base.prototype.create.call(self, comment, function (err, id) {
        if (err) { return cb(err); }
        var countModel, idSpec, incSpec;
        if (replyTo) {
            countModel = self;
            idSpec     = replyTo;
            incSpec    = { reply_count: 1 };
        } else {
            countModel = self._questionModel;
            idSpec     = aboutID;
            incSpec    = { comment_count: 1 };
        }
        countModel.findAndModify(
            { id: idSpec },
            {},
            { $inc: incSpec },
            { 'new': true },
            function (err, oldDoc) {
                if (err) { return cb(err); }
                Base.prototype.load.call(self, id, cb);
            }
        );
    });
};

Activity.prototype.follow = function (followeeID, followeeType, followerID, cb) {
    var update = {
        type: 'Follow',
        about: followeeID,
        about_type: followeeType,
        creator: followerID,
        created: new Date() };
    this._collection(this._collectionName, function (err, coll) {
        coll.update({ type: 'Follow', about: followeeID, creator: followerID },
                    { $set: update },
                    { upsert: true },
                    cb);
    });
};

Activity.prototype.unfollow = function (followeeID, followerID, cb) {
    this._collection(this._collectionName, function (err, coll) {
        coll.remove({ type: 'Follow', about: followeeID, creator: followerID }, cb);
    });
};
