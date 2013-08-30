'use strict';

BioASQ.QuestionController = function($scope, Question) {
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

    // follow
    $scope.toggleFollow = function (question) {
        if (question.follows) {
            Question.unfollow({ id: question.id, follower: $scope.me.id }, function () {
                question.follows = false;
            });
        } else {
            Question.follow({ id: question.id }, { about: $scope.me.id }, function () {
                question.follows = true;
            });
        }
    };

};

BioASQ.controller('QuestionController', BioASQ.QuestionController);

