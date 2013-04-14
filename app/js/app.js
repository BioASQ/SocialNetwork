'use strict';

var BioASQ = angular.module('BioASQ',['ngResource','$strap.directives']);

BioASQ.config(['$routeProvider', function($routeProvider) {

    $routeProvider.when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeCtrl'
    });

    $routeProvider.when('/timeline', {
        templateUrl: 'partials/timeline.html',
        controller: 'TimelineCtrl'
    });

    $routeProvider.when('/message', {
        templateUrl: 'partials/messages.html',
        controller: 'MessageCtrl'
    });

    $routeProvider.when('/users/:creator', {
        templateUrl: 'partials/user.html',
        controller: 'UserCtrl'
    });

    $routeProvider.otherwise({
        redirectTo: '/home'
    });
}]);