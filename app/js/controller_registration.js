'use strict';

var BioASQ = angular.module('BioASQ');

BioASQ.controller('RegistrationCtrl', function ($routeParams, $scope, $location) {
    $scope.currentCtrl = 'RegistrationCtrl';

    $scope.registration = {
        code : $routeParams['code'] ? $routeParams['code'] : ''
    };

    $scope.registration.cancle = function () {
        $location.path('login');
    };

    $scope.registration.submit = function () {
        // TODO
    };
});
