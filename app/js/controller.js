'use strict';
/**
 *
 */
BioASQ.HomeCtrl = function ($scope, $location, Questions) {

    // get questions
    Questions.getQuestions(function (data) {
        $scope.questions = data != null ? data : "error";
    });

    // TODO: put this cache to service
    // ng-click detail
    $scope.details = [];
    $scope.questionDetail = function (id){
        Questions.getDetail(id, function (data) {
            $scope.details[id] = data != null ? data : "error";
        });
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
BioASQ.UserCtrl = function ($scope, $location, Users) {
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
