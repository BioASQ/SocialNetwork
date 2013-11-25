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

Question.prototype.import = function (id, doc, cb) {
    doc.modified = new Date();
    doc.question_type = doc.type;
    doc.type = 'Question';
    
    delete doc.creator;
    delete doc.finalized;

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
