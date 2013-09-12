'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('CommentController', function($scope, Comment, Auth, Username) {
    function populateCreator(comment) {
        comment.creator = {
            id:   comment.creator,
            name: Username.get(comment.creator)
        };
    }

    // comments replies
    $scope.fetchRepliesIfNeeded = function (comment) {
        if (!comment.replies || (comment.replies.length < comment.reply_count)) {
            comment.replies = Comment.replies({ id: comment.id }, function (replies) {
                angular.forEach(replies, function (reply) { populateCreator(reply); });
            });
        }
    };

    $scope.reply = function (comment) {
        $scope.temp = {
            comment: {
                about:    comment.about,
                creator:  Auth.user().id,
                reply_to: comment.id
            }
        };
    };

    $scope.cancel = function () {
        delete $scope.temp.comment;
    };

    $scope.save = function (form) {
        if(form.$valid){
            Comment.reply({ id: $scope.temp.comment.reply_to }, $scope.temp.comment, function (result) {
                if (typeof $scope.comment.replies === 'undefined') {
                    $scope.comment.replies = [];
                }
                populateCreator(result);
                $scope.comment.replies.unshift(result);
                $scope.comment.reply_count += 1;
                delete $scope.temp.comment;
            });
        }
    };
});
