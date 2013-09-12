'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('AuthenticationCtrl', function($rootScope, $routeParams, $scope, $location, $cookies, Auth, Alert) {
    $scope.currentCtrl = 'AuthenticationCtrl';

    $scope.login = {
        id: '',
        password: ''
    };

    $scope.register = {
        email: '',
        first_name: '',
        last_name: '',
        password1: '',
        password2: '',
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
    
    $scope.login.submit = function (form) {
        if(form.$valid){
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
        }
    };

    $scope.register.submit = function (form) {
        if(form.$valid){
            if($scope.register.password1 !== $scope.register.password2){
                Alert.add({ type: 'error', message: 'Passwords must match!' });
            }else{
                Auth.register(
                    $scope.register,
                    function () {
                        $location.path('/signin');
                    },
                    function (error) {
                        if (error.status === 400) {
                            Alert.add({ type: 'error', message: 'Email address already in use!' });
                        }
                    }
                );
            }
        }
    };

    $scope.remember.submit = function (form) {
        if(form.$valid){
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
        }
    };
});
