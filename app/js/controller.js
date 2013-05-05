'use strict';
/**
 *
 */
BioASQ.HomeCtrl = function ($scope, $location, Questions, Users) {
    // all ids the current user follows
    Users.getFollowingIds($scope.me.id, function(data){
        var followingIds = data;
        // get questions
        Questions.getQuestions(function (data) {
            $scope.questions = data != null ? data : "error";
            // mark followed questions
            angular.forEach($scope.questions , function(question, index){
                question.follows = followingIds.indexOf(question.id) == -1 ? false : true;
            });
        });
    });

    // show question answers and cache them
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
}

/**
 *
 */
BioASQ.UserCtrl = function ($scope, $location, Users, CommentRes) {

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
            // update table if open
            if($scope.radioModel == 'followers')
                $scope.showFollowers();
        });
    }

    // cache last user input
    $scope.inputTitle = '';
    $scope.inputMessage = '';
    $scope.save = function(title, message){
        $scope.inputTitle = title;
        $scope.inputMessage = message;
    }

    // send message
    $scope.send = function(title, message){
        CommentRes.post(
            { id : id, creator : $scope.me, content : JSON.stringify(message), title : JSON.stringify(title)},
            function (data, headers) {
                // update table if open
                if($scope.radioModel == 'comments')
                    $scope.showComments();
            },
            function (response) {
            }
        );
        $scope.open = false;
    }
}

/**
 *
 */
BioASQ.TimelineCtrl = function ($scope, $location, TimelineRes) {
    var order = '';

    TimelineRes.post(
        { order : order },
        function (data, headers) {
            $scope.data = data;
        },
        function (response) {
            callback(null);
        });
}

/**
 *
 */
BioASQ.MessageCtrl = function ($scope, $location) {
}

BioASQ.controller('HomeCtrl', BioASQ.HomeCtrl);
BioASQ.controller('UserCtrl', BioASQ.UserCtrl);
BioASQ.controller('TimelineCtrl', BioASQ.TimelineCtrl);
BioASQ.controller('MessageCtrl', BioASQ.MessageCtrl);
