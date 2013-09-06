var Base = require('./base').Base;

var Login = exports.Login = function (database) {
    Base.call(this, database);
    this._collectionName = 'login';
};

Login.prototype = Object.create(Base.prototype);
