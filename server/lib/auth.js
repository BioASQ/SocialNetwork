var crypto  = require('crypto'),
    bcrypt  = require('bcrypt');

const kValueSeparator = ':';

var Auth = exports.Auth = function (user, maxTokenAge) {
    this._userModel   = user;
    this._secret      = null;
    this._maxTokenAge = maxTokenAge;
};

Auth.prototype.secret = function (cb) {
    var self = this;
    if (null !== self._secret) {
        return cb(null, self._secret);
    }
    crypto.randomBytes(32, function (err, randomBytes) {
        self._secret = randomBytes;
        cb(null, self._secret);
    });
};

Auth.prototype.hashPassword = function (password, cb) {
    bcrypt.hash(password, 3, cb);
};

Auth.prototype.encryptToken = function (token, cb) {
    this.secret(function (err, secret) {
        var cipher = crypto.createCipher('aes192', secret);
        var encrypted = cipher.update(token, 'binary', 'base64')
                      + cipher.final('base64');
        cb(null, encrypted);
    });
};

Auth.prototype.decryptToken = function (encrypted, cb) {
    this.secret(function (err, secret) {
        var decipher = crypto.createDecipher('aes192', secret);
        try {
            var decrypted = decipher.update(encrypted, 'base64', 'binary')
                          + decipher.final('binary');
            cb(null, decrypted);
        } catch(error) {
            cb(error);
        }
    });
};

Auth.prototype.generateToken = function (id, cb) {
    var self = this;
    crypto.pseudoRandomBytes(8, function (err, randomBytes) {
        var token = [ id, String(Date.now()), randomBytes ].join(kValueSeparator);
        self.encryptToken(token, function (err, encrypted) {
            cb(null, encrypted);
        });
    });
};

Auth.prototype.generatePassword = function (cb) {
    
};

Auth.prototype.verifyToken = function (token, cb) {
    var self = this;
    self.decryptToken(token, function (err, decrypted) {
        if (err || !decrypted) { return cb(new Error('Decryption error')); }
        var fields = decrypted.split(kValueSeparator),
            age = Date.now() - new Date(parseInt(fields[1], 10));

        if (age < self._maxTokenAge) { return cb(null, true, fields); }
        cb(null, false, fields);
    });
};

Auth.prototype.validateCredentials = function (username, password, cb) {
    if (!username) { throw new Error('Missing username'); }
    if (!password) { throw new Error('Missing password'); }
    var self = this;
    self._userModel.find({ email: username }, {}, function (err, users) {
        if (err || (users.length !== 1)) {
            return cb(null, { success: false, reason: 'invalid credentials' });
        }
        var user = users[0];
        if (true !== user.confirmation) {
            return cb(null, { success: false, reason: 'account not activated' });
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (err || !result) {
                return cb(null, { success: false, reason: 'invalid credentials' });
            }
            self.generateToken(user.id, function (err, encryptedToken) {
                return cb(null, {
                    success: true,
                    token: encryptedToken,
                    user: user
                });
            });
        });
    });
};

Auth.prototype.validateToken = function (token, cb) {
    if (!token) { throw new Error('Missing token'); }
    var self = this;
    self.verifyToken(token, function (err, valid, fields) {
        if (err | !valid) { return cb(null, { success: false }); }
        self.generateToken(fields[0], function (err, encryptedToken) {
            self._userModel.load(fields[0], function (err, user) {
                if (err || !user) { return cb(null, { success: false }); }
                return cb(null, {
                    success: true,
                    token: encryptedToken,
                    user: user
                });
            });
        });
    });
};

Auth.prototype.invalidateToken = function (token, cb) {
    cb(null);
};
