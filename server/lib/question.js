var step = require('step'),
    Base = require('./base').Base;

var Question = exports.Question = function (database, activityModel) {
    Base.call(this, database);
    this._collectionName = 'question';
    this._activityModel = activityModel;
};

Question.prototype = Object.create(Base.prototype);

Question.prototype.load = function (id, user, cb) {
    var self = this;
    Base.prototype.load.call(this, id, user, function (err, doc) {
        if (err) { return cb(err); }
        if (!doc) { return cb(null); }
        self._activityModel.rank(id, function (err, rank) {
            if (err) { return cb(err); }
            doc.rank = rank;
            cb(null, doc);
        });
    });
};

Question.prototype.find = function (query, options, user, cb) {
    var self = this;
    Base.prototype.find.call(this, query, options, user, function (err, res) {
        if (err) { return cb(err); }
        step(
            function () {
                var docGroup  = this.group();
                res.forEach(function (doc) {
                    var docCallback = docGroup();
                    self._activityModel.rank(doc.id, function (err, rank) {
                        doc.rank = rank;
                        docCallback(null, doc);
                    });
                });
            },
            function (err, docs) {
                if (err) { return cb(err); }
                cb(null, docs);
            }
        );
    });
};
