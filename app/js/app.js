'use strict';

var BioASQ = angular.module('BioASQ', ['ngResource', 'ui.bootstrap', 'ui']);

BioASQ.pages = ['home', 'timeline', 'messages'];
BioASQ.pagesCtrl = ['HomeCtrl', 'TimelineCtrl', 'MessageCtrl'];

BioASQ.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {

        angular.forEach(BioASQ.pages, function(value, key) {
            $routeProvider.when('/' + value, {
                templateUrl: 'templates/' + value + '.html',
                controller: BioASQ.pagesCtrl[key]
            });
        });

        $routeProvider.when('/users/:creator', {
            templateUrl: 'templates/user.html',
            controller: 'UserCtrl'
        });

        $routeProvider.otherwise({
            redirectTo: '/' + BioASQ.pages[0]
        });

        $locationProvider.html5Mode(false).hashPrefix('!');
    }
]);

BioASQ.run(function ($rootScope, $timeout, Me, Activity) {
    $rootScope.pages = BioASQ.pages;
    $rootScope.cache = {
        followings: []
    };
    $rootScope.me = {
        id: 'anonymous'
    };

    Me.login(function (user) {
        $rootScope.me = user;
        Activity.following({ id: user.id }, function (result) {
            $rootScope.cache.followings = result.map(function (f) {
                return f.about;
            });
        });
    });
    $rootScope.pages = BioASQ.pages;
});
