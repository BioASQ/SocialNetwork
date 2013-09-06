var crypto  = require('crypto'),
    bcrypt = require('bcrypt');

var Auth = exports.Auth = function (user, login) {
    this._userModel  = user;
    this._loginModel = login;
    this._secret     = null;
};

Auth.prototype.secret = function (cb) {
    var self = this;
    if (null !== self._secret) {
        return cb(null, self._secret);
    }
    crypto.randomBytes(8, function (err, randomBytes) {
        self._secret = randomBytes;
        cb(null, self._secret);
    });
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

Auth.prototype.validateCredentials = function (username, password, cb) {
    var self = this;
    self._userModel.find({ email: username }, {}, function (err, users) {
        if (err || (users.length !== 1)) { return cb(null, { success: false }); }
        var user = users[0];
        bcrypt.compare(password, user.password, function (err, result) {
            if (err || !result) { return cb(null, { success: false }); }
            var token = [ user.id, password ].join(':');
            self.encryptToken(token, function (err, encrypted) {
                return cb(null, {
                    success: true,
                    token: encrypted,
                    user: user
                });
            });
        });
    });
};

Auth.prototype.validateToken = function (token, cb) {
    var self = this;
    this.decryptToken(token, function (err, encrypted) {
        if (err || !encrypted) { return cb(null, { success: false }); }
        var credentials = encrypted.split(':');
        self._userModel.load(credentials[0], function (err, user) {
            if (err || !user) { return cb(null, { success: false }); }
            bcrypt.compare(credentials[1], user.password, function (err, result) {
                if (err || !result) { return cb(null, { success: false }); }
                return cb(null, {
                    success: true,
                    user: user
                });
            });
        });
    });
};

Auth.prototype.invalidateToken = function (token, cb) {
    cb(null);
};
