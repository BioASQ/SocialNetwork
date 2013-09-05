'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('UserCtrl', function ($routeParams, $scope, Activity, User, modalFactory) {
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
});
