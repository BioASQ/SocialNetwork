'use strict';

BioASQ.QuestionController = function($scope, $routeParams, Question) {
    // fetch question list
    $scope.fetchQuestionsIfNeeded = function () {
        if (!$scope.questions) {
            $scope.questions = Question.query(function () {
                angular.forEach($scope.questions, function (question) {
                    question.follows = ($scope.cache.followings.indexOf(question.id) > -1);
                });
            });
        }
    };

    // fetch question
    $scope.fetchQuestionIfNeeded = function (questionID) {
        if (!$scope.question) {
            $scope.question = Question.get({ id: questionID }, function () {
                $scope.question.follows = ($scope.cache.followings.indexOf($scope.question.id) > -1);
            });
        }
    };

    // fetch comments
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
                $scope.cache.followings.splice($scope.cache.followings.indexOf(question.id), 1);
            });
        } else {
            Question.follow({ id: question.id }, { creator: $scope.me.id }, function () {
                question.follows = true;
                $scope.cache.followings.push(question.id);
            });
        }
    };

    // vote on a question
    $scope.vote = function(question, dir) {
        Question.vote({ id: question.id },
                      { creator: $scope.me.id, about: question.id, dir: dir },
                      function (response) { question.rank = response.rank; }
        );
    };

    $scope.filterAnnotations = function (answer, type) {
        $scope.filteredAnnotations = [];
        $scope.type = type;
        angular.forEach(answer.annotations, function (annotation) {
            if (annotation.type === type) {
                $scope.filteredAnnotations.push(annotation);
            }
        });
    };
};

BioASQ.controller('QuestionController', BioASQ.QuestionController);

