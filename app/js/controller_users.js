'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('UsersCtrl', function($scope, User, Rewards) {

    $scope.currentPage = 1;
    $scope.itemsPerPage = 5;
    $scope.sortProperty = 'last_name';
    $scope.totalItems = 0;

    $scope.fetchUsers = function() {
        var options = {
            limit: $scope.itemsPerPage,
            offset: ($scope.currentPage - 1) * $scope.itemsPerPage,
            sort: $scope.sortProperty,
            search: $scope.query
        };
        delete $scope.users;
        User.query(options, function(results, getHeader) {
            var resultSize = parseInt(getHeader('X-Result-Size'), 10);
            $scope.totalItems = resultSize;
            $scope.users = Rewards.forUsers(results);
        });
    };

    $scope.$watch('sortProperty', function() {
        $scope.currentPage = 1;
        $scope.query = '';
        $scope.fetchUsers();
    });

    $scope.$watch('currentPage', function() {
        $scope.fetchUsers();
    });

    $scope.searchUsers = function() {
        $scope.currentPage = 1;
        $scope.fetchUsers();
    };
});
