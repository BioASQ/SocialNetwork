'use strict';

/**
 * 
 */
BioASQ.HomeCtrl = function($scope, Questions, Users, modalFactory) {
    $scope.currentCtrl = 'HomeCtrl';

    Users.getFollowingIds($scope.me.id, function(data) {
        var followingIds = data;

        Questions.getQuestions(function(data) {
            $scope.questions = data != null ? data : "error";
            
            // mark followed questions
            angular.forEach($scope.questions, function(question, index) {
                question.follows = followingIds.indexOf(question.id) === -1 ? false : true;
            });
        });
    });

    // show question answers and cache them
    $scope.details = [];
    $scope.questionDetail = function(id) {
        Questions.getDetail(id, function(data) {
            $scope.details[id] = data != null ? data : "error";
        });
    };

    // vote a question
    $scope.vote = function(id, dir) {
        Questions.vote(id, dir, function(rank) {
            // ...
        });
    };

    // follow a question
    $scope.follow = function(id) {
        Questions.follow($scope.me.id, id, function(data) {
            // ...
        });
    }

    // modal dialog
    modalFactory.setCacheData({
        title : '',
        message : ''
    });
    $scope.openDialog = function(data) {
        modalFactory.openDialog(modalFactory.options('partials/templates/modal_comment.html', 'DialogCtrl', data), function() {
            // ...
        });
    };

    // show comments
    $scope.comments = [];
    $scope.showComments = function(id) {
        // hide
        if (typeof $scope.comments[id] == 'object') {
            $scope.comments[id] = undefined;
        } else {
            // show
            Users.getComments(id, function(data) {
                $scope.comments[id] = data;
            });
        }
    }
}

BioASQ.controller('HomeCtrl', BioASQ.HomeCtrl);
