'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('AuthenticationCtrl', function($rootScope, $route, $routeParams, $scope, $location, $cookies, Auth, Alert, Backend) {
    $scope.login = {
        submit: function (form) {
            if (form.$valid) {
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
        }
    };

    $scope.register = {
        code:   $routeParams.code ? $routeParams.code : '',
        submit: function (form) {
            if (form.$valid) {
                if ($scope.register.password1 !== $scope.register.password2) {
                    Alert.add({ type: 'error', message: 'Both passwords must match.' });
                } else {
                    Auth.register(
                        $scope.register,
                        function () {
                            $location.path('/');
                        },
                        function (error) {
                            if (error.status === 400) {
                                Alert.add({ type: 'error', message: error.data });
                            }
                        }
                    );
                }
            }
        }
    };

    $scope.request = {
        submit: function (form) {
            if (form.$valid) {
                Backend.request(
                    {}, { email: $scope.request.email },
                    function () {
                        $location.path('/');
                    },
                    function (error) {
                        Alert.add({ type: 'error', message: error.data });
                    }
                );
            }
        }
    }; 


    $scope.reset = {
        code:   $routeParams.code,
        submit: function (form) {
            if (form.$valid) {
                if ($scope.reset.password1 !== $scope.reset.password2) {
                    Alert.add({ type: 'error', message: 'Both passwords must match.' });
                } else {
                    Backend.reset({}, $scope.reset,
                                function () {
                                    $location.path('/');
                                },
                                function (error) {
                                    Alert.add({ type: 'error', message: error.data });
                                });
                }
            }
        }
    };

    $scope.authentication = {
        section: 'login'
    };

    if ($location.path().indexOf('/reset') === 0) {
        if ($routeParams.code) {
            $scope.authentication.section = 'reset';
        } else {
            $location.path('/');
        }
    }

    if ($location.path().indexOf('/request') === 0) {
        $scope.authentication.section = 'request';
    }

    if ($location.path().indexOf('/register') === 0) {
        $scope.authentication.section = 'register';
    }
});
