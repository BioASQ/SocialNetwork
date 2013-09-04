'use strict';

var BioASQ = angular.module('BioASQ');

BioASQ.controller('QuestionController', function($scope, $routeParams, Question, Comment) {
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
    $scope.vote = function (question, dir) {
        Question.vote({ id: question.id },
                      { creator: $scope.me.id, about: question.id, dir: dir },
                      function (response) { question.rank = response.rank; }
        );
    };

    $scope.createComment = function (question) {
        $scope.temp = {
            comment: {
                about:   question.id,
                creator: $scope.me.id
            }
        };
    };

    $scope.cancel = function () {
        delete $scope.temp.comment;
    };

    $scope.save = function () {
        Question.comment({ id: $scope.temp.comment.about }, $scope.temp.comment, function (result) {
            if (typeof $scope.question.comments === 'undefined') {
                $scope.question.comments = [];
            }
            $scope.question.comments.unshift(result);
            $scope.question.comment_count += 1;
            delete $scope.temp.comment;
        });
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
});

