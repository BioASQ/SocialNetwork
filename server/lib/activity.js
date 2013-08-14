var Base = require('./base').Base;

var Activity = exports.Activity = function (database) {
    Base.call(this, database);
    this._collectionName = 'activity';
    this._entityName     = 'Activity';
};

Activity.prototype = Object.create(Base.prototype);

Activity.prototype.rank = function (questionID, cb) {
    Base.prototype.find.call(this, { type: 'Vote', about: questionID }, {}, {}, function (err, votes) {
        if (err) { return cb(err); }
        cb(null, votes.reduce(function (rank, vote) {
            if (vote.dir === 'up') { return (rank + 1); }
            else if (vote.dir === 'down') { return (rank - 1); }
            else { return rank; }
        }, 0));
    });
};

Activity.prototype.vote = function (questionID, userID, direction, cb) {
    this._collection(this._collectionName, function (err, coll) {
        coll.update({ about: questionID, creator: userID },
                    { $set: { dir: direction, created: new Date() } },
                    { upsert: true},
                    function (err) {
                        if (err) { return cb(err); }
                        cb(null);
                    });
    });

/*
 *         var filtered = data.questions.filter(function (question) {
 *             return question.id === request.params.id;
 *         });
 * 
 *         if (filtered.length) {
 *             var votes = data.activities.filter(function (activity) {
 *                 return (activity.type === 'Vote' &&
 *                         activity.about === request.params.id &&
 *                         activity.creator === request.user.id);
 *             });
 *             if (votes.length === 0) {
 *                 data.activities.push({
 *                     id: 'v15',
 *                     type: 'Vote',
 *                     about: request.params.id,
 *                     creator: request.user.id,
 *                     created: (new Date()).toISOString(),
 *                     dir: request.param('dir')
 *                 });
 *                 filtered[0].rank += (request.param('dir') == 'down' ? -1 : 1);
 *             } else {
 *                 filtered[0].rank += (votes[0].dir === 'up' ? -1 : 1);
 *                 votes[0].dir = request.param('dir');
 *                 votes[0].created = (new Date()).toISOString();
 *                 filtered[0].rank += (votes[0].dir === 'up' ? 1 : -1);
 *             }
 *             response.send({ rank: filtered[0].rank });
 *         } else {
 *             response.send(404);
 *         }
 */
};
