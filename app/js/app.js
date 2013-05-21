'use strict';

var BioASQ = angular.module('BioASQ',['ngResource', 'ui.bootstrap', 'ui']);

BioASQ.pages =      ['home', 'timeline', 'messages'];
BioASQ.pagesCtrl =  ['HomeCtrl', 'TimelineCtrl', 'MessageCtrl'];

BioASQ.config(['$routeProvider', '$locationProvider', function($routeProvider,$locationProvider) {

    angular.forEach(BioASQ.pages , function(value, key){
        $routeProvider.when('/' + value, {
            templateUrl: 'partials/' + value + '.html',
            controller: BioASQ.pagesCtrl[key]
        });
    });

    $routeProvider.when('/users/:creator', {
        templateUrl: 'partials/user.html',
        controller: 'UserCtrl'
    });

    $routeProvider.otherwise({
        redirectTo: '/' + BioASQ.pages[0]
    });

    $locationProvider.html5Mode(false).hashPrefix('!');
}]);


BioASQ.run(function($rootScope, Me) {

    $rootScope.pages = BioASQ.pages;

    Me.login(function(data){
        $rootScope.me = data;
    });

});
