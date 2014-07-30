var step = require('step'),
    Base = require('./base').Base;

var Activity = exports.Activity = function (database, questionModel) {
    Base.call(this, database);
    this._collectionName = 'activity';
    this._entityName     = 'Activity';
    this._questionModel  = questionModel;
};

Activity.prototype = Object.create(Base.prototype);

Activity.prototype.idProperties = function () {
    return [ 'creator', 'about', 'reply_of' ];
};

Activity.prototype.rank = function (id, cb) {
    var self = this;
    this.aggregate([
        { $match: { type: 'Vote', about: this.makeID(id) } },
        { $group: { _id: '$about', count: { $sum: { $cond: [ { $eq: [ '$dir', 'down' ] }, -1, 1 ] } } } }
    ], function (err, result) {
        if (err) { return cb(err); }
        if (result.length) {
            return cb(null, result[0].count);
        }
        // no voting activity for question found
        // rank is 0
        cb(null, 0);
    });
};

Activity.prototype.updateRank = function (id, cb) {
    var self = this;
    self.rank(id, function (err, rank) {
        if (err) { return cb(err); }
        self._questionModel.findAndModify(
            { id: id },
            {},
            { $set: { rank: rank } },
            { 'new': true },
            function (err, updatedQuestion) {
                if (err) { return cb(err); }
                if (!updatedQuestion) { return cb(Error('question not found')); }
                cb(null, updatedQuestion.rank);
            }
        );
    });
};

Activity.prototype.setPublicationRefIfNeeded = function (followeeID, followeeType, data, cb) {
    if (followeeType !== 'Question') {
        return cb(null, data);
    }
    this._questionModel.find({ _id: this.makeID(followeeID) }, { publication: 1 }, function (err, results) {
        if (err) { return cb(err); }
        if (results.length === 0) { return cb(new Error('question not found')); }
        if (results.length > 1) { return cb(new Error('invalid question ID')); }

        data.about_publication = results[0].publication;
        return cb(null, data);
    });
};

Activity.prototype.vote = function (questionID, userID, direction, cb) {
    var update = {
            type: 'Vote',
            about: questionID,
            creator: userID,
            dir: direction,
            created: new Date()
    };
    var self = this;
    this.setPublicationRefIfNeeded(questionID, 'Question', update, function (err, update) {
        if (err) { return cb(err); }
        self.findAndModify.call(
            self,
            { type: 'Vote', about: questionID, creator: userID },
            {},
            { $set: update },
            { upsert: true },
            function (err) {
                self.updateRank(questionID, function (err, newRank) {
                    if (err) { return cb(err); }
                    cb(null, newRank);
                });
            }
        );
    });
};

Activity.prototype.unvote = function (questionID, userID, cb) {
    var self = this;
    Base.prototype.findAndRemove.call(
        this,
        { type: 'Vote', about: questionID, creator: userID },
        {},
        {},
        function (err) {
            self.updateRank(questionID, function (err, newRank) {
                if (err) { return cb(err); }
                cb(null, newRank);
            });
        }
    );
};

Activity.prototype.comment = function (aboutID, creatorID, content, replyOf, cb) {
    if (typeof cb === 'undefined') {
        cb      = replyOf;
        replyOf = null;
    }

    var comment = {
        type:        'Comment',
        creator:     creatorID,
        about:       aboutID,
        content:     content,
        reply_count: 0,
        created:     new Date()
    };
    if (replyOf) { comment.reply_of = replyOf; }

    var self = this;
    this.setPublicationRefIfNeeded(aboutID, 'Question', comment, function (err, comment) {
        if (err) { return cb(err); }
        Base.prototype.create.call(self, comment, function (err, id) {
            if (err) { return cb(err); }
            var countModel, idSpec, incSpec;
            if (replyOf) {
                countModel = self;
                idSpec     = replyOf;
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
    });
};

Activity.prototype.follow = function (followeeID, followeeType, followerID, cb) {
    var update = {
        type: 'Follow',
        about: followeeID,
        about_type: followeeType,
        creator: followerID,
        created: new Date()
    };

    var self = this;
    this.setPublicationRefIfNeeded(followeeID, followeeType, update, function (err, update) {
        if (err) { return cb(err); }
        update = self.convertToIDs(update, self.idProperties());
        self._collection(self._collectionName, function (err, coll) {
            coll.update({ type: 'Follow', about: self.makeID(followeeID), creator: self.makeID(followerID) },
                        { $set: update },
                        { upsert: true },
                        cb);
        });
    });
};

Activity.prototype.unfollow = function (followeeID, followerID, cb) {
    var self = this;
    this._collection(this._collectionName, function (err, coll) {
        coll.remove({ type: 'Follow', about: self.makeID(followeeID), creator: self.makeID(followerID) }, cb);
    });
};

Activity.prototype.followers = function (followeeID, cb) {
    this.find({ type: 'Follow', about: followeeID },
              { fields: { creator: true } },
              function (err, followers) {
                  if (err) return cb(err);
                  cb(null, followers.map(function (r) {
                      return r.creator;
                  }));
              });
};
