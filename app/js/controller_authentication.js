'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('AuthenticationCtrl', function($rootScope, $routeParams, $scope, $location, $cookies, MeService, Alert) {
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
            function (error) {
                if (error.status === 401) {
                    Alert.add({ type: 'error', message: 'Invalid login!' });
                }
            }
        );
    };

    $scope.register.submit = function(){
        console.log('register');
        MeService.Me.register($scope.register,
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
        MeService.Me.remember($scope.remember,
            function (data, headers) {
                // TODO: data
                $location.path( "authentication" );
            },
            function(response) {
                $scope.remember.error = response;
            }
        );
    };

    $scope.preferences = {
        clicked: false,
        click: function (){
            this.clicked = !this.clicked;
            if(this.clicked){
                 $scope.register = MeService.user.data;
            }
        }
    };
});
