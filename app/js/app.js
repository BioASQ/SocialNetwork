'use strict';

var BioASQ = angular.module('BioASQ',['ngResource', 'ui.bootstrap', 'ui']);

BioASQ.pages = ['home', 'timeline', 'message'];

BioASQ.config(['$routeProvider', function($routeProvider) {

    $routeProvider.when('/' + BioASQ.pages[0], {
        templateUrl: 'partials/' + BioASQ.pages[0] + '.html',
        controller: 'HomeCtrl'
    });

    $routeProvider.when('/' + BioASQ.pages[1], {
        templateUrl: 'partials/' + BioASQ.pages[1] + '.html',
        controller: 'TimelineCtrl'
    });

    $routeProvider.when('/' + BioASQ.pages[2], {
        templateUrl: 'partials/' + BioASQ.pages[2] + '.html',
        controller: 'MessageCtrl'
    });

    $routeProvider.when('/users/:creator', {
        templateUrl: 'partials/user.html',
        controller: 'UserCtrl'
    });

    $routeProvider.otherwise({
        redirectTo: '/' + BioASQ.pages[0]
    });
}]);


BioASQ.run(function($rootScope, Me) {

    $rootScope.pages = BioASQ.pages;

    Me.login(function(){
        $rootScope.me = Me.data;
    });
});
