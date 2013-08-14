'use strict';

/**
 *
 */
BioASQ.UserCtrl = function($routeParams, $scope, Users, modalFactory) {
    $scope.currentCtrl = 'UserCtrl';

    // user id
    var id = $routeParams.creator;
    Users.getFollowingIds($scope.me.id, function(data) {
        var followingIds = data;
        Users.getUser(id, function(data) {
            $scope.user = data !== null ? data : "error";
            $scope.user.follows = followingIds.indexOf(id) == -1 ? false : true;
        });
    });

    $scope.showFollowing = function() {
        Users.getFollowing(id, function(data) {
            $scope.data = data;
        });
    };
    // default
    $scope.showFollowing(id);

    $scope.showFollowers = function() {
        Users.getFollowers(id, function(data) {
            $scope.data = data;
        });
    };

    $scope.follow = function() {
        Users.follow($scope.me.id, $scope.user.id, function() {
            // update table if open
            if ($scope.radioModel == 'followers')
                $scope.showFollowers();
        });
    };

    // modal dialog
    modalFactory.setCacheData({
        title: '',
        message: ''
    });
    $scope.openDialog = function(data) {
        modalFactory.openDialog(modalFactory.options('partials/templates/modal_comment.html', 'DialogCtrl', data), function() {
            // update table if open
            if ($scope.radioModel == 'comments') {
                $scope.showComments(id); // hide
                $scope.showComments(id); // show
            }
        });
    };
    // show comments
    $scope.comments = [];
    $scope.showComments = function(p_id) {
        // hide
        if (typeof $scope.comments[p_id] == 'object') {
            $scope.comments[p_id] = undefined;
        } else {
            // show
            Users.getComments(p_id, function(data) {
                $scope.comments[p_id] = data;
                if (p_id == id) {
                    $scope.data = $scope.comments[p_id];
                }
            });
        }
    };
};

BioASQ.controller('UserCtrl', BioASQ.UserCtrl);
