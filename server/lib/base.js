var Base = exports.Base = function (database) {
    this._db = database;
    this._collectionName = null;
};

Base.prototype._collection = function (name, cb) {
    this._db.collection(name, cb);
};

Base.prototype.create = function (doc, user, cb) {
    if (typeof user == 'undefined') { return cb(Error('No valid user.')); }

    this._collection(this._collectionName, function (err, collection) {
        collection.insert(doc, { save: true }, function (err, inserted) {
            if (err) { return cb(err); }
            cb(null, inserted[0]._id);
        });
    });
};

Base.prototype.load = function (id, user, cb) {
    if (typeof user == 'undefined') { return cb(Error('No valid user.')); }

    this._collection(this._collectionName, function (err, collection) {
        collection.findOne({ _id: id }, function (err, doc) {
            if (err) { return cb(err); }
            if (doc) {
                doc.id = doc._id;
                delete doc._id;
            }
            cb(null, doc);
        });
    });
};

Base.prototype.find = function (query, options, user, cb) {
    if (typeof user == 'undefined') { return cb(Error('No valid user.')); }

    if (query.hasOwnProperty('id')) {
        query._id = query.id;
        delete query.id;
    }

    this._collection(this._collectionName, function (err, collection) {
        var cursor = collection.find(query);
        if (options.sort) {
            cursor = cursor.sort(options.sort);
        }
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

Base.prototype.update = function (id, doc, user, cb) {
    if (typeof user == 'undefined') { return cb(Error('No valid user.')); }

    delete doc._id;
    this._collection(this._collectionName, function (err, collection) {
        collection.update({ _id: id, creator: user }, { $set: doc, save: true }, function (err) {
            if (err) { return cb(err); }
            cb(null);
        });
    });
};

Base.prototype.remove = function (id, user, cb) {
    if (typeof user == 'undefined') { return cb(Error('No valid user.')); }

    this._collection(this._collectionName, function (err, collection) {
        collection.remove({ _id: id }, { save: true }, function (err) {
            if (err) { return cb(err); }
            cb(null);
        });
    });
};
