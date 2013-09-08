'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('AuthenticationCtrl', function($rootScope, $routeParams, $scope, $location, $cookies, MeService, Me) {
    $scope.currentCtrl = 'AuthenticationCtrl';

    $scope.login = {
        email: '',
        password: ''
    };

    $scope.register = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        code : $routeParams['code'] ? $routeParams['code'] : ''
    };

    $scope.remember = {
        email: ''
    };

    $scope.authentication = {
         //'login', 'register', 'remember'
        section:  $scope.register.code === '' ? 'login' :  'register',
        setSection: function(value){
            this.section = value;
        }
    };
    
    $scope.login.submit = function(){
        $scope.login.id = $scope.login.email;
        MeService.login($scope.login,
            function(user){
                if(user.data.id !== 'anonymous'){
                    $rootScope.me = user.data;
                    $rootScope.cache.followings = user.followings;
                    $cookies.id = user.data.id;
                    $location.path( "home" );
                }
            },
            function(error){
                // TODO
            }
        );
    };

    $scope.register.submit = function(){
        Me.register($scope.register,
            function (data, headers) {
                // TODO: data
                $location.path( "authentication" );
            },
            function(response) {
                $scope.register.error = response;
            }
        );
    };

    $scope.remember.submit = function(){
        Me.remember($scope.remember,
            function (data, headers) {
                // TODO: data
                $location.path( "authentication" );
            },
            function(response) {
                $scope.remember.error = response;
            }
        );
    };
});
