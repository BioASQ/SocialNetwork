'use strict';

/**
 *  Questions service
 */
BioASQ.Questions = function(QuestionsRes, QuestionDetailRes, VoteRes, FollowRes) {

    this.QuestionsRes = QuestionsRes;
    this.questions = null;

    this.QuestionDetailRes = QuestionDetailRes;
    this.questionsDetail = [];

    this.VoteRes = VoteRes;

    this.FollowRes = FollowRes;
};

BioASQ.Questions.prototype.getQuestions = function(callback) {
    if (this.questions !== null) {
        callback(this.questions);
    } else {
        var self = this;
        this._getQuestions(function(data) {
            self.questions = data;
            callback(data);
        });
    }
};

BioASQ.Questions.prototype._getQuestions = function(callback) {
    this.QuestionsRes.get(
        function(data, headers) {
            callback(data);
        },
        function(response) {
            callback(null);
        });
};

BioASQ.Questions.prototype.getDetail = function(id, callback) {
    if (typeof this.questionsDetail[id] != 'undefined') {
        callback(this.questionsDetail[id]);
    } else {
        var self = this;
        this._getDetail(id, function(data) {
            self.questionsDetail[id] = data;
            callback(data);
        });
    }
};

BioASQ.Questions.prototype._getDetail = function(id, callback) {
    this.QuestionDetailRes.get({
            id: id
        },
        function(data, headers) {
            callback(data);
        },
        function(response) {
            callback(null);
        });
};

// TODO: parameter index for questions to prevent angular.forEach ...
BioASQ.Questions.prototype.vote = function(id, dir, callback) {
    var self = this;
    this.VoteRes.post({
            id: id,
            dir: dir
        },
        function(data, headers) {

            angular.forEach(self.questions, function(question, index) {
                if (question.id == id) {
                    self.questions[index].rank = data.rank;
                    callback(self.questions[index].rank);
                }
            });
        },
        function(response) {
            callback(null);
        });
};

BioASQ.Questions.prototype.follow = function(me, id, callback) {
    this.FollowRes.follow({
            who: me,
            id: id
        },
        function(data, headers) {
            callback(data);
        },
        function(response) {
            callback(null);
        });
};

BioASQ.service('Questions', BioASQ.Questions);
