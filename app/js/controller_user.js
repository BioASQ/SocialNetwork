'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('UserCtrl', function ($routeParams, $scope, $rootScope, $modal, $location, Activity, User, Auth, Followings, Username) {

    function populateCreators(activities) {
        angular.forEach(activities, function (activity) {
            activity.creator = {
                id:   activity.creator,
                name: Username.get(activity.creator)
            };
        });
    };

    $scope.$watch('section', function () {
        switch ($scope.section) {
        case 'activities':
            $scope.activities = Activity.query({}, { id: $routeParams.creator }, populateCreators);
            break;
        case 'followings':
            $scope.activities = Activity.following({}, { id: $routeParams.creator }, populateCreators);
            break;
        case 'followers':
            $scope.activities = Activity.followers({}, { id: $routeParams.creator }, populateCreators);
            break;
        }
    });

    var userID     = $routeParams.creator;
    $scope.me      = Auth.user();
    $scope.user    = User.get({ id: userID });
    $scope.follows = false;

    Followings.isFollowing(userID).then(function (value) {
        $scope.follows = value;
    });

    $scope.toggleFollow = function () {
        if ($scope.follows) {
            Followings.remove({ about: userID, type: 'User', me: Auth.user().id });
        } else {
            Followings.add({ about: userID, type: 'User', me: Auth.user().id });
        }
        $scope.follows = !$scope.follows;

        // TODO: generic notification service
        if ($scope.section === 'followers') {
            $scope.activities = Activity.followers({}, { id: $routeParams.creator });
        }
    };

    $scope.signout = function () {
        Auth.signout(function () {
            $location.path('/');
        });
    };

    $scope.preferences = function () {
        User.details({ id: Auth.user().id }, function (details) {
            $scope.userDetails = details;
            var modal = $modal.open({
                templateUrl: 'templates/partials/preferences.html',
                backdrop: true,
                scope: $scope,
                windowClass: 'modal-wide'
            });
            modal.result.then(function () {
                User.preferences({ id: Auth.user().id }, $scope.userDetails, function () {
                    console.log('preferences saved');
                    delete $scope.userDetails;
                }, function () {
                    console.error('error saving prefs');
                });
            }, function () {
                delete $scope.userDetails;
            });
        });
    };
});
