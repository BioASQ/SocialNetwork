'use strict';

/**
 *
 */
BioASQ.UserCtrl = function($routeParams, $scope, Activity, User, Users, modalFactory) {
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

    // user id
    var id = $routeParams.creator;
    Users.getFollowingIds($scope.me.id, function(data) {
        var followingIds = data;
        Users.getUser(id, function(data) {
            $scope.user = data !== null ? data : "error";
            $scope.user.follows = followingIds.indexOf(id) == -1 ? false : true;
        });
    });

    $scope.follow = function() {
        User.follow({ id: $routeParams.creator }, { about: $scope.me.id }, function () {
            $scope.user.follows = !$scope.user.follows;
        });
    };

    // modal dialog
    modalFactory.setCacheData({
        title: '',
        message: ''
    });
    $scope.openDialog = function(data) {
        modalFactory.openDialog(modalFactory.options('templates/partials/modal_comment.html', 'DialogCtrl', data), function() {
            // update table if open
            if ($scope.radioModel == 'comments') {
                $scope.showComments(id); // hide
                $scope.showComments(id); // show
            }
        });
    };
};

BioASQ.controller('UserCtrl', BioASQ.UserCtrl);
