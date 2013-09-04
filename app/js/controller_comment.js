'use strict';

var BioASQ = angular.module('BioASQ');

BioASQ.controller('CommentController', function($scope, Comment, $http) {
    // comments replies
    $scope.fetchRepliesIfNeeded = function (comment) {
        if (!comment.replies || (comment.replies.length < comment.reply_count)) {
            comment.replies = Comment.replies({ id: comment.id });
        }
    };

    $scope.reply = function (comment) {
        $scope.temp = {
            comment: {
                about:    comment.about,
                creator:  $scope.me.id,
                reply_to: comment.id
            }
        };
    };

    $scope.cancel = function () {
        delete $scope.temp.comment;
    };

    $scope.save = function () {
        Comment.reply({ id: $scope.temp.comment.reply_to }, $scope.temp.comment, function (result) {
            if (typeof $scope.comment.replies === 'undefined') {
                $scope.comment.replies = [];
            }
            $scope.comment.replies.unshift(result);
            $scope.comment.reply_count += 1;
            delete $scope.temp.comment;
        });
    };
});
