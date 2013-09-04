'use strict';

var BioASQ = angular.module('BioASQ');

BioASQ.controller('LoginCtrl', function($routeParams, $scope, $location) {
    $scope.currentCtrl = 'LoginCtrl';

    $scope.login = {};
    $scope.login.submit = function(){
        //TODO
        $location.path( "home" );
    };
});
