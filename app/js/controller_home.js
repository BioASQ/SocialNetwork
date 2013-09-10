'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('HomeCtrl', function($scope, Activity, Auth) {
    $scope.me = Auth.user();
    $scope.$watch('me', function () {
        $scope.activities = Activity.home({ id: Auth.user().id }, function () {
            $scope.activitiesFetched = true;
        });
    });
});
