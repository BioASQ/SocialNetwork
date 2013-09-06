'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('AuthenticationCtrl', function($rootScope, $routeParams, $scope, $location, MeRes, Activity) {
    $scope.currentCtrl = 'AuthenticationCtrl';

    $scope.register = {
        email: '',
        password: '',
        fist_name: '',
        last_name: '',
        code : $routeParams['code'] ? $routeParams['code'] : '',
        error: ''
    };

    $scope.login = {
        email: '',
        password: '',
        error: ''
    };

    $scope.authentication = {
         //'login', 'register', 'remember'
        section:  $scope.register.code === '' ? 'login' :  'register',
        setSection: function(value){
            this.section = value;
        }
    };
    
    $scope.login.submit = function(){
        MeRes.login({id: $scope.login.email, password: $scope.login.password},
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
    }

    $scope.register.submit = function(){  
    }
});
