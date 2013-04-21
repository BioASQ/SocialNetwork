'use strict';
/**
 *  Questions service
 */
BioASQ.Questions = function (QuestionsRes, QuestionDetailRes, VoteRes) {

    this.QuestionsRes = QuestionsRes;
    this.questions = null;

    this.QuestionDetailRes = QuestionDetailRes;
    this.questionsDetail = [];

    this.VoteRes = VoteRes;
};

BioASQ.Questions.prototype.getQuestions = function (callback) {
    var self = this;
    if(this.questions != null)
        callback(this.questions);
    else{
        this._getQuestions(function(data){
            callback(data);
            self.questions = data;
        });
    }
};

BioASQ.Questions.prototype._getQuestions = function (callback) {
    this.QuestionsRes.get(
        function (data, headers) {
            callback(data);
        },
        function (response) {
            callback(null);
        });
};

BioASQ.Questions.prototype.getDetail = function (id, callback) {
    var self = this;
    if(typeof this.questionsDetail[id] != 'undefined'){
        callback(this.questionsDetail[id]);
    }else{
        this._getDetail(id, function(data){
            callback(data);
            self.questionsDetail[id] = data;
        });
    }
};

BioASQ.Questions.prototype._getDetail = function (id, callback) {
    this.QuestionDetailRes.get({ id : id },
        function (data, headers) {
            callback(data[0]);
        },
        function (response) {
            callback(null);
        });
};

// TODO: parameter index for questions to prevent angular.forEach ...
BioASQ.Questions.prototype.vote = function (id, dir, callback) {
    var self = this;
    this.VoteRes.post({ id : id, dir : dir },
        function (data, headers) {

            angular.forEach(self.questions , function(question, index){
                if(question.id == id){
                    self.questions[index].rank = data[0].rank;
                    callback(self.questions[index].rank);
                    console.log("s");
                }
            });
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
