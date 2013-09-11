'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('HomeCtrl', function($scope, Activity, Auth, Username) {
    $scope.me = Auth.user();
    $scope.$watch('me', function () {
        $scope.activities = Activity.home({ id: Auth.user().id }, function (results) {
            $scope.activitiesFetched = true;
            angular.forEach(results, function (activity) {
                activity.creator = {
                    id:   activity.creator,
                    name: Username.get(activity.creator)
                };
            });
        });
    });
});
