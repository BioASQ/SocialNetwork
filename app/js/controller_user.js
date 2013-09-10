'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('UserCtrl', function ($routeParams, $scope, $modal, Activity, User) {
    $scope.currentCtrl = 'UserCtrl';

    $scope.$watch('section', function () {
        switch ($scope.section) {
        case 'activities':
            $scope.activities = Activity.query({}, { id: $routeParams.creator });
            break;
        case 'followings':
            $scope.activities = Activity.following({}, { id: $routeParams.creator });
            break;
        case 'followers':
            $scope.activities = Activity.followers({}, { id: $routeParams.creator });
            break;
        }
    });

    var userID = $routeParams.creator;
    $scope.user = User.get({ id: userID });
    $scope.$watch('cache', function () {
        $scope.follows = ($scope.cache.followings.indexOf(userID) > -1);
    }, true);

    $scope.toggleFollow = function () {
        if ($scope.follows) {
            User.unfollow({ id: userID, me: $scope.me.id }, function () {
                delete $scope.cache.followings[$scope.cache.followings.indexOf(userID)];
            });
        } else {
            User.follow({ id: userID }, { about: $scope.me.id }, function () {
                $scope.cache.followings.push(userID);
            });
        }
        if ($scope.section === 'followers') {
            $scope.activities = Activity.followers({}, { id: $routeParams.creator });
        }
    };

    $scope.preferences = function () {
        User.details({ id: $scope.me.id }, function (details) {
            $scope.userDetails = details;
            var modal = $modal.open({
                templateUrl: 'templates/partials/preferences.html',
                backdrop: true,
                scope: $scope,
            });
            modal.result.then(function () {
                User.preferences({ id: $scope.me.id }, $scope.userDetails, function () {
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
