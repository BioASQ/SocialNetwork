'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('LoginCtrl', function($routeParams, $scope, $location) {
    $scope.currentCtrl = 'LoginCtrl';

    $scope.login = {};
    $scope.login.submit = function(){
        //TODO
        $location.path( "home" );
    };
});
