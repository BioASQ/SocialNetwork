'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('NavigationCtrl', function ($scope, $window, Auth) {
    $scope.me   = Auth.user();
    $scope.name = Auth.name();

    $scope.back = function(){
        $window.history.back();
    }
});
