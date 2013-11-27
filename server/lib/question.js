var step = require('step'),
    Base = require('./base').Base;

var Question = exports.Question = function (database) {
    Base.call(this, database);
    this._collectionName = 'question';
};

Question.prototype = Object.create(Base.prototype);

Question.prototype.idProperties = function () {
    return [ 'creator' ];
};

Question.prototype.import = function (id, doc, cb) {
    doc.modified = new Date();
    doc.question_type = doc.type;
    doc.type = 'Question';
    
    delete doc.creator;
    delete doc.finalized;

    var self = this;
    delete doc._id;
    doc = this.convertToIDs(doc, this.idProperties());
    this._collection(this._collectionName, function (err, collection) {
        collection.update(
            { _id: self.makeID(id) },
            { $set: doc },
            { upsert: true, journal: true },
            function (err, result, details) {
                if (typeof cb !== 'undefined') {
                    if (err) { return cb(err); }
                    cb(null, !details.updatedExisting);
                }
            });
    });
};

Question.prototype.search = function (query, options, cb) {
    var command = {
        text: this._collectionName,
        search: query
    };
    [ 'filter', 'project', 'limit', 'language' ].forEach(function (key) {
        if (options.hasOwnProperty(key)) {
            command[key] = options[key];
        }
    });
    this._db.command(command, function (err, res) {
        if (err) { return cb(err); }
        if (!res) { return cb(Error('error searching text index')); }
        cb(null, res.results.map(function (r) {
            r.obj.id = r.obj._id;
            delete r.obj._id;
            return r.obj;
        }));
    });
};
