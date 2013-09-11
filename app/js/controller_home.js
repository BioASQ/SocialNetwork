'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('HomeCtrl', function($scope, Activity, Auth, Username) {
    function populate(message, key) {
        message[key] = {
            id:   message[key],
            name: Username.get(message[key])
        };
    }

    $scope.me = Auth.user();
    $scope.$watch('me', function () {
        $scope.activities = Activity.home({ id: Auth.user().id }, function (results) {
            $scope.activitiesFetched = true;
            angular.forEach(results, function (activity) {
                populate(activity, 'creator');
                if (activity.type === 'Follow' && activity.about_type === 'User') {
                    populate(activity, 'about');
                }
            });
        });
    });
});
