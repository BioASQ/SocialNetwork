var ObjectID = require('mongodb').ObjectID;

var Base = exports.Base = function (database) {
    this._db = database;
    this._collectionName = null;
};

Base.prototype._collection = function (name, cb) {
    this._db.collection(name, cb);
};

Base.prototype.create = function (doc, cb) {
    this._collection(this._collectionName, function (err, collection) {
        collection.insert(doc, { save: true }, function (err, inserted) {
            if (err) { return cb(err); }
            cb(null, inserted[0]._id);
        });
    });
};

Base.prototype.load = function (id, cb) {
    if (id.length === 24) { id = new ObjectID(id); }
    this._collection(this._collectionName, function (err, collection) {
        collection.findOne({ _id: id }, function (err, doc) {
            if (err) { return cb(err); }
            if (doc) {
                doc.id = String(doc._id);
                delete doc._id;
            }
            cb(null, doc);
        });
    });
};

Base.prototype.find = function (query, options, cb) {
    if (query.hasOwnProperty('id')) {
        query._id = query.id;
        delete query.id;
    }

    this._collection(this._collectionName, function (err, collection) {
        var cursor = collection.find(query, options);
        cursor.toArray(function (err, res) {
            if (err) { return cb(err); }
            cb(null, res.map(function (doc) {
                doc.id = doc._id;
                delete doc._id;
                return doc;
            }));
        });
    });
};

Base.prototype.update = function (id, doc, cb) {
    delete doc._id;
    this._collection(this._collectionName, function (err, collection) {
        collection.update({ _id: id }, { $set: doc, save: true }, function (err) {
            if (err) { return cb(err); }
            cb(null);
        });
    });
};

Base.prototype.remove = function (id, cb) {
    this._collection(this._collectionName, function (err, collection) {
        collection.remove({ _id: id }, { save: true }, function (err) {
            if (err) { return cb(err); }
            cb(null);
        });
    });
};

Base.prototype.findAndModify = function (query, sort, update, options, cb) {
    if (query.id) {
        query._id = (query.id.length === 24) ? new ObjectID(query.id) : query.id;
        delete query.id;
    }
    this._collection(this._collectionName, function (err, collection) {
        collection.findAndModify(query, sort, update, options, function (err, doc) {
            if (err) { return cb(err); }
            cb(null, doc);
        });
    });
};

