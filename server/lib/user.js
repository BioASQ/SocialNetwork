var Base = require('./base').Base;

var User = exports.User = function (database, options) {
    Base.call(this, database);
    this._collectionName = 'user';
    this._auth    = null;
    this._options = options;
};

User.prototype = Object.create(Base.prototype);

User.prototype.setAuth = function (auth) {
    this._auth = auth;
};

User.prototype.load = function (id, cb) {
    var fields = {
        type:        true,
        id:          true,
        first_name:  true,
        last_name:   true,
        email:       true,
        img:         true,
        description: true
    };
    Base.prototype.load.call(this, id, { fields: fields }, cb);
};

User.prototype.details = function (id, cb) {
    Base.prototype.load.call(this, id, { password: false }, cb);
};

User.prototype.create = function (doc, cb) {
    var self = this;

    var required = [ 'first_name', 'last_name', 'email', 'password1', 'password2' ],
        missing  = required.filter(function (key) { return (typeof doc[key] === 'undefined'); });
    if (missing.length) {
        return cb(new Error('missing ' + missing.join(', ') + '.'));
    }

    if (doc.password1 !== doc.password2) {
        return cb(new Error('passwords do not match'));
    }

    self._collection(self._collectionName, function (err, collection) {
        collection.count({ email: doc.email }, function (err, count) {
            if (err) { return cb(err); }
            if (count > 0) { return cb(new Error('email address taken.')); }

            // copy doc
            var user = JSON.parse(JSON.stringify(doc));

            user.type          = 'User';
            user.img           = user.img || 'http://placehold.it/100x100&text=No%20image';
            user.notifications = user.notifications || true;

            self._auth.hashPassword(doc.password1, function (err, hash) {
                user.password = hash;
                delete user.password1;
                delete user.password2;

                var query;
                if (!!self._options.useRegistrationCode) {
                    query   = { code: user.code };
                    options = { 'new': true };
                } else {
                    // Querying for the email should not find anything, 
                    // since we made sure it is unique. The upsert will thus
                    // always insert a new document.
                    query   = { email: user.email };
                    options = { upsert: true, 'new': true };
                }

                Base.prototype.findAndModify.call(
                    self,
                    query,
                    {},
                    { $set: user },
                    options,
                    function (err, user) {
                        if (err) { return cb(err); }
                        if (!user) { return cb(new Error('invalid code')); }
                        user.id = user._id;
                        delete user._id;
                        cb(null, user);
                    }
                );
            });
        });
    });
};

User.prototype.update = function (id, doc, cb) {
    if (!(doc.password1 || doc.password2)) {
        return Base.prototype.update.call(this, id, doc, cb);
    }

    if ((doc.password1 !== doc.password2)) {
        return cb(new Error('passwords do not match'));
    }

    var self = this,
        user = JSON.parse(JSON.stringify(doc));
    self._auth.hashPassword(doc.password1, function (err, hash) {
        user.password = hash;
        delete user.password1;
        delete user.password2;
        return Base.prototype.update.call(self, id, user, cb);
    });
};
