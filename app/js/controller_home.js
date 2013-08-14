'use strict';

/**
 *
 */
BioASQ.HomeCtrl = function($scope, Questions, Users, modalFactory) {
    $scope.currentCtrl = 'HomeCtrl';

    // uses Users service to get followings
    Users.getFollowingIds($scope.me.id, function(data) {
        var followingIds = data;

        // uses Questions service to get questions
        Questions.getQuestions(function(data) {
            $scope.questions = data !== null ? data : "error";

            // mark followed questions
            angular.forEach($scope.questions, function(question, index) {
                question.follows = followingIds.indexOf(question.id) === -1 ? false : true;
            });
        });
    });

    // show question answers(details) and cache them
    $scope.details = [];
    $scope.questionDetail = function(id) {
        Questions.getDetail(id, function(data) {
            $scope.details[id] = data !== null ? data : "error";
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
    };

    // modal dialog
    modalFactory.setCacheData({
        title: '',
        message: ''
    });
    $scope.openDialog = function(data) {
        modalFactory.openDialog(modalFactory.options('partials/templates/modal_comment.html', 'DialogCtrl', data), function() {
            // ...
        });
    };

    // show comments
    $scope.comments = [];
    $scope.showComments = function(id) {
        if (typeof $scope.comments[id] == 'object') {
            // hide
            $scope.comments[id] = undefined;
        } else {
            // show
            Users.getComments(id, function(data) {
                $scope.comments[id] = data;
            });
        }
    };
};

BioASQ.controller('HomeCtrl', BioASQ.HomeCtrl);
