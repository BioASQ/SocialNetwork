'use strict';

BioASQ.LoginCtrl = function($routeParams, $scope, $location) {
    $scope.currentCtrl = 'LoginCtrl';

    $scope.login = {};
    $scope.login.submit = function(){
        //TODO
        $location.path( "home" );
    };
};

BioASQ.controller('LoginCtrl', BioASQ.LoginCtrl);
