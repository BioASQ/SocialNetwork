'use strict';

BioASQ.RegistrationCtrl = function($routeParams, $scope) {
    $scope.currentCtrl = 'RegistrationCtrl';

    $scope.registration = {
        code : $routeParams['code'] ? $routeParams['code'] : ''
    }
};

BioASQ.controller('RegistrationCtrl', BioASQ.RegistrationCtrl);
