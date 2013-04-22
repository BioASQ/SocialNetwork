'use strict';
/**
 *
 */
BioASQ.HomeCtrl = function ($scope, $location, Questions, Users) {

    // all res. ids that an user follows
    Users.getFollowingIds($scope.me.id, function(data){
        var followingIds = data;
        // get questions
        Questions.getQuestions(function (data) {
            $scope.questions = data != null ? data : "error";
            angular.forEach($scope.questions , function(question, index){
                question.follows = followingIds.indexOf(question.id) == -1 ? false : true;
            });
        });
    });

    // ng-click detail
    $scope.details = [];
    $scope.questionDetail = function (id){
        Questions.getDetail(id, function (data) {
            $scope.details[id] = data != null ? data : "error";
        });
    };

    // vote a question
    $scope.vote = function(id, dir){
        Questions.vote(id, dir, function(rank){
            // ...
        });
    };

    // follow a question
    $scope.follow = function(id){
        Questions.follow($scope.me.id, id, function(data){
            // ...
        });
    }
};

/**
 *
 */
BioASQ.UserCtrl = function ($scope, $location, Users) {
    // http://.../#/user/id
    var id = $location.path().substr($location.path().lastIndexOf('/') + 1);
    Users.getFollowingIds($scope.me.id, function(data){
        var followingIds = data;
        Users.getUser(id, function (data) {
            $scope.user = data != null ? data : "error";
            $scope.user.follows = followingIds.indexOf(id) == -1 ? false : true;
        });
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

    $scope.follow = function(){
        Users.follow($scope.me.id, $scope.user.id,  function(){

        });
    }
};

/**
 *
 */
BioASQ.TimelineCtrl = function ($scope, $location) {
};

/**
 *
 */
BioASQ.MessageCtrl = function ($scope, $location) {
};

BioASQ.controller('HomeCtrl', BioASQ.HomeCtrl);
BioASQ.controller('UserCtrl', BioASQ.UserCtrl);
BioASQ.controller('TimelineCtrl', BioASQ.TimelineCtrl);
BioASQ.controller('MessageCtrl', BioASQ.MessageCtrl);
