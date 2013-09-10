'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('AuthenticationCtrl', function($rootScope, $routeParams, $scope, $location, $cookies, Auth, Alert) {
    $scope.currentCtrl = 'AuthenticationCtrl';

    $scope.login = {
        email: '',
        password: ''
    };

    $scope.register = {
        email: '',
        password: '',
        first_name: '',
        last_name: '',
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
    
    $scope.login.submit = function () {
        $scope.login.id = $scope.login.email;
        Auth.signin(
            $scope.login,
            function (user) {
                $location.path('/');
            }, function (error) {
                if (error.status === 401) {
                    Alert.add({ type: 'error', message: 'Invalid login!' });
                }
            }
        );
    };

    $scope.register.submit = function(){
        console.log('register');
        Auth.register(
            $scope.register,
            function () {
                $location.path('/signin');
            },
            function (error) {
                $scope.register.error = error;
            }
        );
    };

    $scope.remember.submit = function(){
        /*
         * MeService.Me.remember($scope.remember,
         *     function (data, headers) {
         *         // TODO: data
         *         $location.path( "authentication" );
         *     },
         *     function(response) {
         *         $scope.remember.error = response;
         *     }
         * );
         */
    };
});
