'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('AlertCtrl', function ($scope, Alert) {
    $scope.close = function (index) {
        Alert.remove(index);
    };
});
