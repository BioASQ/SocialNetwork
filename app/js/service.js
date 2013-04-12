'use strict';
/**
 *  Questions service
 */
BioASQ.Questions = function ($rootScope, QuestionsRes, QuestionDetailRes) {
    this.scope = $rootScope;
    this.QuestionsRes = QuestionsRes;
    this.QuestionDetailRes = QuestionDetailRes;
};


BioASQ.Questions.prototype.getQuestions = function (callback) {
    //var self = this;
    this.QuestionsRes.get(
        function (data, headers) {
            callback(data);
        },
        function (response) {
            callback(null);
        });
};

BioASQ.Questions.prototype.getDetail = function (id, callback) {
    this.QuestionDetailRes.get({ id: id },
        function (data, headers) {
            callback(data[0]);
        },
        function (response) {
            callback(null);
        });
};
BioASQ.service('Questions', BioASQ.Questions);

/**
 * Users service
 */
BioASQ.Users = function ($rootScope, UserRes,CommentsRes,FollowersRes,FollowingRes) {
    this.scope = $rootScope;
    this.UserRes = UserRes;
    this.CommentsRes = CommentsRes;
    this.FollowersRes = FollowersRes;
    this.FollowingRes = FollowingRes;
};

BioASQ.Users.prototype.getUser = function (id, callback) {
    this.UserRes.get({ id: id },
        function (data, headers) {
            callback(data[0]);
        },
        function (response) {
            callback(null);
        });
};

BioASQ.Users.prototype.getComments = function (id, callback) {
    this.CommentsRes.get({ id: id },
        function (data, headers) {
            callback(data);
        },
        function (response) {
            callback(null);
        });
};

BioASQ.Users.prototype.getFollowers = function (id, callback) {
    this.FollowersRes.get({ id: id },
        function (data, headers) {
            callback(data);
        },
        function (response) {
            callback(null);
        });
};

BioASQ.Users.prototype.getFollowing = function (id, callback) {
    this.FollowingRes.get({ id: id },
        function (data, headers) {
            callback(data);
        },
        function (response) {
            callback(null);
        });
};
BioASQ.service('Users', BioASQ.Users);