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
