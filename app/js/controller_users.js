'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('UsersCtrl', function($scope, User, Auth) {
    $scope.currentPage = 1;
    $scope.itemsPerPage = 5;
    $scope.sortProperty = 'last_name';

    $scope.$watch('sortProperty', function() {
        $scope.currentPage = 1;
        delete $scope.users;
        var options = {
            limit: $scope.itemsPerPage,
            offset: ($scope.currentPage - 1) * $scope.itemsPerPage,
            sort: $scope.sortProperty
        };

        $scope.users = User.query(options);
    });
});
