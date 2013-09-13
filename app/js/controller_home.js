'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('HomeCtrl', function($scope, Activity, Auth, Username) {
    $scope.me = Auth.user();
    $scope.currentPage  = 1;
    $scope.itemsPerPage = 10;

    function populate(message, key) {
        message[key] = {
            id:   message[key],
            name: Username.get(message[key])
        };
    }

    function fetchHomeIfNeeded() {
        if (!$scope.activities) {
            var options = {
                id:     Auth.user().id,
                limit:  $scope.itemsPerPage,
                offset: ($scope.currentPage - 1) * $scope.itemsPerPage
            };
            $scope.activities = Activity.home(options, function (results, getHeader) {
                var resultSize = parseInt(getHeader('X-Result-Size'), 10);
                $scope.totalItems = resultSize;
                $scope.activitiesFetched = true;
                angular.forEach(results, function (activity) {
                    populate(activity, 'creator');
                    if (activity.type === 'Follow' && activity.about_type === 'User') {
                        populate(activity, 'about');
                    }
                });
            });
        }
    }

    $scope.$watch('me', function () {
        delete $scope.activities;
        $scope.activitiesFetched = false;
        fetchHomeIfNeeded();
    });

    $scope.$watch('currentPage', function () {
        delete $scope.activities;
        $scope.activitiesFetched = false;
        fetchHomeIfNeeded();
    });
});
