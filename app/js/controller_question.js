'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('QuestionController', function($scope, $routeParams, Question, Comment, Auth, Followings, Username) {
    $scope.currentPage  = 1;
    $scope.itemsPerPage = 10;
    $scope.sortProperty = 'created';

    var _watches = false;
    var id = $routeParams.id || '';

    function populateCreator(comment) {
        comment.creator = {
            id:   comment.creator,
            name: Username.get(comment.creator)
        };
    }

    // fetch question list
    $scope.fetchQuestionsIfNeeded = function () {
        if (!$scope.questions) {
            var options = {
                limit:  $scope.itemsPerPage,
                offset: ($scope.currentPage - 1) * $scope.itemsPerPage,
                sort:   $scope.sortProperty
            };
            $scope.questions = Question.query(options, function (data, getHeader) {
                var resultSize = parseInt(getHeader('X-Result-Size'), 10);
                $scope.totalItems = resultSize;
                angular.forEach($scope.questions, function (question) {
                    question.follows = false;
                    Followings.isFollowing(question.id).then(function (value) {
                        question.follows = value;
                    });
                });
            });
        }

        if (!_watches) {
            $scope.$watch('currentPage', function () {
                delete $scope.questions;
                $scope.fetchQuestionsIfNeeded();
            });
            $scope.$watch('sortProperty', function () {
                $scope.currentPage = 1;
                delete $scope.questions;
                $scope.fetchQuestionsIfNeeded();
            });
            $scope.$watch('terms', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal === '') {
                    $scope.currentPage = 1;
                    $scope.itemsPerPage = 10;
                    delete $scope.questions;
                    $scope.fetchQuestionsIfNeeded();
                }
            });
            _watches = true;
        }
    };

    $scope.searchQuestions = function () {
        if ($scope.terms) {
            $scope.currentPage = 1;
            delete $scope.questions;
            $scope.questions = Question.search({ value: $scope.terms }, function (data, getHeader) {
                $scope.totalItems = data.length;
                $scope.itemsPerPage = data.length;
                angular.forEach($scope.questions, function (question) {
                    question.follows = false;
                    Followings.isFollowing(question.id).then(function (value) {
                        question.follows = value;
                    });
                });
            });
        }
    };

    // fetch question
    $scope.fetchQuestionIfNeeded = function (questionID) {
        if (!$scope.question) {
            $scope.question = Question.get({ id: questionID }, function () {
                $scope.question.follows = false;
                Followings.isFollowing($scope.question.id).then(function (value) {
                    $scope.question.follows = value;
                });
            });
        }
    };

    // fetch comments
    $scope.fetchCommentsIfNeeded = function (question) {
        if (!question.comments || question.comments.length < question.comment_count) {
            Question.comments(
                { id: question.id },
                function (comments) {
                    angular.forEach(comments, function (comment) {
                        populateCreator(comment);
                    });
                    question.comments = comments;
                }
            );
        }
    };

    // follow
    $scope.toggleFollow = function (question) {
        if (question.follows) {
            Followings.remove({ about: question.id, type: 'Question', me: Auth.user().id });
        } else {
            Followings.add({ about: question.id, type: 'Question', creator: Auth.user().id });
        }
        question.follows = !question.follows;
    };

    // vote on a question
    $scope.vote = function (question, dir) {
        Question.vote({ id: question.id },
                      { creator: Auth.user().id, about: question.id, dir: dir },
                      function (response) { question.rank = response.rank; }
        );
    };

    $scope.createComment = function (question) {
        $scope.temp = {
            comment: {
                about:   question.id,
                creator: Auth.user().id
            }
        };
    };

    $scope.cancel = function () {
        delete $scope.temp.comment;
    };

    $scope.save = function (form) {
        if(form.$valid){
            Question.comment({ id: $scope.temp.comment.about }, $scope.temp.comment, function (result) {
                if (typeof $scope.question.comments === 'undefined') {
                    $scope.question.comments = [];
                }
                populateCreator(result);
                $scope.question.comments.unshift(result);
                $scope.question.comment_count += 1;
                delete $scope.temp.comment;
            });
        }
    };

    $scope.filterAnnotations = function (question, type) {
        $scope.filteredAnnotations = [];
        $scope.type = type;
        angular.forEach(question[type], function (annotation) {
            if (annotation.type === 'statement') {
                Array.prototype.push.apply($scope.filteredAnnotations,
                                            _.map(annotation.triples, function (t) {
                                                t.type = 'statement';
                                                return t;
                                            }));
            } else {
                $scope.filteredAnnotations.push(annotation);
            }
        });
    };
});

