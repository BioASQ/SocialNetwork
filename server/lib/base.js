var util = require('util'),
    ObjectID = require('mongodb').ObjectID;

var Base = exports.Base = function (database) {
    this._db = database;
    this._collectionName = null;
};

Base.prototype._collection = function (name, cb) {
    this._db.collection(name, cb);
};

Base.prototype.idProperties = function () {
    throw new Error('not implemented');
};

/**
 * Takes a string and turns it into an ObjectID or an integer ID
 * depending on its length.
 */
Base.prototype.makeID = function (tempID) {
    if (typeof tempID !== 'string') {
        return tempID;
    }
    if (tempID.length === 24) {
        return new ObjectID(tempID);
    }
    var numberID = parseInt(tempID, 10);
    if (numberID.toString(10) === tempID) {
        return numberID;
    }
    return tempID;
};

Base.prototype.convertToIDs = function (object, properties) {
    var self = this;
    if (!util.isArray(properties)) {
        properties = [ properties ];
    }
    properties.forEach(function (propertyName) {
        if (object.hasOwnProperty(propertyName)) {
            object[propertyName] = self.makeID(object[propertyName]);
        }
    });
    return object;
};

Base.prototype.create = function (doc, cb) {
    doc = this.convertToIDs(doc, this.idProperties());
    this._collection(this._collectionName, function (err, collection) {
        collection.insert(doc, { save: true }, function (err, inserted) {
            if (err) { return cb(err); }
            cb(null, inserted[0]._id);
        });
    });
};

Base.prototype.load = function (id, options, cb) {
    var self = this;
    if (typeof cb === 'undefined') {
        cb = options;
        options = {};
    }

    this._collection(this._collectionName, function (err, collection) {
        collection.findOne({ _id: self.makeID(id) }, options, function (err, doc) {
            if (err) { return cb(err); }
            if (doc) {
                doc.id = String(doc._id);
                delete doc._id;
            }
            cb(null, doc);
        });
    });
};

Base.prototype.cursor = function (query, options, cb) {
    if (query.hasOwnProperty('id')) {
        query._id = this.makeID(query.id);
        delete query.id;
    }

    query = this.convertToIDs(query, this.idProperties());
    if (options.fields) {
        options.fields = this.convertToIDs(options.fields, this.idProperties());
    }
    this._collection(this._collectionName, function (err, collection) {
        if (err) { return cb(err); }
        cb(null, {
            _cursor: collection.find(query, options),
            toArray: function (cb) {
                return this._cursor.toArray(function (err, res) {
                    cb(null, res.map(function (doc) {
                        doc.id = doc._id;
                        delete doc._id;
                        return doc;
                    }));
                });
            },
            limit: function (limit) {
                this._cursor.limit(limit);
                return this;
            },
            skip: function (skip) {
                this._cursor.skip(skip);
                return this;
            },
            count: function (cb) {
                return this._cursor.count(cb);
            }
        });
    });
};

Base.prototype.find = function (query, options, cb) {
    if (query.hasOwnProperty('id')) {
        query._id = this.makeID(query.id);
        delete query.id;
    }

    if (options.fields && options.fields.id) {
        options.fields._id = this.makeID(options.fields.id);
        delete options.fields.id;
    }

    query = this.convertToIDs(query, this.idProperties());
    if (options.fields) {
        options.fields = this.convertToIDs(options.fields, this.idProperties());
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
    var self = this;
    delete doc._id;
    doc = this.convertToIDs(doc, this.idProperties());
    this._collection(this._collectionName, function (err, collection) {
        collection.update({ _id: self.makeID(id) }, { $set: doc } , function (err) {
            if (typeof cb !== 'undefined') {
                if (err) { return cb(err); }
                cb(null);
            }
        });
    });
};

Base.prototype.remove = function (id, cb) {
    var self = this;
    this._collection(this._collectionName, function (err, collection) {
        collection.remove({ _id: self.makeID(id) }, { save: true }, function (err) {
            if (err) { return cb(err); }
            cb(null);
        });
    });
};

Base.prototype.findAndModify = function (query, sort, update, options, cb) {
    if (query.id) {
        query._id = this.makeID(query.id);
        delete query.id;
    }
    query = this.convertToIDs(query, this.idProperties());
    update = this.convertToIDs(update, this.idProperties());
    if (options.fields) {
        options.fields = this.convertToIDs(options.fields, this.idProperties());
    }
    if (update.$set) {
        update.$set = this.convertToIDs(update.$set, this.idProperties());
    } else {
        update = this.convertToIDs(update, this.idProperties());
    }
    this._collection(this._collectionName, function (err, collection) {
        collection.findAndModify(query, sort, update, options, function (err, doc) {
            if (err) { return cb(err); }
            cb(null, doc);
        });
    });
};
