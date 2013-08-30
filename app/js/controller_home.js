'use strict';

/**
 *
 */
BioASQ.HomeCtrl = function($scope, User, Question, Comment, modalFactory) {
    $scope.currentCtrl  = 'HomeCtrl';
    $scope.questions    = Question.query();
    $scope.commentState = {};
    $scope.replyState   = {};

    $scope.$watch('followings.length + questions.length', function () {
        angular.forEach($scope.questions, function (question) {
            question.follows = ($scope.followings.indexOf(question.id) > -1);
        });
    });

    // vote on a question
    $scope.vote = function(question, dir) {
        Question.vote({ id: question.id },
                      { creator: $scope.me.id, about: question.id, dir: dir },
                      function (response) { question.rank = response.rank; }
        );
    };

    // comments
    $scope.fetchCommentsIfNeeded = function (question) {
        if (!question.comments || question.comments.length < question.comment_count) {
            Question.comments({ id: question.id },
                            function (comments) { question.comments = comments; }
            );
        }
    };

    // comments replies
    $scope.openReplies = function (comment) {
        Comment.replies({ id: comment.id },
                        function (replies) { comment.replies = replies; }, // success
                        function (response) { });                                   // error
    };

    // modal dialog
    modalFactory.setCacheData({
        title: '',
        message: ''
    });
    $scope.openDialog = function(data) {
        modalFactory.openDialog(modalFactory.options('templates/partials/modal_comment.html', 'DialogCtrl', data), function() {
            // ...
        });
    };
};

BioASQ.controller('HomeCtrl', BioASQ.HomeCtrl);
