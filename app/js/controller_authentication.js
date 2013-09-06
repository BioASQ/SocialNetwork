'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('AuthenticationCtrl', function($rootScope, $routeParams, $scope, $location, Me, Activity) {
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
        Me.login($scope.login,
            function (user, headers) {
                if(user.id !== 'anonymous'){
                    $rootScope.me = user;
                    Activity.following({ id: user.id }, function (result) {
                        $rootScope.cache.followings = result.map(function (f) {
                            return f.about;
                        });
                    });
                    $location.path( "home" );
                }
            },
            function(response) {
                $scope.login.error = response;
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
