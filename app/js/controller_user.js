'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('UserCtrl', function ($routeParams, $scope, $rootScope, $modal, $location, $http, Activity, User, Auth, Followings, Username, Alert, Rewards) {
    var userID     = $routeParams.creator;
    $scope.me      = Auth.user();
    $scope.follows = false;

    User.get({ id: userID },function(user){
        $scope.user = Rewards.forUsers([user])[0];
    });

    $scope.itemsPerPage = 10;
    $scope.currentPage  = 1;

    function populate(message, key) {
        message[key] = {
            id:   message[key],
            name: Username.get(message[key])
        };
    }

    function fetchActivitiesIfNeeded() {
        var options = {
            limit: $scope.itemsPerPage,
            offset: ($scope.currentPage - 1) * $scope.itemsPerPage
        };
        if (!$scope.activities) {
            switch ($scope.section) {
            case 'activities':
                $scope.activities = Activity.query(options, { id: $routeParams.creator }, populateCreators);
                break;
            case 'followings':
                $scope.activities = Activity.following(options, { id: $routeParams.creator }, populateCreators);
                break;
            case 'followers':
                $scope.activities = Activity.followers(options, { id: $routeParams.creator }, populateCreators);
                break;
            }
        }
    }

    function populateCreators(activities, getHeader) {
        var resultSize = parseInt(getHeader('X-Result-Size'), 10);
        $scope.totalItems = resultSize;
        angular.forEach(activities, function (activity) {
            populate(activity, 'creator');
            if (activity.type === 'Follow' && activity.about_type === 'User') {
                populate(activity, 'about');
            }
        });
    }

    $scope.$watch('section', function () {
        $scope.currentPage = 1;
        delete $scope.activities;
        fetchActivitiesIfNeeded();
    });

    $scope.$watch('currentPage', function () {
        delete $scope.activities;
        fetchActivitiesIfNeeded();
    });

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
            $scope.activities = Activity.followers({}, { id: $routeParams.creator }, populateCreators);
        }
    };

    $scope.signout = function () {
        Auth.signout(function () {
            $location.path('/');
        });
    };

    $scope.preferencesOpen = function () {
        User.details({ id: Auth.user().id }, function (details) {
            $scope.userDetails = details;
            var modal = $modal.open({
                templateUrl: 'templates/partials/preferences.html',
                backdrop: true,
                scope: $scope,
                windowClass: 'modal-wide'
            });
            $scope.modal = modal;

            modal.result.then(function () {
                delete $scope.userDetails;
            }, function () {
                delete $scope.userDetails;
            });
        });
    };

    $scope.preferencesSave = function (form) {
        if(form.$valid){
            if($scope.userDetails.password1 !== $scope.userDetails.password2){
                Alert.add({ type: 'error', message: 'New passwords must match!' });
            }else{
                User.preferences({ id: Auth.user().id }, $scope.userDetails, function () {
                    Alert.add({ type: 'success', message: 'Preferences saved.' });
                    $scope.modal.close();
                    delete $scope.modal;
                }, function (error) {
                    if (error.status === 401) {
                        Alert.add({ type: 'error', message: 'Invalid password!' });
                    }
                    if (error.status === 400) {
                        Alert.add({ type: 'error', message: 'Email address already in use!' });
                    }
                });
            }
        }
    };

    $scope.inviteOpen = function () {
        $scope.invite = {};
        var modal = $modal.open({
                templateUrl: 'templates/partials/invite.html',
                backdrop: true,
                scope: $scope,
                windowClass: 'modal-wide'
        });
        $scope.modal = modal;

        modal.result.then(function () {
            delete $scope.invite;
        }, function () {
            delete $scope.invite;
        });
    }

    $scope.sendInvite = function (form) {
        if (form.$valid) {
            $http.post('/invite', $scope.invite)
            .success(function (data) {
                alert($scope.invite.name + ' successfully invited');
                $scope.modal.close();
                delete $scope.modal;
            })
            .error(function (data, status) {
                alert('invitation failed: ' + data);
                $scope.modal.close();
                delete $scope.modal;
            });
        }
    }

    $scope.isSeniorUser = function () {
        return Auth.isSeniorUser();
    }
});
