'use strict';

BioASQ.HomeCtrl = function($scope, Activity, modalFactory) {
    $scope.currentCtrl = 'HomeCtrl';
    $scope.activities  = Activity.home({ id: $scope.me.id });
};

BioASQ.controller('HomeCtrl', BioASQ.HomeCtrl);
