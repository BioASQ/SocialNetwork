'use strict';

var BioASQ = angular.module('BioASQ');

BioASQ.controller('HomeCtrl', function($scope, Activity, modalFactory) {
    $scope.currentCtrl = 'HomeCtrl';
    $scope.$watch('me.id', function () {
        $scope.activities = Activity.home({ id: $scope.me.id }, function () {
            $scope.activitiesFetched = true;
        });
    });
});
