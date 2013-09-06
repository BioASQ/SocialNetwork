'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('LoginCtrl', function($rootScope, $scope, $location, MeRes, Activity) {
    $scope.currentCtrl = 'LoginCtrl';

    $scope.login = {
        email: '',
        password: '',
        error: ''
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
});
