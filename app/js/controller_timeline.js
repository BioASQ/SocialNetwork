'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('TimelineCtrl', function ($scope, Activity, Username) {
    $scope.currentPage  = 1;
    $scope.itemsPerPage = 10;

    function populate(message, key) {
        message[key] = {
            id:   message[key],
            name: Username.get(message[key])
        };
    }

    $scope.fetchActivitiesIfNeeded = function () {
        if (!$scope.activities) {
            var options = {
                limit:  $scope.itemsPerPage,
                offset: ($scope.currentPage - 1) * $scope.itemsPerPage
            };
            $scope.activities = Activity.global(options, {}, function (results, getHeader) {
                var resultSize = parseInt(getHeader('X-Result-Size'), 10);
                $scope.totalItems = resultSize;
                angular.forEach(results, function (activity) {
                    populate(activity, 'creator');
                    if (activity.type === 'Follow' && activity.about_type === 'User') {
                        populate(activity, 'about');
                    }
                });
            });
        }
    };

    $scope.$watch('currentPage', function () {
        delete $scope.activities;
        $scope.fetchActivitiesIfNeeded();
    });
});
