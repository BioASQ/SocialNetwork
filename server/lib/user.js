var crypto = require('crypto');

var Base = require('./base').Base;

var User = exports.User = function (database, options) {
    Base.call(this, database);
    this._collectionName = 'user';
    this._auth    = null;
    this._options = options;
};

User.prototype = Object.create(Base.prototype);

User.prototype._nextID = function (cb) {
    var self = this;
    self._collection('counters', function (err, counters) {
        var ret = counters.findAndModify(
            { _id: self._collectionName },
            {},
            { $inc: { seq: 1 } },
            { 'new': true },
            function (err, ret) {
                if (err) { return cb(err); }
                cb(null, ret.seq);
            });
    });
};

User.prototype.idProperties = function () {
    return [];
};

User.prototype.setAuth = function (auth) {
    this._auth = auth;
};

User.prototype.load = function (id, cb) {
    var fields = {
        type:          true,
        id:            true,
        first_name:    true,
        last_name:     true,
        email:         true,
        img:           true,
        description:   true,
        notifications: true,
        black_list:    true,
        roles:         true
    };
    Base.prototype.load.call(this, id, { fields: fields }, cb);
};

User.prototype.details = function (id, cb) {
    Base.prototype.load.call(this, id, { password: false }, cb);
};

User.prototype.invite = function (name, email, cb) {
    var self = this;
    self._nextID(function (err, id) {
        if (err) return cb(err);

        crypto.pseudoRandomBytes(4, function (err, bytes) {
            var inviteCode = bytes.toString('hex');
            self._collection(self._collectionName, function (err, collection) {
                collection.insert(
                    {   _id:     id,
                        code:    inviteCode,
                        invited: email
                    },
                    { w: 1 },
                    function (err, res) {
                        if (err) { return cb(err); }
                        return cb(null, inviteCode);
                    });
            });
        });
    });
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

            var mailDigest = crypto.createHash('md5').update(user.email).digest('hex');

            crypto.pseudoRandomBytes(8, function (err, bytes) {
                user.type          = 'User';
                user.img           = user.img || 'http://gravatar.com/avatar/' + mailDigest + '?s=100';
                user.notifications = user.notifications || true;
                user.confirmation  = bytes.toString('hex');

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
    });
};

User.prototype.activate = function (email, code, cb) {
    var self = this;
    Base.prototype.findAndModify.call(
        self,
        { email: email, confirmation: code },
        {},
        { $set: { confirmation: true } },
        {'new': true },
        function (err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(new Error('account not found')); }
            user.id = user._id;
            delete user._id;
            cb(null, user);
        }
    );
};

User.prototype.reset = function (doc, cb) {
    if (!doc.code) { return cb(new Error('invalid code')); }
    if (doc.password1 !== doc.password2) {
        return cb(new Error('passwords do not match'));
    }
    if (!doc.password1) {
        return cb(new Error('password required'));
    }
    var self = this;
    self._auth.hashPassword(doc.password1, function (err, hash) {
        Base.prototype.findAndModify.call(
            self,
            { code: doc.code },
            {},
            { $set: { password: hash } },
            {'new': true },
            function (err, user) {
                if (err || !user) { return cb(new Error('invalid code')); }
                user.id = user._id;
                delete user._id;
                cb(null, user);
            }
        );
    });
};

User.prototype.update = function (id, doc, cb) {
    var self = this,
        user = JSON.parse(JSON.stringify(doc));

    if (!(user.password1 || user.password2)) {
        delete user.password;
        return Base.prototype.update.call(self, id, user, cb);
    }

    if ((user.password1 !== user.password2)) {
        return cb(new Error('passwords do not match'));
    }

    self._auth.hashPassword(user.password1, function (err, hash) {
        user.password = hash;
        delete user.password1;
        delete user.password2;
        return Base.prototype.update.call(self, id, user, cb);
    });
};
