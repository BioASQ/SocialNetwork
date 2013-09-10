'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('NavigationCtrl', function ($scope, Auth) {
    $scope.me = Auth.user();
});
