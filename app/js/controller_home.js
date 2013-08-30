'use strict';

/**
 *
 */
BioASQ.HomeCtrl = function($scope, User, Question, Comment, modalFactory) {
    $scope.currentCtrl = 'HomeCtrl';
    $scope.questions   = Question.query();

    $scope.$watch('cache.followings.length + questions.length', function () {
        angular.forEach($scope.questions, function (question) {
            question.follows = ($scope.cache.followings.indexOf(question.id) > -1);
        });
    });

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
