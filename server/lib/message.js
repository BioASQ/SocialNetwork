var Base = require('./base').Base;

var Message = exports.Message = function (database) {
    Base.call(this, database);
    this._collectionName = 'message';
};

Message.prototype = Object.create(Base.prototype);

Message.prototype.all = function (userID, withID, cb) {
    var query;
    if (typeof cb === 'undefined') {
        cb     = withID;
        withID = null;
        query  = { $or: [ { creator: userID }, { to: userID } ] };
    } else {
        query = {
            creator: { $in: [ userID, withID ] },
            to:      { $in: [ userID, withID ] }
        };
    }
    Base.prototype.find.call(this, query, { sort: { created: -1 } }, cb);
};
