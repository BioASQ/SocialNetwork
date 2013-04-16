'use strict';
/**
 *  Questions service
 */
BioASQ.Questions = function (QuestionsRes, QuestionDetailRes, VoteRes) {
    this.QuestionsRes = QuestionsRes;
    this.QuestionDetailRes = QuestionDetailRes;
    this.VoteRes = VoteRes;
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
    this.QuestionDetailRes.get({ id : id },
        function (data, headers) {
            callback(data[0]);
        },
        function (response) {
            callback(null);
        });
};

BioASQ.Questions.prototype.vote = function (id, dir, callback) {
    this.VoteRes.post({ id : id, dir : dir },
        function (data, headers) {
            callback(data[0]);
        },
        function (response) {
            callback(null);
        });
};

/**
 * Users service
 */
BioASQ.Users = function (UserRes,CommentsRes,FollowersRes,FollowingRes) {
    this.UserRes = UserRes;
    this.CommentsRes = CommentsRes;
    this.FollowersRes = FollowersRes;
    this.FollowingRes = FollowingRes;
};

BioASQ.Users.prototype.getUser = function (id, callback) {
    this.UserRes.get({ id : id },
        function (data, headers) {
            callback(data[0]);
        },
        function (response) {
            callback(null);
        });
};

BioASQ.Users.prototype.getComments = function (id, callback) {
    this.CommentsRes.get({ id : id },
        function (data, headers) {
            callback(data);
        },
        function (response) {
            callback(null);
        });
};

BioASQ.Users.prototype.getFollowers = function (id, callback) {
    this.FollowersRes.get({ id : id },
        function (data, headers) {
            callback(data);
        },
        function (response) {
            callback(null);
        });
};

BioASQ.Users.prototype.getFollowing = function (id, callback) {
    this.FollowingRes.get({ id : id },
        function (data, headers) {
            callback(data);
        },
        function (response) {
            callback(null);
        });
};

/**
 * Cache my user data
 */
BioASQ.Me = function (MeRes) {
    this.MeRes = MeRes;
    this.data = null;
};

BioASQ.Me.prototype.login = function (callback) {
    var self = this;

    if(this.data == null){
        this._login(function(data){
            self.data = data;
            callback(data);
        });
    }else{
       callback(this.data);
    }
};

BioASQ.Me.prototype._login = function (callback) {
    this.MeRes.login(
        function (data, headers) {
            callback(data[0]);
        },
        function (response) {
            callback(null);
        });
};
BioASQ.service('Questions', BioASQ.Questions);
BioASQ.service('Users', BioASQ.Users);
BioASQ.service('Me', BioASQ.Me);
