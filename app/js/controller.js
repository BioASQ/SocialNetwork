'use strict';
/**
 *
 */
BioASQ.HomeCtrl = function ($scope, $location, Questions, Me) {

    Me.login(function(){
        $scope.me = Me.data;
    });

    // get questions
    Questions.getQuestions(function (data) {
        $scope.questions = data != null ? data : "error";
    });

    // TODO: put this cache to service
    // ng-click detail
    $scope.details = { detail: []};
    $scope.questionDetail = function (id){
        if(typeof $scope.details.detail[id] == 'undefined'){
            Questions.getDetail(id, function (data) {
                if (data != null) {
                    $scope.details.detail[id] = data;
                }
            });
        }
    };

    // vote a question
    $scope.votes = { vote : []};
    $scope.votes.call = function(id, dir){
        Questions.vote(id, dir, function(data){
            $scope.votes.vote[id] = data.rank;
        });
    };
};

/**
 *
 */
BioASQ.UserCtrl = function ($scope, $location, Users, Me) {
    Me.login(function(){
        $scope.me = Me.data;
    });
    // http://.../#/user/id
    var id = $location.path().substr($location.path().lastIndexOf('/') + 1);
    Users.getUser(id, function (data) {
        $scope.user = data != null ? data : "error";
    });

    $scope.showFollowing = function(){
        Users.getFollowing(id, function(data){
            $scope.data = data;
        });
    };
    // default 
    $scope.showFollowing(id);

    $scope.showComments = function(){
        Users.getComments(id, function(data){
            $scope.data = data;
        });
    };

    $scope.showFollowers = function(){
        Users.getFollowers(id, function(data){
            $scope.data = data;
        });
    };
};

/**
 *
 */
BioASQ.TimelineCtrl = function ($scope, $location, Me) {
    Me.login(function(){
        $scope.me = Me.data;
    });
};

/**
 *
 */
BioASQ.MessageCtrl = function ($scope, $location, Me) {
    Me.login(function(){
        $scope.me = Me.data;
    });
};

BioASQ.controller('HomeCtrl', BioASQ.HomeCtrl);
BioASQ.controller('UserCtrl', BioASQ.UserCtrl);
BioASQ.controller('TimelineCtrl', BioASQ.TimelineCtrl);
BioASQ.controller('MessageCtrl', BioASQ.MessageCtrl);
