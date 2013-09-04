'use strict';

var BioASQ = angular.module('BioASQ', ['bioasq.filter', 'bioasq.resources', 'ngSanitize', 'ui.bootstrap', 'ui']);

BioASQ.config(['$provide', '$routeProvider', function ($provide, $routeProvider) {
    var pageControllers = {
        home:      'HomeCtrl',
        messages:  'MessageCtrl',
        timeline:  'TimelineCtrl',
        questions: 'QuestionController'
    };

    var pages = [];
    angular.forEach(pageControllers, function (controllerName, page) {
        $routeProvider.when('/' + page, {
            templateUrl: 'templates/' + page + '.html',
            controller:  controllerName
        });
        pages.push(page);
    });

    $provide.value('pages', pages);
}]);

BioASQ.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.when('/users/:creator', {
        templateUrl: 'templates/user.html',
        controller: 'UserCtrl'
    });

    $routeProvider.when('/registration/:code', {
        templateUrl: 'templates/registration.html',
        controller: 'RegistrationCtrl'
    });

    $routeProvider.when('/registration', {
        templateUrl: 'templates/registration.html',
        controller: 'RegistrationCtrl'
    });

    $routeProvider.otherwise({
        //redirectTo: '/' + BioASQ.pages[0]
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    });

    $locationProvider.html5Mode(false).hashPrefix('!');
}]);

BioASQ.run(function (pages, $rootScope, Me, Activity) {
    $rootScope.pages = pages;
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
});
