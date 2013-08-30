'use strict';

BioASQ.CommentController = function($scope, Comment) {
    // comments replies
    $scope.fetchRepliesIfNeeded = function (comment) {
        if (!comment.replies || (comment.replies < comment.reply_count)) {
            comment.replies = Comment.replies({ id: comment.id });
        }
    };
};

BioASQ.controller('CommentController', BioASQ.CommentController);

