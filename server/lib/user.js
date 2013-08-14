var Base = require('./base').Base;

var User = exports.User = function (database) {
    Base.call(this, database);
    this._collectionName = 'user';
};

User.prototype = Object.create(Base.prototype);
